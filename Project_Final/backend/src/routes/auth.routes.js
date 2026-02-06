const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, authValidation } = require('../middleware/validation.middleware');

// Public routes
router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  validate(authValidation.login),
  authController.login
);

// Protected routes
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

module.exports = router;
