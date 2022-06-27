const handlers = require('./handlers');


const routers = {
  users: handlers.users,
  notfound: handlers.notfound ,
  tokens: handlers.tokens,
  checks: handlers.checks
};

module.exports = routers;