const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const DB = require('../lib/database');

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
      const sql = 'SELECT * FROM users WHERE phone = ?;';
      DB.query(sql, phone, (err, userResult) => {
        if (err) {
          console.log(err);
          callback(500, { error: 'Could not select user.' });
        } else if (userResult.length === 0) {
          callback(404, { error: 'Could not find any user with this phone number.' });
        } else {
          if (userResult[0].hashedPassword !== helpers.hash(password)) {
            callback(400, { error: 'Password wrong.' });
          } else {
            const token = {
              id: helpers.getRandomString(),
              userPhone: phone,
              expiry: new Date(Date.now() + 1000 * 60 * 60)
            };
            const sql = 'INSERT INTO tokens SET id = ?, userPhone = ?, expiry = ?;';
            DB.query(sql, token, (err) => {
              if (err) {
                console.log(err);
                callback(500, { error: 'Could not insert token.' });
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
    const sql = 'SELECT * FROM tokens WHERE id = ?;';
    DB.query(sql, id, (err, tokenResult) => {
      if (err) {
        console.log(err);
        callback(false);
      } else {
        if (tokenResult.length === 0 || tokenResult[0].userPhone !== userPhone || tokenResult[0].expiry.getTime() <= Date.now()) {
          callback(false);
        } else {
          callback(true);
        }
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
