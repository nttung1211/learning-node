const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('./config');


const handlers = {
  sample(data, callback) {
    callback(406, { name: 'sample handler' }); 
  },

  notfound(data, callback) {
    callback(404);
  }
};

const router = {
  sample: handlers.sample,
  notfound: handlers.notfound 
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
  const queryParams = parsedUrl.query;
  console.log(parsedUrl);
  // console.log(req.method);
  // console.log(req.headers);

  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  
  req.on('data', data => {
    buffer += decoder.write(data);
  }); 

  req.on('end', () => {
    buffer += decoder.end();
    console.log(buffer);
    const chosenHandeler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notfound;
    const data = {
      trimmedPath: trimmedPath,
      payload: buffer
    };

    chosenHandeler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      payloadString = JSON.stringify(payload);
      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(payloadString);
    });
    
  })

});
// parseUrl.path: pathname + search
// parseUrl.href: fullpath (ex: http://user:pass@host.com:8080/p/a/t/h?query=string#hash)


server.listen(config.port, () => {
  console.log(`server is listening on port ${config.port}`);
});
