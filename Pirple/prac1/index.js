const server = require('./lib/server');
const DB = require('./lib/database');


const app = {};
app.init = () => {
  DB.connect((err) => {
    if (err) {
      console.log('Failed to connect to database.');
    }
  });

  server.init();
};

app.init();