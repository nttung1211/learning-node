const express = require('express');
const cluster = require('cluster');
const os = require('os');

const app = express();
const delay = (ms) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // do nothing
  }
};
app.get('/', (req, res) => {
  res.send('From process ' + process.pid);
});
app.get('/timer', (req, res) => {
  delay(3000);
  console.log('Running process: ' + process.pid);
  res.send('From process: ' + process.pid);
});

// *** no need when using pm2
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);
//   const numberOfWorkers = os.cpus().length;
//   console.log(`Number of CPUs: ${numberOfWorkers}`);
//   for (let i = 0; i < numberOfWorkers; i++) {
//     cluster.fork();
//   }
// } else {
//   console.log(`Worker ${process.pid} started`);
//   app.listen(5000, () => {
//     console.log('Example app listening on port 5000!');
//   });
// }

app.listen(5000, () => {
  console.log('Example app listening on port 5000!');
});
