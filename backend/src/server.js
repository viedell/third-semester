require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/views', express.static(path.join(__dirname, '../../frontend/views')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevInsights API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Serve frontend pages for non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/index.html'));
});

app.get('/blog-list', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/blog-list.html'));
});

app.get('/blog-detail', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/blog-detail.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/register.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/admin-dashboard.html'));
});

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Catch-all route - redirect to home
app.get('*', (req, res) => {
  res.redirect('/');
});

// Error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 DevInsights Server Running!`);
    console.log('========================================');
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
    console.log(`🔌 API URL: http://localhost:${PORT}/api`);
    console.log('========================================');
    console.log('\n📧 Test Accounts:');
    console.log('   Admin:  admin@devinsights.com  / admin123');
    console.log('   Writer: writer@devinsights.com / writer123');
    console.log('   Reader: reader@devinsights.com / reader123');
    console.log('\n========================================\n');
  });
}

module.exports = app;