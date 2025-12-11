// prisma/client.js
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Explicitly load .env from the project root directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient({
  // Optional: Enable logging to debug queries and errors
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
