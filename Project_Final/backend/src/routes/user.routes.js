const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, userValidation, queryValidation } = require('../middleware/validation.middleware');

// All user routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get(
  '/',
  authorize('ADMIN'),
  validate(queryValidation.pagination),
  userController.getAllUsers
);

// Get user stats (Admin only)
router.get(
  '/stats',
  authorize('ADMIN'),
  userController.getUserStats
);

// Get user by ID
router.get(
  '/:id',
  validate(userValidation.idParam),
  userController.getUserById
);

// Update user role (Admin only)
router.patch(
  '/:id/role',
  authorize('ADMIN'),
  validate([...userValidation.idParam, ...userValidation.updateRole]),
  userController.updateUserRole
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(userValidation.idParam),
  userController.deleteUser
);

module.exports = router;
