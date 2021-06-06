//require Buffer for use in encoding
const Buffer = require('safe-buffer').Buffer;

const Keygrip = require('keygrip');
const keys = require('../../config/keys');
//provide keygrip cookieSigningSecret and sessionString .. to get session.sig
const keygrip = new Keygrip([keys.cookieKey]);


//takes entire Mongoose model -- user
module.exports = user => {
    // fake sessionObject -- looks like a utf-8 parsed session=longWeirdString
    const sessionObject = {
        passport: {
            user: user._id.toString() //since by default Mongoose id's are an obj
        }
    };
    //stringifying that sessionObject and translating it into base64 via toString
    const sessionString = Buffer.from(
        JSON.stringify(sessionObject))
        .toString('base64');

    const sig = keygrip.sign(`session=${sessionString}`); //note: tested sessionString and sig = correct!
    return { session: sessionString, sig: sig }
}