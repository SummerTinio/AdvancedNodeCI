const mongoose = require('mongoose');

const User = mongoose.model('User');

//returns a promise. await it on the other end!
module.exports = () => {
    return new User({}).save();
}
