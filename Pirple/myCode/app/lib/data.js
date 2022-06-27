const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');



const lib = {};


lib.baseDir = path.join(__dirname, '/../.data/');

// for the reason that we already check if the phone exists at handlers
lib.myCreate = (dir, fileName, data, callback) => { 
  fs.writeFile(
    `${lib.baseDir + dir}/${fileName}.json`, 
    JSON.stringify(data), 
    { flag: 'wx' }, 
    err => {
      if (!err) {
        callback(false);
      } else {
        callback('Failed to write file. ' + err);
      }
    }
  );
};

lib.create = (dir, fileName, data, callback) => {
  fs.open(
    `${lib.baseDir + dir}/${fileName}.json`,

    'wx',

    (err, fileDiscriptor) => {
      if (!err && fileDiscriptor) {
        const stringData = JSON.stringify(data);
        fs.writeFile(fileDiscriptor, stringData, err => {
          if (!err) {
            fs.close(fileDiscriptor, err => {
              if (!err) {
                callback(false);
              } else {
                callback('Failed to close file. ' + err);
              }
            })
          } else {
            callback('Failed to write file. ' + err);
          }
        })
      } else {
        callback('Could not create new file, it may already exits. ' + err);
      }
    }
  );
};

lib.read = (dir, fileName, callback) => {
  fs.readFile(
    `${lib.baseDir + dir}/${fileName}.json`,
    'utf8',
    (err, data) => {
      if (!err) {
        callback(false, helpers.parseJsonToObject(data));
      } else {
        callback(err);
        // callback(err, data);
      }
    }
  );
};


lib.myUpdate = (dir, fileName, data, callback) => {
  const stringData = JSON.stringify(data);
  fs.writeFile(`${lib.baseDir + dir}/${fileName}.json`, stringData, err => { 
    if (!err) {
      callback(false);
    } else {
      console.lgo(err);
      callback('Failed to WRITE to file. ' + err);
    }
  })
};

lib.update = (dir, fileName, data, callback) => {
  fs.open( // we open the file with "r+" mode first to make sure the file already exists
    `${lib.baseDir + dir}/${fileName}.json`,
    'r+',
    (err, fileDiscriptor) => {
      if (!err && fileDiscriptor) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDiscriptor, 0, err => { // the default length to truncate is 0
          if (!err) {
            fs.writeFile(fileDiscriptor, stringData, err => { // ? the default flag is "w" but in this case, the file is open with mode "r+" first then "w" has no effect thus we need to truncate first
              if (!err) {
                fs.close(fileDiscriptor, err => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Failed to close file. ' + err);
                  }
                });
              } else {
                callback('Failed to write to file. ' + err);
              }
            })
          } else {
            callback('Failed to truncate file. ' + err);
          }
        });
      } else {
        callback('Failed to open file to update, it may not exist yet. ' + err);
      }
    }
  )
};

lib.delete = (dir, fileName, callback) => {
  fs.unlink(
    `${lib.baseDir + dir}/${fileName}.json`,
    err => {
      if (!err) {
        callback(false);
      } else { 
        callback('Failed to delete file. ' + err);
      }
    }
  )
};

// list all the item in a directory
lib.listAll = (dir, callback) => {
  fs.readdir(`${lib.baseDir + dir}/`, (err, data) => {
    if (err || !data || !(data.length > 0)) {
      callback(err, data);
    } else {
      const trimmedFileNames = data.map(fileName => fileName.replace('.json', ''));
      callback(false, trimmedFileNames);
    }
  });
};



module.exports = lib;