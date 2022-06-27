require('dotenv-expand').expand(require('dotenv').config());
import https from 'https';
import app from './app';
import fs from 'fs';

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
};
const server = https.createServer(options, app);
async function startServer() {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

startServer();