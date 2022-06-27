const http = require('http');


const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'appllication/json'});

    if (req.method === 'POST') {
      req.pipe(res); // res implement writable stream so we can pipe the request (which is a readable stream) to it. <self> the content to pipe is the data coming from the request.
    } else {
      res.end(JSON.stringify({message: 'Hello World!'})); // <self> end() will write to stream
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});