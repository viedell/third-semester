const express = require('express');
const { readJSON, writeJSON } = require('../utils/fileHandler');
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
    
    console.log('🔑 LOGIN ATTEMPT:', { 
      email: email,
      passwordLength: password ? password.length : 0 
    });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.send(loginView({ 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      }));
    }

    const users = await readJSON('users.json');
    console.log('📋 Total users in database:', users.length);
    
    // Debug: show all users
    users.forEach((user, index) => {
      console.log(`   User ${index + 1}: ${user.email} (${user.name})`);
    });
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === normalizedEmail);
    
    console.log('👤 Looking for user:', normalizedEmail);
    console.log('👤 Found user:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    console.log('🔐 Password comparison:');
    const isPasswordValid = comparePassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password comparison failed');
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    // Set session
    const sanitizedUser = sanitizeUser(user);
    console.log('🎯 Setting session user:', sanitizedUser);
    
    req.session.user = sanitizedUser;
    
    console.log('✅ LOGIN SUCCESSFUL - Redirecting to:', redirect);
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

// Register handler - SIMPLIFIED AND FIXED
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    console.log('📝 REGISTRATION ATTEMPT:', { 
      email: email,
      password: password ? '***' : 'MISSING'
    });
    
    // Validation
    if (!email || !password || !confirmPassword) {
      console.log('❌ Missing fields');
      return res.send(registerView({ 
        error: 'All fields are required',
        user: req.session.user 
      }));
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return res.send(registerView({ 
        error: 'Please enter a valid email address',
        user: req.session.user 
      }));
    }

    if (!isValidPassword(password)) {
      console.log('❌ Password too short');
      return res.send(registerView({ 
        error: 'Password must be at least 6 characters long',
        user: req.session.user 
      }));
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return res.send(registerView({ 
        error: 'Passwords do not match',
        user: req.session.user 
      }));
    }

    // Read users - MAKE SURE WE GET THE CURRENT DATA
    let users = [];
    try {
      users = await readJSON('users.json');
      console.log('📋 Current users count:', users.length);
    } catch (error) {
      console.log('📋 No users file found, starting fresh');
      users = [];
    }
    
    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find(u => u.email === normalizedEmail)) {
      console.log('❌ User already exists');
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
    console.log('🔐 Password hashed successfully');
    
    const newUser = {
      id: generateId(),
      name: name,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    console.log('✅ New user created:', { 
      name: newUser.name, 
      email: newUser.email 
    });
    
    // Add to users array
    users.push(newUser);
    
    // SAVE USERS - THIS IS THE CRITICAL PART
    console.log('💾 Saving users to database...');
    await writeJSON('users.json', users);
    console.log('✅ Users saved successfully!');
    
    // Verify the save worked
    const verifyUsers = await readJSON('users.json');
    console.log('🔍 Verification - users in database:', verifyUsers.length);
    
    if (verifyUsers.length === 0) {
      console.log('💥 CRITICAL: Users were not saved!');
      throw new Error('Users database save failed');
    }

    // Auto-login after registration
    const sanitizedUser = sanitizeUser(newUser);
    console.log('🎯 Setting session for new user:', sanitizedUser);
    req.session.user = sanitizedUser;
    
    console.log('✅ REGISTRATION COMPLETE - Redirecting to profile');
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