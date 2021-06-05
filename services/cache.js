const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get); //returns promisified copy of original fxn

//get reference to existing .exec() fxn from mongoose lib
const exec = mongoose.Query.prototype.exec;
//modified .exec fxn
//don't use () => {} syntax, or else 'this' binding will change
// 'this' must still refer to an instance of the query object
mongoose.Query.prototype.exec = async function () {
    // generating new, consistent Cache Key
    const cacheKey = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    // check if value for that key exists in Redis 
    const existingCacheValue = await client.get(cacheKey);

    if (existingCacheValue) {
        console.log('skoom');
        console.log('inside the if block, this=', this);

         // parsing so V8 understands JSON data we got from Redis
         const doc = JSON.parse(existingCacheValue);

        // checks if Redis data came in an array or obj
        // returns the appropriate document, for proper hydration of [] or {}
        return Array.isArray(doc) 
        ? doc.map(obj => new this.model(obj)) 
        : this.model(doc);
    }

    // if not yet cached, gets that value from MongoDB
    const freshNewCacheValue = await exec.apply(this, arguments);
    // caches that value (document) in Redis
    console.log('newly cached value is', JSON.stringify(freshNewCacheValue));
    client.set(cacheKey, JSON.stringify(freshNewCacheValue));
    // returns the already-cached document
    return freshNewCacheValue;
}