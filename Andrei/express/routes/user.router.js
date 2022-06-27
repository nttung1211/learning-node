
const express = require('express');
const path = require('path');

const { getUsers, getUserById, createUser } = require('../controllers/user.controller');


const userRouter = express.Router();
userRouter.use((req, res, next) => {
  console.log('user router middleware');
  next();
})

userRouter.get('/', getUsers);
userRouter.post('/', createUser);
userRouter.get('/image', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'img', 'imgUrl.png'));
});
userRouter.get('/:id', getUserById);

module.exports = userRouter;