const bcrypt = require('bcryptjs');

// Password hashing utilities
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Validation utilities
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return password && password.length >= 6;
}

function sanitizeUser(user) {
  const { password, ...sanitized } = user;
  return sanitized;
}

module.exports = {
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPassword,
  sanitizeUser
};