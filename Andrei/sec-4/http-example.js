const { get, request } = require('https');

// request('https://www.google.com', (res) => {
//   console.log(res.statusCode);
//   res.on('data', (chunk) => {
//     console.log(chunk);
//   });
// }).end();

// using get if you just want to get the response. For this you don't need to call end()
get('https://www.google.com', (res) => {
  res.on('data', (chunk) => {
    // console.log(chunk);
  });
});

module.exports = {
  name: 'Tung', 
};