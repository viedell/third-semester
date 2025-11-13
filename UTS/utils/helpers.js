// Simple and reliable password system
const crypto = require('crypto');

function hashPassword(password) {
  // Simple but consistent hashing for development
  return crypto.createHash('sha256').update(password).digest('hex');
}

function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
  return hashedInput === hashedPassword;
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