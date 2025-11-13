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
    const { email, password, redirect = '/' } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.send(loginView({ 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      }));
    }

    const users = await readJSON('users.json');
    console.log('Total users in database:', users.length);
    
    const user = users.find(u => u.email === email);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found');
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    console.log('Comparing passwords...');
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.send(loginView({ 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      }));
    }

    // Set session
    const sanitizedUser = sanitizeUser(user);
    console.log('Setting session user:', sanitizedUser);
    req.session.user = sanitizedUser;
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.send(loginView({ 
          redirect, 
          error: 'Login failed - session error',
          user: req.session.user 
        }));
      }
      
      console.log('Login successful, redirecting to:', redirect);
      // Redirect to intended page or home
      res.redirect(redirect);
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.send(loginView({ 
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
    
    console.log('Registration attempt:', { name, email });
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
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

    const users = await readJSON('users.json');
    console.log('Current users count:', users.length);
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.send(registerView({ 
        error: 'User with this email already exists',
        user: req.session.user 
      }));
    }

    // Create new user
    console.log('Creating new user...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');
    
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    console.log('New user created:', { id: newUser.id, name: newUser.name, email: newUser.email });
    
    users.push(newUser);
    console.log('Saving users to database...');
    await writeJSON('users.json', users);
    console.log('Users saved successfully');

    // Auto-login after registration
    const sanitizedUser = sanitizeUser(newUser);
    console.log('Setting session for new user:', sanitizedUser);
    req.session.user = sanitizedUser;
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.send(registerView({ 
          error: 'Registration successful but login failed',
          user: req.session.user 
        }));
      }
      
      console.log('Registration successful, redirecting to profile');
      res.redirect('/profile');
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.send(registerView({ 
      error: 'Server error during registration: ' + error.message,
      user: req.session.user 
    }));
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  console.log('Logging out user:', req.session.user?.email);
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;