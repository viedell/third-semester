const { body, param, query } = require('express-validator');

// Auth validators
const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
];

const loginValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Post validators
const createPostValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required')
    .isLength({ min: 20, max: 300 })
    .withMessage('Excerpt must be between 20 and 300 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Meta title must not exceed 60 characters'),
  body('metaDesc')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description must not exceed 160 characters')
];

const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage('Excerpt must be between 20 and 300 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL')
];

// Param validators
const uuidValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format')
];

const slugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format')
];

// Query validators
const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  registerValidator,
  loginValidator,
  createPostValidator,
  updatePostValidator,
  uuidValidator,
  slugValidator,
  paginationValidator
};