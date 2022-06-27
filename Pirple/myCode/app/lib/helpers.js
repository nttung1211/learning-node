const crypto = require('crypto');
const config = require('./config');
const querystring = require('querystring');
const https = require('https');

const helpers = {};

helpers.hash = (string) => {
  if (string && typeof(string) === 'string') {
    return crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
  } else {
    return false;
  }
};

helpers.parseJsonToObject = (string) => {
  try {
    return JSON.parse(string);
  } catch (err) {
    return {};
  }
};

helpers.createRandomString = (
  length = 20, 
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
  let randString = '';
  for (let i = 0; i < length; i++) {
    randString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randString;
};

helpers.sendTwilioSMS = (phone, msg, callback) => {
  phone = typeof(phone) === 'string' && 
    phone.trim().length > 0 ?
    phone.trim() :
    false;
  msg = typeof(msg) === 'string' && 
    msg.trim().length > 0 &&
    msg.trim().length < 1600 ?
    msg.trim() :
    false;

  if (!phone || !msg) {
    callback('Given parameter were missing or invalid');
  } else {
    const payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': msg
    };

    const queryStringPayload = querystring.stringify(payload);
    const requestDetail = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(queryStringPayload)
      }
    }
    const req = https.request(requestDetail, (res) => {
      if ([200, 201].includes(res.statusCode)) {
        callback(false);
      } else {
        callback(`Status returned was ${res.statusCode}`);
      }
    });

    // Bind to the error event so it does not get thrown then it will not kill the thread
    req.on('error', (e) => { // the callback will either be called when there is an errors or when it comeback (right above)
      callback(e);
    });

    req.write(queryStringPayload);

    req.end();
  }
}

module.exports = helpers;

