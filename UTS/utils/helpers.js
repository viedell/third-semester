// Simple password handling without bcrypt for now to eliminate complexity
function hashPassword(password) {
  // Simple hash for debugging - replace with bcrypt later
  return 'hashed_' + password;
}

function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return hashedPassword === 'hashed_' + password;
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