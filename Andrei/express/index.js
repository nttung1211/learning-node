const express = require('express');
const hbs = require('hbs');
const path = require('path');

const rootRouter = require('./routes/root.router');


const app = express();
const PORT = 3000;

// *** without the path being specified as the first parameter, the middleware will be applied to all requests

// timer middleware
app.use((req, res, next) => {
  const start = Date.now();
  next();
  const delta = Date.now() - start;
  console.log(`${req.method} ${req.baseUrl}${req.url} took ${delta}ms`);
});

// json parser middleware
app.use(express.json()); // for parsing JSON to JS object if content type is application/json

// static web middleware
app.use(express.static(path.join(__dirname, 'public'))); // this path is relative to the dir where we run the node server, therefore we need to use path.join()

// router middleware
app.use('/', rootRouter);

// set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/engine', (req, res) => {
  res.render('index', {
    title: 'Home',
    name: 'John',
    country: 'USA',
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});