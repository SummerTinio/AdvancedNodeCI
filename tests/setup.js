//to get rid of error .. it worked. amazing.
Number.prototype._called = {};
//set time limit for each Jest test
jest.setTimeout(30000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise  = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });