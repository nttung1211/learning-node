const express = require('express');

const { getFriends, getFriendById, createFriend } = require('../controllers/friend.controller');


const friendRouter = express.Router();
friendRouter.use((req, res, next) => {
  console.log('friend router middleware');
  next();
})
friendRouter.get('/', getFriends);
friendRouter.get('/:id', getFriendById);
friendRouter.post('/', createFriend)

module.exports = friendRouter;