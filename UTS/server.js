const express = require('express');
const session = require('express-session');
const publicRoutes = require('./routes/publicRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeDataFiles } = require('./utils/fileHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for authentication
app.use(session({
  secret: 'techstore-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user available in all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║               TECHSTORE E-COMMERCE SERVER                  ║
╠════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                             ║
║                                                            ║
║  ✓ Authentication System                                   ║
║  ✓ User Registration & Login                               ║
║  ✓ Protected Cart & Checkout                               ║
║  ✓ Order History                                           ║
║  ✓ User Profiles                                           ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
});