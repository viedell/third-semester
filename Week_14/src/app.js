const express = require('express');
const jobRoutes = require('./routes/jobRoutes'); // You will create this next

const app = express();

// Middleware: Standard operating procedure
app.use(express.json());

// Routes: Mapping the market entries
app.use('/api/v1/jobs', jobRoutes);

// Global Error Handler: Your "Stop Loss" for unexpected crashes
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app; // Export for testing and server.js