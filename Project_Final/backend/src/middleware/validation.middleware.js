const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to run validation rules
 * @param {Array} validations - array of express-validator rules
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(v => v.run(req)));

    // Collect errors
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const details = errors.array().map(err => err.msg);

    // Respond immediately instead of throwing
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
  };
};

// === Auth validation rules ===
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
};

// === Post validation rules ===
const postValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required'),
    body('excerpt')
      .trim()
      .notEmpty()
      .withMessage('Excerpt is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published must be a boolean'),
  ],

  update: [
    body('title')
      .optional()
      .trim(),
    body('content')
      .optional()
      .trim(),
    body('excerpt')
      .optional()
      .trim(),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published must be a boolean'),
  ],

  idParam: [
    param('id')
      .isUUID()
      .withMessage('Invalid post ID format'),
  ],

  slugParam: [
    param('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid slug format'),
  ],
};

// === User validation rules ===
const userValidation = {
  idParam: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID format'),
  ],
  updateRole: [
    body('role')
      .isIn(['ADMIN', 'WRITER', 'READER'])
      .withMessage('Invalid role'),
  ],
};

// === Query validation ===
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Limit must be a positive integer'),
  ],
};

module.exports = {
  validate,
  authValidation,
  postValidation,
  userValidation,
  queryValidation,
};
