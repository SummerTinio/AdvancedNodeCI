const mongoose = require('mongoose');

//get reference to existing .exec() fxn from mongoose lib
const exec = mongoose.Query.prototype.exec;

//modified .exec fxn
//don't use () => {} syntax, or else 'this' binding will change
// 'this' must still refer to an instance of the query object
mongoose.Query.prototype.exec = function () {
    console.log(`i'm about to run a query!`);
    return exec.apply(this, arguments);
}