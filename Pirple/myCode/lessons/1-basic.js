const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const strimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
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
    res.end('Hello');
  })

});
// parseUrl.path: pathname + search
// parseUrl.href: fullpath (ex: http://user:pass@host.com:8080/p/a/t/h?query=string#hash)


server.listen(3000, () => {
  console.log('server is listening on port 3000');
});