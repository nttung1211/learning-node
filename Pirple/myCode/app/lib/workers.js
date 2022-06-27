const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const helpers = require('./helpers');
const _data = require('./data');
const _logs = require('./logs');
const util = require('util');
const debug = util.debuglog('workers');


const workers = {};

workers.init = () => {
  // Execute all the checks immediately
  workers.gatherAllChecks();

  // Call the loop so the checks will execute later on
  workers.loop();

  // compress all the logs immediately
  workers.rotateLogs();

  // call the compression loop so log will be compressed later on
  workers.logRotationLoop();
};

workers.logRotationLoop = () => {
  setInterval(
    () => {
      workers.rotateLogs();
    }, 
    1000 * 60 * 60 * 24
  );
};

workers.loop = () => {
  setInterval(
    () => {
      workers.gatherAllChecks();
    },
    1000 * 60
  );
};

workers.rotateLogs = () => {
  _logs.list(false, (err, logs) => {
    if (err || !logs || logs.length === 0) {
      debug('Could not find any log to rotate: ' + err);
    } else {
      logs.forEach(logName => {
        const logId = logName.replace('.log', '');
        const newLogId = `${logId}-${Date.now()}`;
        _logs.compress(logId, newLogId, (err) => {
          if (err) {
            debug('Error compressing log file: ' + err);
          } else {
            _logs.truncate(logId, (err) => { // delete the data compressed
              if (err) {
                debug('Error truncating log file: ' + err);
              } else {
                debug('Success truncating log file');
              }
            });
          }
        });
      });
    }
  });
};

workers.gatherAllChecks = () => {
  _data.listAll('checks', (err, checks) => {
    if (err || !checks || !(checks.length > 0)) {
      debug('Error: there may not be any checks' + err);
    } else {
      checks.forEach(checkId => {
        _data.read('checks', checkId, (err, checkData) => {
          if (err || !checkData) {
            debug('Error: cannot read the check with id: ' + check);
          } else {
            workers.validateCheckData(checkData);
          }
        });
      });
    }
  });
};

workers.validateCheckData = (check) => {
  check = typeof(check) === 'object' &&
    check !== null ?
    check :
    {};
  check.checkId = typeof(check.checkId) === 'string' &&
    check.checkId.trim().length === 20 ?
    check.checkId.trim() :
    false;
  check.userPhone = typeof(check.userPhone) === 'string' &&
    check.userPhone.trim().length === 10 ?
    check.userPhone.trim() :
    false;
  check.protocol = typeof(check.protocol) === 'string' &&
    ['http', 'https'].includes(check.protocol) ?
    check.protocol.trim() :
    false;
  check.url = typeof(check.url) === 'string' &&
    check.url.trim() ?
    check.url.trim() :
    false;
  check.method = typeof(check.method) === 'string' &&
    ['post', 'get', 'put', 'delete'].includes(check.method.toLowerCase()) ?
    check.method.trim() :
    false;
  check.successCode = typeof(check.successCode) === 'object' &&
    check.successCode instanceof Array &&
    check.successCode.length > 0 ?
    check.successCode :
    false;
  check.timeout = typeof(check.timeout) === 'number' &&
    check.timeout % 1 === 0 &&
    check.timeout < 6 &&
    check.timeout > 0 ?
    check.timeout :
    false;
  check.state = typeof(check.state) === 'string' &&
    ['down', 'up'].includes(check.state) ?
    check.state.trim() :
    'down';
  check.lastChecked = typeof(check.lastChecked) === 'number' && 
    check.lastChecked > 0 ? 
    check.lastChecked : 
    false;

  if (
      check.checkId &&
      check.userPhone &&
      check.protocol &&
      check.url &&
      check.method &&
      check.successCode &&
      check.timeout
  ) {
      workers.performCheck(check);
  } else {
    // If checks fail, log the error and fail silently
    debug("Error: one of the checks is not properly formatted. Skipping.");
  }
};


workers.performCheck = (check) => {
  const checkOutcome = {
    error: false,
    responseCode: false
  };
  let outcomeSent = false;
  const parsedUrl = url.parse(`${check.protocol}://${check.url}`, true);
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path; // we want path but not pathname because we want query string
  const requestDetails = {
    protocol: check.protocol + ':',
    hostname: hostName,
    path: path,
    method: check.method.toUpperCase(),
    timeout: check.timeout * 1000, // because this key requires milisecond but we ask user for second
  };

  const moduleToUse = check.protocol === 'http' ? http : https;
  const req = moduleToUse.request(requestDetails, (res) => {
    const status = res.statusCode;
    checkOutcome.responseCode = status;

    if (!outcomeSent) {
      workers.procesCheckOutCome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the error event so it does not get thrown then it will not kill the thread
  req.on('error', (err) => {
    checkOutcome.error = {
      error: true,
      value: err
    };

    if (!outcomeSent) {
      workers.procesCheckOutCome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event so it does not get thrown then it will not kill the thread
  req.on('timeout', (err) => {
    checkOutcome.error = {
      error: true,
      value: 'timeout'
    };

    if (!outcomeSent) {
      workers.procesCheckOutCome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  req.end(); // send the request
};


// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.procesCheckOutCome = (check, checkOutCome) => { //? NODE DOES NOT LIKE "poccess"
  const state = !checkOutCome.error &&
    checkOutCome.responseCode &&
    check.successCode.includes(checkOutCome.responseCode) ?
    'up' :
    'down';
  const alertWarranted = check.lastChecked &&
    state !== check.state ?
    true :
    false;
  const timeOfCheck = Date.now();
  workers.log(check, checkOutCome, state, alertWarranted, timeOfCheck);
  const newCheck = check;
  newCheck.state = state;
  newCheck.lastChecked = timeOfCheck;

  _data.update('checks', newCheck.checkId, newCheck, (err) => {
    if (err) {
      debug('Failed to update one of the check');
    } else {
      if (alertWarranted) {
        workers.alertUserToStatuChange(newCheck);
      } else {
        debug('check outcome has not changed, no alert needed');
      }
    }
  });
};

workers.alertUserToStatuChange = (newCheck) => {
  const msg = 'Alert: Your check for '+newCheck.method.toUpperCase()+' '+newCheck.protocol+'://'+newCheck.url+' is currently '+newCheck.state;
  helpers.sendTwilioSMS(newCheck.userPhone, msg, (err) => {
    if(err){
      debug("Error: Could not send sms alert to user who had a state change in their check", err);
    } else {
      debug("Success: User was alerted to a status change in their check, via sms: ", msg);
    }
  });
};

workers.log = (check, checkOutCome, state, alertWarranted, timeOfCheck) => {
  const logData = {
    check,
    checkOutCome,
    state,
    alertWarranted,
    timeOfCheck
  };

  const logString = JSON.stringify(logData);
  const logFileName = check.checkId;
  _logs.append(logFileName, logString, (err) => {
    if (err) {
      debug('Logging to file failed: ' + err);
    } else {
      debug('Logging to file succeeded');
    }
  });
};


module.exports = workers;