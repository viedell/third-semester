const bcrypt = require('bcryptjs');

// Password hashing utilities
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
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
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
}

// Generate unique ID
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

module.exports = {
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPassword,
  sanitizeUser,
  generateId
};