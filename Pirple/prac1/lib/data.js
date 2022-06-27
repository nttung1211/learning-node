const path = require('path');
const fs = require('fs');

const _data = {
  baseDir: path.join(__dirname, '/../data/'),

  create(fileDir, fileName, fileData, callback) {
    fs.writeFile(`${this.baseDir + fileDir}/${fileName}.json`, JSON.stringify(fileData), { flag: 'wx' }, (err) => {
      if (err) {
        callback('Failed to create file: ' + err);
      } else {
        callback(false);
      }
    });
  },

  read(fileDir, fileName, callback) {
    fs.readFile(`${this.baseDir + fileDir}/${fileName}.json`, 'utf8', (err, fileData) => {
      if (err || !fileData) {
        callback('Failed to read file: ' + err);
      } else {
        callback(false, JSON.parse(fileData));
      }
    });
  },

  update(fileDir, fileName, fileData, callback) {
    fs.writeFile(`${this.baseDir + fileDir}/${fileName}.json`, JSON.stringify(fileData), (err) => {
      if (err) {
        callback('Failed to update file: ' + err);
      } else {
        callback(false);
      }
    });
  },

  delete(fileDir, fileName, callback) {
    fs.unlink(`${this.baseDir + fileDir}/${fileName}.json`, (err) => {
      if (err) {
        callback('Failed to delete file: ' + err);
      } else {
        callback(false);
      }
    });
  },
};


module.exports = _data;