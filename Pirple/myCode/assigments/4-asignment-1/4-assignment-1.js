const config = require('./config');

const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


const handlers = {
  hello(data, callback) {
    callback(200, { message: 'welcome to our server' });
  },
  
  notfound(data, callback) {
    callback(404);
  }
};

const router = {
  hello: handlers.hello,
  notFound: handlers.notfound
};

const httpServer = http.createServer(requestListener);

const httpsOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsOptions, requestListener);

httpServer.listen(config.httpPort, () => {
  console.log('server is litening on port ' + config.httpPort);
})
httpsServer.listen(config.httpsPort, () => {
  console.log('server is litening on port ' + config.httpsPort);
})


function requestListener(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  
  req.on('data', data => {
    buffer += decoder.write(data);
  }); 

  req.on('end', () => {
    buffer += decoder.end();
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notfound;
    const data = {
      trimmedPath: trimmedPath,
      payload: buffer
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);
      
      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(payloadString);
    });
  })

}