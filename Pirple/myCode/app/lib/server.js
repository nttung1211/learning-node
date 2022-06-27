const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

const config = require('./config');
const helpers = require('./helpers');
const routers = require('./routers');

// TWILIO TESTING 
// helpers.sendTwilioSMS('4158375309', 'hello', (err) => {
//   console.log('ERROR: ' + err);
// });

const server = {};

server.httpServer = http.createServer(unifiedServer);
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, unifiedServer);

server.init = () => {
  server.httpServer.listen(config.httpPort, '127.0.0.1', () => {
    debug(`${'\x1b[33m'}server is listening on port ${config.httpPort}${'\x1b[0m'}`);
    // debug(`\x1b[33mserver is listening on port ${config.httpPort}\x1b[0m`);
  });
  
  server.httpsServer.listen(config.httpsPort, () => {
    debug('\x1b[33m%s\x1b[0m', `server is listening on port ${config.httpsPort}`);
  });
};


// FUNCTIONS
function unifiedServer(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method;
  const headers = req.headers;
  const queryStringObject = parsedUrl.query;
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  }); 

  req.on('end', () => {
    buffer += decoder.end();
    const payload = helpers.parseJsonToObject(buffer);
    const chosenHandler = typeof(routers[trimmedPath]) !== 'undefined' ? routers[trimmedPath] : routers.notfound;
    const data = {
      trimmedPath,
      method,
      headers,
      queryStringObject,
      payload
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);
      
      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(payloadString);

      debug(`${statusCode === 200 ? '\x1b[32m' : '\x1b[31m'}${method} /${trimmedPath} ${statusCode}\x1b[0m`)

    });
    
  });

}

module.exports = server;