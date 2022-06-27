const _data = require('../lib/data');
const DB = require('../lib/database');
const helpers = require('../lib/helpers');

const tokens = {
  post(data, callback) {
    const phone = typeof (data.payload.phone) === 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() :
      false;
    const password = typeof (data.payload.password) === 'string' &&
      data.payload.password.trim() ?
      data.payload.password.trim() :
      false;
    
    if (!phone || !password) {
      callback(400, { error: 'Missing fields required.' });
    } else {
      _data.read('users', phone, (err, userData) => {
        if (err) {
          callback(404, { error: 'Could not find any user with this phone number.' });
        } else {
          if (userData.hashedPassword !== helpers.hash(password)) {
            callback(400, { error: 'Password wrong.' });
          } else {
            const token = {
              id: helpers.getRandomString(),
              userPhone: phone,
              expiry: Date.now() + 1000 * 60 * 60
            };
            _data.create('tokens', token.id, token, (err) => {
              if (err) {
                callback(500, { error: 'Could not create token.' });
              } else {
                callback(200, token);
              }
            });
          }
        }
      });
    }
  },
  
  
  get(data, callback) {
    
  },
  
  put(data, callback) {
  
  },
  
  delete(data, callback) {
  
  },


  verifyToken(id, userPhone, callback) {
    _data.read('tokens', id, (err, tokenData) => {
      if (err || tokenData.userPhone !== userPhone || tokenData.expiry <= Date.now()) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },
  
  handler(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();
  
    if (acceptableMethods.includes(method)) {
      tokens[method](data, callback);
    } else {
      callback(405);
    }
  }
};


module.exports = tokens;