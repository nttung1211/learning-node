const { parse } = require('csv-parse');
const fs = require('fs');

const result = [];

const isHabitable = (planet) => {
  return planet.koi_disposition === 'CONFIRMED' && planet.koi_insol > 0.36 && planet.koi_insol < 1.11 && planet.koi_prad < 1.6;
}

const parsedStream = parse({ // this returns a transform stream
  comment: '#',
  columns: true,
}) // after parsing this stream has chunk size different from the default

fs.createReadStream('./kepler_data.csv') // chunk size: highWaterMark <integer> Default: 64 * 1024
  .pipe(parsedStream) // pipe will pour the data from the file to the transformStream since it is a writable stream (pipe() will return the type of stream that is passed in) 
  .on('data', data => { // since the transformStream is also a readable stream, we can use the on method to listen to the data event
    if (isHabitable(data)) {
      result.push(data);
    }
  })
  .on('error', err => {
    console.error(err);
  })
  .on('end', () => {
    console.log(result.length);
    console.log('done');
  })