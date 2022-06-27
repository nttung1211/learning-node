
const users = require('../models/user.model');

const createUser = (req, res) => {
  if (!req.body.name) {
    res.status(400).json({ error: 'User name is required' });
    return;  
  }
  const user = {
    id: users.length + 1,
    name: req.body.name,
  } 
  users.push(user);
  res.json(user);
}

const getUsers = (req, res) => {
  res.json(users);
}

const getUserById = (req, res) =>{
  const user = users.find(f => f.id === +req.params.id);
  if (user) {
    res.json(user); // json() will eventually call send() but before that it will respect app json rules and convert the object to json forcedly
  } else {
    res.status(404).json({ error: 'User not found' });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
};