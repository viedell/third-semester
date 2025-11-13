const express = require('express');
const { readJSON, writeJSON, memoryStore } = require('../utils/fileHandler');
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

// Login handler
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

    const users = await readJSON('users.json');
    console.log('📋 Total users:', users.length);
    
    // Debug memory store
    console.log('🧠 Memory store users:', memoryStore.users.length);
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === normalizedEmail);
    
    console.log('👤 Looking for user:', normalizedEmail);
    console.log('👤 Found user:', user ? 'YES' : 'NO');
    
    if (!user) {
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    console.log('🔐 Password comparison...');
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
    console.log('🎯 Setting session user:', sanitizedUser.email);
    
    req.session.user = sanitizedUser;
    
    console.log('✅ LOGIN SUCCESSFUL');
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

// Register handler - MEMORY STORE COMPATIBLE
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

    // Read users - this will use memory store if file system fails
    let users = await readJSON('users.json');
    console.log('📋 Current users count:', users.length);
    console.log('🧠 Memory store users:', memoryStore.users.length);
    
    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find(u => u.email === normalizedEmail)) {
      return res.send(registerView({ 
        error: 'User with this email already exists',
        user: req.session.user 
      }));
    }

    // Create new user
    console.log('👤 Creating new user...');
    
    // Generate name from email
    const emailUsername = normalizedEmail.split('@')[0];
    const name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    
    // Hash the password
    const hashedPassword = hashPassword(password);
    
    const newUser = {
      id: generateId(),
      name: name,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    console.log('✅ New user created:', { name: newUser.name, email: newUser.email });
    
    // Add to users array
    users.push(newUser);
    
    // SAVE USERS - This will use memory store if file system fails
    console.log('💾 Saving users...');
    const saveResult = await writeJSON('users.json', users);
    console.log('✅ Save result:', saveResult ? 'SUCCESS' : 'FAILED');
    
    // ALWAYS use memory store for verification to be consistent
    console.log('🔍 Verification - memory store users:', memoryStore.users.length);
    console.log('🔍 Verification - memory store contains user:', 
      memoryStore.users.some(u => u.email === normalizedEmail) ? 'YES' : 'NO'
    );

    // Auto-login after registration
    const sanitizedUser = sanitizeUser(newUser);
    console.log('🎯 Setting session for new user:', sanitizedUser.email);
    req.session.user = sanitizedUser;
    
    console.log('✅ REGISTRATION COMPLETE');
    res.redirect('/profile');
    
  } catch (error) {
    console.error('💥 REGISTRATION ERROR:', error);
    res.send(registerView({ 
      error: 'Registration failed. Please try again.',
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