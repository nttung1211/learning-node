// globalThis.console.log(process.argv);
/* 
***LOG
[
  '/home/ntt/.nvm/versions/node/v14.17.1/bin/node',
  '/home/ntt/dev/study/js/node/Andrei/begin/test.js'
] 
*/

// console.log(`${process.argv[2]} ${process.argv[3]} pro`);
/*
node test.js thanh tung
***LOG:
thanh tung pro
*/

var fs = require('fs')

fs.readFile(__filename, () => {
  setImmediate(() => {
    console.log('immediate')
  })
  console.log('log');
})

setTimeout(() => {
  console.log('timeout')
}, 0)