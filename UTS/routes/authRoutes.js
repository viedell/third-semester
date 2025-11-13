const express = require('express');
const { readJSON, writeJSON } = require('../utils/fileHandler');
const { hashPassword, comparePassword, isValidEmail, isValidPassword, sanitizeUser } = require('../utils/helpers');
const { requireGuest } = require('../middleware/auth');

const router = express.Router();

// Login page
router.get('/login', requireGuest, (req, res) => {
  const redirect = req.query.redirect || '/';
  res.send(require('../views/login')({ redirect, error: null, user: req.session.user }));
});

// Register page
router.get('/register', requireGuest, (req, res) => {
  res.send(require('../views/register')({ error: null, user: req.session.user }));
});

// Login handler
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password, redirect = '/' } = req.body;
    
    if (!email || !password) {
      return res.send(require('../views/login')({ 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      }));
    }

    const users = await readJSON('users.json');
    const user = users.find(u => u.email === email);

    if (!user || !(await comparePassword(password, user.password))) {
      return res.send(require('../views/login')({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    // Set session
    req.session.user = sanitizeUser(user);
    
    // Redirect to intended page or home
    res.redirect(redirect);
  } catch (error) {
    console.error('Login error:', error);
    res.send(require('../views/login')({ 
      redirect: req.body.redirect || '/', 
      error: 'Server error during login',
      user: req.session.user 
    }));
  }
});

// Register handler
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.send(require('../views/register')({ 
        error: 'All fields are required',
        user: req.session.user 
      }));
    }

    if (!isValidEmail(email)) {
      return res.send(require('../views/register')({ 
        error: 'Please enter a valid email address',
        user: req.session.user 
      }));
    }

    if (!isValidPassword(password)) {
      return res.send(require('../views/register')({ 
        error: 'Password must be at least 6 characters long',
        user: req.session.user 
      }));
    }

    if (password !== confirmPassword) {
      return res.send(require('../views/register')({ 
        error: 'Passwords do not match',
        user: req.session.user 
      }));
    }

    const users = await readJSON('users.json');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.send(require('../views/register')({ 
        error: 'User with this email already exists',
        user: req.session.user 
      }));
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password: await hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON('users.json', users);

    // Auto-login after registration
    req.session.user = sanitizeUser(newUser);
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Registration error:', error);
    res.send(require('../views/register')({ 
      error: 'Server error during registration',
      user: req.session.user 
    }));
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;