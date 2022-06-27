const path = require('path');
const fs = require('fs');
const zlib = require('zlib');


const logs = {};

logs.baseDir = path.join(__dirname, '/../.logs/');

logs.append = (fileName, string, callback) => {
  fs.open(`${logs.baseDir + fileName}.log`, 'a', (err, fileDiscriptor) => {
    if (err || !fileDiscriptor) {
      callback(`Could not open the file for appending: ${err}`);
    } else {
      fs.appendFile(fileDiscriptor, string+'\n', (err) => {
        if (err) {
          callback('Failed to append file');
        } else {
          fs.close(fileDiscriptor, (err) => {
            if (err) {
              callback('Failed to close file');
            } else {
              callback(false);
            }
          });
        }
      });
    }
  });
}

logs.list = (includesCompressedLogs,  callback) => {
  fs.readdir(logs.baseDir, (err, data) => {
    if (err || !data || data.length === 0) {
      callback(err, data);
    } else {
      const trimmedFileNames = [];
      data.forEach(fileName => {
        if (fileName.includes('.log')) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }

        if (fileName.includes('.gz.b64') && includesCompressedLogs) {
          console.log('TUNG DEP TRAI');
          trimmedFileNames.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    }
  });
};


logs.compress = (logId, newFileId, callback) => {
  const sourceFile = logId + '.log';
  const destFile = newFileId + '.gz.b64';
  fs.readFile(logs.baseDir + sourceFile, 'utf8', (err, inputString) => {
    if (err || !inputString) {
      callback('Error reading file: ' + err);
    } else {
      zlib.gzip(inputString, (err, buffer) => {
        if (err || !buffer) {
          callback('Error gzip file: ' + err);
        } else {
          fs.writeFile(logs.baseDir + destFile, buffer.toString('base64'), { flag: 'wx' }, (err) => {
            if (err) {
              callback('Error writing file: ' + err);
            } else {
              callback(false);
            }
          });
        }
      });
    }
  });
};

logs.decompess = (fileId, callback) => {
  const filename = fileId + '.gz.b64';
  fs.readFile(logs.baseDir + filename, 'utf8', (err, str) => {
    if (err || !str) {
      const inputBuffer = new Buffer.from(str, 'base64');
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (err || !outputBuffer) {
          callback(err);
        } else {
          const str = outputBuffer.toString();
          callback(false, str)
        }
      });
    } else {
      callback(err);
    }
  });
};

logs.truncate = (logId, callback) => {
  fs.truncate(logs.baseDir + logId + '.log', 0, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(false);
    }
  });
}


module.exports = logs;