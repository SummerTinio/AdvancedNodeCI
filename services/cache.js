// Reusable for other projects

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

// use redisURL defined in config/keys.js to create redis instance
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget); //returns promisified copy of original fxn

// .cache() method  accepts obj as an arg, with property "key"
mongoose.Query.prototype.cache = function(cacheKeyOptions = {}) {
    // sets useCache property on Query instance to 'true'
    this.useCache = true;
    this.topLevelCacheKey = JSON.stringify(cacheKeyOptions.key || '')

    // to make .cache() a chainable method
    return this;
}

//get reference to existing .exec() fxn from mongoose lib
const exec = mongoose.Query.prototype.exec;
//modified .exec fxn
//don't use () => {} syntax, or else 'this' binding will change
// 'this' must still refer to an instance of the query object
mongoose.Query.prototype.exec = async function () {
    // if useCache property is falsy, retrieve data from MongoDB like normal
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    // generating new, consistent Cache Key
    const cacheKey = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    // check if value for that key exists in Redis 
    const existingCacheValue = await client.hget(this.topLevelCacheKey, cacheKey); //sets cacheKeyOptions.key (or '') as top-level hash key

   
    if (existingCacheValue) {
        console.log('yes, existing Cache exists.');
        console.log('CAME FROM REDIS BISH');

         // parsing so V8 understands JSON data we got from Redis
         const doc = JSON.parse(existingCacheValue);

        // checks if Redis data came in an array or obj
        // returns the appropriate document, for proper hydration of [] or {}
        const docToReturnLater = Array.isArray(doc) 
        ? doc.map(obj => new this.model(obj)) 
        : this.model(doc);

        return docToReturnLater;
    }

    // if not yet cached, gets that value from MongoDB
    const freshNewCacheValue = await exec.apply(this, arguments);
    // if (existingCacheValue === freshNewCacheValue) {
    //     return docToReturnLater;
    // }
    // caches that value (document) in Redis
    console.log('newly cached value is', JSON.stringify(freshNewCacheValue));
    client.hset(this.topLevelCacheKey, cacheKey, JSON.stringify(freshNewCacheValue));
    // returns the already-cached document
    return freshNewCacheValue;
}

// import this object, then call .clearHash() passing in the cacheOptionsObj.key to clear before retrieving
module.exports = {
    clearHash(topLevelHashKey) {
        client.del(JSON.stringify(topLevelHashKey))
    }
}