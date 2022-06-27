const config = require('./config');
const _data = require('./data');
const helpers = require('./helpers');


let handlers = {};

/* 
***********************************************************************************
***********************************************************************************
                                  \USERS
***********************************************************************************
***********************************************************************************
*/
handlers._users = {};

handlers._users.post = (data, callback) => {
  const firstname = typeof (data.payload.firstname) === 'string' && data.payload.firstname.trim() ? data.payload.firstname.trim() : false;
  const lastname = typeof (data.payload.lastname) === 'string' && data.payload.lastname.trim() ? data.payload.lastname.trim() : false;
  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) === 'string' && data.payload.password.trim() ? data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' ? data.payload.tosAgreement : false;

  if (firstname && lastname && phone && password && tosAgreement) {
    _data.read('users', phone, err => {
      if (err) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          _data.myCreate(
            'users',
            phone,
            {
              firstname,
              lastname,
              phone,
              hashedPassword,
              tosAgreement: true
            },
            err => {
              if (err) {
                console.log(err);
                callback(500, { error: 'could not create new user' });
              } else {
                callback(200);
              }
            }
          );
        } else {
          callback(500, { error: 'Failed to hash password' });
        }
      } else {
        console.log(err);
        callback(400, { error: 'user with that phone number already exists' });
      }
    });
  } else {
    callback(400, { error: 'missing required fields' });
  }
};


handlers._users.get = (data, callback) => {
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    const tokenId = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

    handlers._tokens.verifyToken(tokenId, phone, isValid => {
      if (isValid) {
        _data.read('users', phone, (err, readData) => {
          if (!err && readData) {
            delete readData.hashedPassword;
            callback(200, readData);
          } else {
            console.log(err);
            callback(404);
          }
        });
      } else {
        callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }

};


handlers._users.put = (data, callback) => {
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone : false;

  if (phone) {
    const tokenId = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
    handlers._tokens.verifyToken(tokenId, phone, isValid => {
      if (isValid) {
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            const firstname = typeof (data.payload.firstname) === 'string' && data.payload.firstname.trim() ? data.payload.firstname.trim() : false;
            const lastname = typeof (data.payload.lastname) === 'string' && data.payload.lastname.trim() ? data.payload.lastname.trim() : false;
            const password = typeof (data.payload.password) === 'string' && data.payload.password.trim() ? data.payload.password.trim() : false;

            if (firstname) {
              userData.firstname = firstname;
            }
            if (lastname) {
              userData.lastname = lastname;
            }
            if (password) {
              userData.hashedPassword = helpers.hash(password);
            }

            _data.myUpdate('users', phone, userData, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { error: 'Failed to update' });
              }
            })
          } else {
            callback(404);
          }
        })
      } else {
        callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' })
      }
    });
  } else {
    callback(400, { error: 'please provide a valid phone number' })
  }
};


handlers._users.delete = (data, callback) => {
  const phone = typeof (data.queryStringObject.phone) === 'string' && 
    data.queryStringObject.phone.trim().length === 10 ? 
    data.queryStringObject.phone.trim() : 
    false;

  if (phone) {
    const tokenId = typeof (data.headers.token) === 'string' && 
      data.headers.token.trim().length === 20 ? 
      data.headers.token.trim() : 
      false;

    handlers._tokens.verifyToken(tokenId, phone, isValid => {
      if (isValid) {
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                const userChecks = typeof(userData.checks) === 'object' &&
                  userData.checks instanceof Array &&
                  userData.checks.length > 0 ?
                  userData.checks :
                  false;
                
                if (!userChecks) {
                  callback(200);
                } else {
                  let deletedAll = true;
                  let deletions = 0;
                  userChecks.forEach((checkId) => {
                    _data.delete('checks', checkId, (err) => {
                      deletions++;
                      if (err) {
                        deletedAll = false;
                      } else {
                        if (deletions === userChecks.length) {
                          if (!deletedAll) {
                            callback(500, { error: 'Errors occurred while attempting to delete all the checks associated with the users. Some checks cannot be deleted or do not exist' });
                          } else {
                            callback(200);
                          }
                        }
                      }
                    });
                  });
                }
              } else {
                callback(500, { error: 'Failed to delete user' });
              }
            });
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' })
      }
    });
  } else {
    callback(400, { error: 'please provide a valid phone number' })
  }
};



/*
***********************************************************************************
***********************************************************************************
                                  \TOKENS
***********************************************************************************
***********************************************************************************
*/
handlers._tokens = {};
// Required data: phone, password
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) === 'string' && data.payload.password.trim() ? data.payload.password.trim() : false;

  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        if (userData.hashedPassword === helpers.hash(password)) {
          const tokenId = helpers.createRandomString();
          const expiry = Date.now() + 1000 * 60 * 60;
          const token = {
            phone,
            tokenId,
            expiry
          };
          _data.create('tokens', tokenId, token, err => {
            if (!err) {
              callback(200, token);
            } else {
              console.log(err);
              callback(500, { err: 'Failed to create token' });
            }
          })
        } else {
          callback(400, { error: 'Wrong password' });
        }
      } else {
        callback(400, { error: 'user does not exist' });
      }
    })
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

handlers._tokens.get = (data, callback) => {
  const tokenId = typeof (data.queryStringObject.tokenId) === 'string' && 
    data.queryStringObject.tokenId.trim().length === 20 ? 
    data.queryStringObject.tokenId.trim() : 
    false;

  if (tokenId) {
    _data.read('tokens', tokenId, (err, token) => {
      if (!err && token) {
        callback(200, token);
      } else {
        callback(400, { error: 'Invalid credential' });
      }
    });

  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// requires: tokenId, extend
handlers._tokens.put = (data, callback) => {
  const tokenId = typeof (data.queryStringObject.tokenId) === 'string' && data.queryStringObject.tokenId.trim().length === 20 ? data.queryStringObject.tokenId.trim() : false;
  const extend = typeof (data.payload.extend) === 'boolean' ? data.payload.extend : false;

  if (tokenId && extend) {
    _data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expiry > Date.now()) {
          tokenData.expiry = Date.now() + 1000 * 60 * 60;
          _data.update('tokens', tokenId, tokenData, err => {
            if (!err) {
              callback(200, tokenData);
            } else {
              callback(500, { error: 'Failed to update token' });
            }
          })
        } else {
          callback(400, { error: 'The token has already expired' });
        }
      } else {
        callback(400, { error: 'Invalid token' });
      }
    });

  } else {
    callback(400, { error: 'Missing required field' });
  }
};

// requires: id
handlers._tokens.delete = (data, callback) => {
  const tokenId = typeof (data.queryStringObject.tokenId) === 'string' && data.queryStringObject.tokenId.trim().length === 20 ? data.queryStringObject.tokenId.trim() : false;

  if (tokenId) {
    _data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', tokenId, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'Failed to delete token' });
          }
        })
      } else {
        callback(400, { error: 'Token does not exist' });
      }
    });

  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

handlers._tokens.verifyToken = (tokenId, phone, callback) => {
  _data.read('tokens', tokenId, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expiry > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })
};

/* 
***********************************************************************************
***********************************************************************************
                                  \CHECKS
***********************************************************************************
***********************************************************************************
*/

handlers._checks = {};
// Required data: protocol, url, method, success code, timeout
handlers._checks.post = (data, callback) => {
  const protocol = typeof (data.payload.protocol) === 'string' &&
    ['http', 'https'].includes(data.payload.protocol) ?
    data.payload.protocol.trim() :
    false;
  const url = typeof (data.payload.url) === 'string' &&
    data.payload.url.trim() ?
    data.payload.url.trim() :
    false;
  const method = typeof (data.payload.method) === 'string' &&
    ['post', 'get', 'put', 'delete'].includes(data.payload.method.toLowerCase()) ?
    data.payload.method.trim() :
    false;
  const successCode = typeof (data.payload.successCode) === 'object' &&
    data.payload.successCode instanceof Array &&
    data.payload.successCode.length > 0 ?
    data.payload.successCode :
    false;
  const timeout = typeof (data.payload.timeout) === 'number' &&
    data.payload.timeout % 1 === 0 &&
    data.payload.timeout < 6 &&
    data.payload.timeout > 0 ?
    data.payload.timeout :
    false;

  if (protocol && url && method && successCode && timeout) {
    const tokenId = typeof (data.headers.token) === 'string' && 
      data.headers.token.trim().length === 20 ? 
      data.headers.token.trim() : 
      false;

    _data.read('tokens', tokenId, (err, tokenData) => {
      if (err || !tokenData) {
        callback(403);
      } else {
        const userPhone = tokenData.phone;
        _data.read('users', userPhone, (err, userData) => {
          if (err || !userData) {
            callback(403);
          } else {
            const userChecks = typeof (userData.checks) === 'object' &&
              userData.checks instanceof Array ?
              userData.checks :
              [];

            if (userChecks.length >= config.maxChecks) {
              callback(400, { error: `The user already has the maximum mount of checks (${config.maxChecks})` })
            } else {
              const checkId = helpers.createRandomString();
              const checkObject = {
                checkId,
                userPhone,
                protocol,
                method,
                url,
                successCode,
                timeout
              };
              _data.create('checks', checkId, checkObject, err => {
                if (err) {
                  callback(500, { error: 'Failed to create check' });
                } else {
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  _data.update('users', userPhone, userData, err => {
                    if (err) {
                      callback(500, { error: 'Failed to update check' });
                    } else {
                      callback(200, checkObject);
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields.' });
  }

};



handlers._checks.get = (data, callback) => {
  const checkId = typeof(data.queryStringObject.checkId) === 'string' &&
    data.queryStringObject.checkId.trim().length === 20 ?
    data.queryStringObject.checkId.trim() :
    false;

  if (!checkId) {
    callback(400, { error: 'Missing required fields' });
  } else {
    _data.read('checks', checkId, (err, checkData) => {
      if (err || !checkData) {
        callback(404);
      } else {
        const tokenId = typeof(data.headers.token) === 'string' &&
          data.headers.token.trim().length === 20 ?
          data.headers.token.trim() :
          false;

        handlers._tokens.verifyToken(tokenId, checkData.userPhone, (isValid) => {
          if (!isValid) {
            callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' });
          } else {
            callback(200, checkData);
          }
        });
      }
    });
  }
};

// required data: id
// option: the left
handlers._checks.put = (data, callback) => {
  const checkId = typeof(data.payload.checkId) === 'string' &&
    data.payload.checkId.trim().length === 20 ?
    data.payload.checkId.trim() :
    false;

  if (!checkId) {
    callback(400, { error: 'Missing required fields' });
  } else {
    const payload = {
      protocol: typeof (data.payload.protocol) === 'string' &&
        ['http', 'https'].includes(data.payload.protocol) ?
        data.payload.protocol.trim() :
        false,
      url: typeof (data.payload.url) === 'string' &&
        data.payload.url.trim() ?
        data.payload.url.trim() :
        false,
      method: typeof (data.payload.method) === 'string' &&
        ['post', 'get', 'put', 'delete'].includes(data.payload.method.toLowerCase()) ?
        data.payload.method.trim() :
        false,
      successCode: typeof (data.payload.successCode) === 'object' &&
        data.payload.successCode instanceof Array &&
        data.payload.successCode.length > 0 ?
        data.payload.successCode :
        false,
      timeout: typeof (data.payload.timeout) === 'number' &&
        data.payload.timeout % 1 === 0 &&
        data.payload.timeout < 6 &&
        data.payload.timeout > 0 ?
        data.payload.timeout :
        false
    };

    let missingFieldsToUpdate = true;

    for (const key in payload) {
      if (payload[key]) {
        missingFieldsToUpdate = false;
        break;
      }
    }

    if (missingFieldsToUpdate) {
      callback(400, { error: 'Missing fields to update' });
    } else {
      _data.read('checks', checkId, (err, checkData) => {
        if (err || !checkData) {
          callback(404);
        } else {
          const tokenId = typeof(data.headers.token) === 'string' &&
            data.headers.token.trim().length === 20 ?
            data.headers.token.trim() :
            false;
  
          handlers._tokens.verifyToken(tokenId, checkData.userPhone, (isValid) => {
            if (!isValid) {
              callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' });
            } else {
              for (const key in payload) {
                if (payload[key]) {
                  checkData[key] = payload[key];
                }
              }
  
              _data.update('checks', checkId, checkData, (err) => {
                if (err) {
                  callback(500, { error: 'Failed to update check' });
                } else {
                  callback(200, checkData);
                }
              });
            }
          });
        }
      });
    }
  }
};


// required data: checkId
handlers._checks.delete = (data, callback) => {
  const checkId = typeof(data.queryStringObject.checkId) === 'string' &&
  data.queryStringObject.checkId.trim().length === 20 ?
  data.queryStringObject.checkId.trim() :
  false;

  if (!checkId) {
    callback(400, { error: 'Missing required fields' });
  } else {
    _data.read('checks', checkId, (err, checkData) => {
      if (err || !checkData) {
        callback(404);
      } else {
        const tokenId = typeof(data.headers.token) === 'string' &&
          data.headers.token.trim().length === 20 ?
          data.headers.token.trim() :
          false;

        handlers._tokens.verifyToken(tokenId, checkData.userPhone, (isValid) => {
          if (!isValid) {
            callback(403, { error: 'Missing tokenId in the header or the tokenId is invalid' });
          } else {
            _data.read('users', checkData.userPhone, (err, userData) => {
              if (err || !userData) {
                callback(500, { error: 'Failed to find the user on the check' });
              } else {
                userData.checks = userData.checks.filter(check => check !== checkId);
                _data.update('users', checkData.userPhone, userData, (err) => {
                  if (err) {
                    callback(500, { error: 'Failed to update user' });
                  } else {
                    _data.delete('checks', checkId, (err) => {
                      if (err) {
                        callback(500, { error: 'Failed to delete check' });
                      } else {
                        callback(200);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}



handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  const method = data.method.toLowerCase();

  if (acceptableMethods.includes(method)) {
    handlers._users[method](data, callback);
  } else {
    callback(405);
  }
};

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  const method = data.method.toLowerCase();

  if (acceptableMethods.includes(method)) {
    handlers._tokens[method](data, callback);
  } else {
    callback(405);
  }
};

handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  const method = data.method.toLowerCase();

  if (acceptableMethods.includes(method)) {
    handlers._checks[method](data, callback);
  } else {
    callback(405);
  }
};

handlers.notfound = (data, callback) => {
  callback(404);
}


module.exports = handlers;