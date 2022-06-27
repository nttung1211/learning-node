const crypto = require('crypto');
const config = require('./config');

const helpers = {
  jsonToObject(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return {};
    }
  },

  hash(string) {
    if (string && typeof(string) === 'string') {
      return crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
    } else {
      return false;
    }  
  },

  getRandomString(length = 20, chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      randomString += chars[randomNumber];
    }
    return randomString;
  }
};



module.exports = helpers;