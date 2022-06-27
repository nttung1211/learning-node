const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const util = require('util');
const log = util.debuglog('server');

const config = require('./config');
const helpers = require('./helpers');
const routers = require('./routers');


const server = {};

server.httpServer = http.createServer((req, res) => {
  server.requestListener(req, res);
});

server.httpsServerOptions = {
  cert: fs.readFileSync(path.join(__dirname, '/../ssl/cert.pem')),
  key: fs.readFileSync(path.join(__dirname, '/../ssl/key.pem')),
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.requestListener(req, res);
});

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    log(`Listening on port ${config.httpPort}`);
  });

  server.httpsServer.listen(config.httpsPort, () => {
    log(`Listening on port ${config.httpsPort}`);
  });
};

server.requestListener = (req, res) => {
  const decoder = new StringDecoder();
  let buffer = '';
  
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();
    const parsedUrl = url.parse(req.url, true);
    const data = {
      trimmedPathname: parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
      queryString: parsedUrl.query,
      method: req.method,
      headers: req.headers,
      payload: helpers.jsonToObject(buffer)
    };
    const handler = typeof(routers[data.trimmedPathname]) === 'undefined' ?
      routers.notfound : 
      routers[data.trimmedPathname];
    
    handler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ?
        statusCode :
        200;
      payload = typeof(payload) === 'object' ?
        payload :
        {};

      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
    
      res.end(JSON.stringify(payload));
    });
  });

};

module.exports = server;