const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');
const { hashPassword, comparePassword, validateEmail, validatePassword } = require('../utils/helpers');
const { requireGuest } = require('../middleware/auth');
const { loginView } = require('../views/login');
const { registerView } = require('../views/register');

// Show login page
router.get('/login', requireGuest, (req, res) => {
  const redirect = req.query.redirect || '/';
  res.send(loginView(null, redirect));
});

// Handle login
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password, redirect = '/' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.send(loginView('Please provide email and password', redirect));
    }

    if (!validateEmail(email)) {
      return res.send(loginView('Invalid email format', redirect));
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.send(loginView('Invalid email or password', redirect));
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.send(loginView('Invalid email or password', redirect));
    }

    // Set session
    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    res.redirect(redirect);
  } catch (error) {
    console.error('Login error:', error);
    res.send(loginView('An error occurred. Please try again.'));
  }
});

// Show register page
router.get('/register', requireGuest, (req, res) => {
  res.send(registerView());
});

// Handle registration
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.send(registerView('All fields are required'));
    }

    if (!validateEmail(email)) {
      return res.send(registerView('Invalid email format'));
    }

    if (!validatePassword(password)) {
      return res.send(registerView('Password must be at least 6 characters'));
    }

    if (password !== confirmPassword) {
      return res.send(registerView('Passwords do not match'));
    }

    const db = getDB();

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return res.send(registerView('Email already registered'));
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    // Set session
    req.session.user = {
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt
    };

    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.send(registerView('An error occurred. Please try again.'));
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
