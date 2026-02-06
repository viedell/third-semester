const { AppError, ValidationError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Operational errors (ValidationError, AppError, etc.)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
        details: [`Unique constraint failed on: ${err.meta?.target?.join(', ')}`],
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
      },
    });
  }

  // Default internal server error
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
    },
  });
};

// Wrapper for async controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
};
