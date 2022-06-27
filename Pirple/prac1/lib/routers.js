const users = require('../handlers/users');
const tokens = require('../handlers/tokens');
const notfound = require('../handlers/notfound');


const routers = {
  users: users.handler,
  tokens: tokens.handler,
  notfound: notfound.handler
};

module.exports = routers;