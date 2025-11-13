const express = require('express');
const session = require('express-session');
const path = require('path');
const publicRoutes = require('./routes/publicRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeDataFiles } = require('./utils/fileHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple Memory Session Store (since file storage might not work on Vercel)
const MemoryStore = session.MemoryStore;

// Session middleware with proper configuration
app.use(session({
  name: 'techstore.sid',
  secret: process.env.SESSION_SECRET || 'techstore-futuristic-red-secret-key-2024-very-long-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore(),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Make user available in all routes and views
app.use((req, res, next) => {
  console.log('🔐 Session Check - User:', req.session.user ? req.session.user.email : 'No user');
  console.log('🔐 Session ID:', req.sessionID);
  res.locals.user = req.session.user || null;
  next();
});

// Debug middleware to see all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Initialize and start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                🚀 TECHSTORE SERVER READY                  ║
╠════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}       ║
║                                                            ║
║  ✅ Authentication System                                  ║
║  ✅ Product Catalog                                        ║
║  ✅ Shopping Cart                                          ║
║  ✅ Order Management                                       ║
║  ✅ User Profiles                                          ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}).catch(console.error);