const mysql = require('mysql');


class DB {
  static con;

  static connect(callback) {
    DB.con = mysql.createConnection({
      host: '127.0.0.1',
      user: 'clark',
      password: 'Tungnguyen12',
      database: 'node_master_class'
    });

    DB.con.connect((err) => {
      if (err) {
        callback('Failed to connect to the database: ' + err);
      } else {
        callback(false);
      }
    });
  }

  static query(sql, data, callback) {
    let params = [];

    if (typeof(data) === 'object') {
      if (data instanceof Array) {
        params = data;
      } else {
        for (const key in data) {
          params.push(data[key]);
        }
      }
    } else {
      params.push(data);
    }


    DB.con.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
        callback('Failed to execute query');
      } else {
        callback(false, result);
      }
    });
  }

};


module.exports = DB;









