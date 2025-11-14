const express = require('express');
const { 
  hashPassword, 
  comparePassword, 
  isValidEmail, 
  isValidPassword, 
  sanitizeUser,
  generateId 
} = require('../utils/helpers');
const { requireGuest } = require('../middleware/auth');
const loginView = require('../views/login');
const registerView = require('../views/register');
const { findUserByEmail, createUser } = require('../utils/database');

const router = express.Router();

// Login page
router.get('/login', requireGuest, (req, res) => {
  const redirect = req.query.redirect || '/';
  res.send(loginView({ redirect, error: null, user: req.session.user }));
});

// Register page
router.get('/register', requireGuest, (req, res) => {
  res.send(registerView({ error: null, user: req.session.user }));
});

// Login handler with MongoDB
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const redirect = req.body.redirect || '/';
    
    console.log('🔑 LOGIN ATTEMPT:', { email });
    
    if (!email || !password) {
      return res.send(loginView({ 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      }));
    }

    // Find user in MongoDB
    const user = await findUserByEmail(email);
    console.log('👤 Database user found:', user ? 'YES' : 'NO');
    
    if (!user) {
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    // Compare password
    const isPasswordValid = comparePassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    // Set session
    const sanitizedUser = sanitizeUser(user);
    req.session.user = sanitizedUser;
    
    console.log('✅ LOGIN SUCCESSFUL - MongoDB');
    res.redirect(redirect);
    
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
    res.send(loginView({ 
      redirect: req.body.redirect || '/', 
      error: 'Server error during login',
      user: req.session.user 
    }));
  }
});

// Register handler with MongoDB
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    console.log('📝 REGISTRATION ATTEMPT:', { email });
    
    // Validation
    if (!email || !password || !confirmPassword) {
      return res.send(registerView({ 
        error: 'All fields are required',
        user: req.session.user 
      }));
    }

    if (!isValidEmail(email)) {
      return res.send(registerView({ 
        error: 'Please enter a valid email address',
        user: req.session.user 
      }));
    }

    if (!isValidPassword(password)) {
      return res.send(registerView({ 
        error: 'Password must be at least 6 characters long',
        user: req.session.user 
      }));
    }

    if (password !== confirmPassword) {
      return res.send(registerView({ 
        error: 'Passwords do not match',
        user: req.session.user 
      }));
    }

    // Check if user already exists in MongoDB
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.send(registerView({ 
        error: 'User with this email already exists',
        user: req.session.user 
      }));
    }

    // Create new user
    const emailUsername = email.split('@')[0];
    const name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    
    const newUser = {
      id: generateId(),
      name: name,
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    console.log('💾 Saving user to MongoDB...');
    await createUser(newUser);
    console.log('✅ User saved to MongoDB');

    // Auto-login
    const sanitizedUser = sanitizeUser(newUser);
    req.session.user = sanitizedUser;
    
    console.log('✅ REGISTRATION COMPLETE - MongoDB');
    res.redirect('/profile');
    
  } catch (error) {
    console.error('💥 REGISTRATION ERROR:', error);
    res.send(registerView({ 
      error: 'Registration failed: ' + error.message,
      user: req.session.user 
    }));
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  console.log('🚪 LOGOUT:', req.session.user?.email);
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;