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

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'techstore-futuristic-red-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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