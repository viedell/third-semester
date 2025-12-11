// services/userService.js
const prisma = require('../prisma/client');

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

const createUser = async (user) => {
  // Assuming 'user' object contains { email, name }
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      name: user.name
    }
  });
  return newUser;
};

module.exports = {
  getAllUsers,
  createUser
};