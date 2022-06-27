const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const tokens = require('./tokens');
const DB = require('../lib/database');


const users = {
  post(data, callback) {
    const phone = typeof (data.payload.phone) === 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() :
      false;
    const name = typeof (data.payload.name) === 'string' &&
      data.payload.name.trim() ?
      data.payload.name.trim() :
      false;
    const password = typeof (data.payload.password) === 'string' &&
      data.payload.password.trim() ?
      data.payload.password.trim() :
      false;

    if (!phone || !name || !password) {
      callback(400, { error: 'Missing fields required.' });
    } else {
      const sql = "select * from users where phone = ?;";
      DB.query(sql, phone, (err, userResult) => {
        if (err) {
          callback(500, { error: 'Failed to select user' });
        } else if (userResult.length > 0) {
          callback(400, { error: 'This phone number has been used.' });
        } else {
          const user = [
            phone,
            name,
            helpers.hash(password)
          ];

          const sql = "insert into users set phone = ?, name = ? , hashedPassword = ?;";
          DB.query(sql, user, (err) => {
            if (err) {
              callback(500, { error: 'Could not create user' });
            } else {
              callback(200);
            }
          });
        }
      });
    }
  },



  get(data, callback) {
    const phone = typeof (data.queryString.phone) === 'string' &&
      data.queryString.phone.trim().length === 10 ?
      data.queryString.phone.trim() :
      false;

    if (!phone) {
      callback(400, { error: 'Missing fields required.' });
    } else {
      const sql = 'SELECT * FROM users WHERE phone = ?;';
      DB.query(sql, phone, (err, userResult) => {
        if (err) {
          callback(500, { error: 'Failed to select user.' });
        } else if (userResult.length === 0) {
          callback(404, { error: 'Could not find any user with this phone number.' });
        } else {
          const tokenid = typeof (data.headers.tokenid) === 'string' &&
            data.headers.tokenid.trim().length === 20 ?
            data.headers.tokenid.trim() :
            false;

          if (!tokenid) {
            callback(400, { error: 'Missing token in the header or invalid token.' });
          } else {
            tokens.verifyToken(tokenid, phone, (isValid) => {
              if (!isValid) {
                callback(400, { error: 'The token is invalid or has been expired.' });
              } else {
                delete userResult[0].hashedPassword;
                callback(200, userResult[0]);
              }
            });
          }
        }
      });
    }
  },


  put(data, callback) {
    const phone = typeof (data.payload.phone) === 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() :
      false;
    const name = typeof (data.payload.name) === 'string' &&
      data.payload.name.trim() ?
      data.payload.name.trim() :
      false;
    const password = typeof (data.payload.password) === 'string' &&
      data.payload.password.trim() ?
      data.payload.password.trim() :
      false;

    if (!phone) {
      callback(400, { error: 'Missing fields required.' });
    } else {
      if (!name && !password) {
        callback(400, { error: 'Missing fields to update.' });
      } else {
        const sql = 'SELECT * FROM users WHERE phone = ?;';
        DB.query(sql, phone, (err, userResult) => {
          if (err) {
            callback(500, { error: 'Failed to select user.' });
          } else if (userResult.length === 0) {
            callback(404, { error: 'Could not find any user with this phone number.' });
          } else {
            const tokenid = typeof (data.headers.tokenid) === 'string' &&
              data.headers.tokenid.trim().length === 20 ?
              data.headers.tokenid.trim() :
              false;
  
            if (!tokenid) {
              callback(400, { error: 'Missing token in the header or invalid token.' });
            } else {
              tokens.verifyToken(tokenid, phone, (isValid) => {
                if (!isValid) {
                  callback(400, { error: 'The token is invalid or has been expired.' });
                } else {
                  const updateData = [];
                  updateData.push(name ? name : userResult[0].name);
                  updateData.push(password ? helpers.hash(password) : userResult[0].hashedPassword);
                  updateData.push(phone);
          
                  const sql = 'UPDATE users SET name = ?, hashedPassword = ? WHERE phone = ?;';
                  DB.query(sql, updateData, (err) => {
                    if (err) {
                      callback(500, { error: 'Could not update user' });
                    } else {
                      callback(200);
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
  },

  delete(data, callback) {
    const phone = typeof (data.payload.phone) === 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() :
      false;

    if (!phone) {
      callback(404, { error: 'Missing fields required.' });
    } else {
      const sql = 'SELECT * FROM users WHERE phone = ?;';
      DB.query(sql, phone, (err, userResult) => {
        if (err) {
          callback(500, { error: 'Failed to select user.' });
        } else if (userResult.length === 0) {
          callback(404, { error: 'Could not find any user with this phone number.' });
        } else {
          const tokenid = typeof (data.headers.tokenid) === 'string' &&
            data.headers.tokenid.trim().length === 20 ?
            data.headers.tokenid.trim() :
            false;

          if (!tokenid) {
            callback(400, { error: 'Missing token in the header or invalid token.' });
          } else {
            tokens.verifyToken(tokenid, phone, (isValid) => {
              if (!isValid) {
                callback(400, { error: 'The token is invalid or has been expired.' });
              } else {
                const sql = 'DELETE FROM users WHERE phone = ?;';
                DB.query(sql, phone, (err) => {
                  if (err) {
                    callback(500, { error: 'Could not delete user' });
                  } else {
                    callback(200);
                  }
                });
              }
            });
          }
        }
      });
    }
  },

  handler(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();

    if (acceptableMethods.includes(method)) {
      users[method](data, callback);
    } else {
      callback(405);
    }
  }
};


module.exports = users;