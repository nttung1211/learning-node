const rootRouter = require('express').Router();
const friendRouter = require('./friend.router');
const userRouter = require('./user.router');

rootRouter.use('/friends', friendRouter);
rootRouter.use('/users', userRouter);

module.exports = rootRouter;