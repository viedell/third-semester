// controllers/userController.js
const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.render('index', { users: users });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const formUser = async (req, res) => {
  res.render('form');
};

const submitUser = async (req, res) => {
  try {
    await userService.createUser(req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllUsers,
  formUser,
  submitUser
};
