const friends = require('../models/friend.model');

const createFriend = (req, res) => {
  if (!req.body.name) {
    res.status(400).json({ error: 'Friend name is required' });
    return;  
  }
  const friend = {
    id: friends.length + 1,
    name: req.body.name,
  } 
  friends.push(friend);
  res.json(friend);
}

const getFriends = (req, res) => {
  res.json(friends);
}

const getFriendById = (req, res) =>{
  const friend = friends.find(f => f.id === +req.params.id);
  if (friend) {
    res.json(friend); // json() will eventually call send() but before that it will respect app json rules and convert the object to json forcedly
  } else {
    res.status(404).json({ error: 'Friend not found' });
  }
}

module.exports = {
  createFriend,
  getFriends,
  getFriendById,
};