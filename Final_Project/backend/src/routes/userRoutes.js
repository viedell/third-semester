const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { body } = require('express-validator');
const { validate } = require('../utils/validation');
const { uuidValidator, paginationValidator } = require('../middleware/validator');

// Admin only routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  paginationValidator,
  validate,
  userController.getAllUsers
);

router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  uuidValidator,
  body('role').isIn(['ADMIN', 'WRITER', 'READER']).withMessage('Invalid role'),
  validate,
  userController.updateUserRole
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uuidValidator,
  validate,
  userController.deleteUser
);

// Authenticated user routes
router.put(
  '/profile',
  authenticate,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('avatar').optional().isURL(),
  body('newPassword').optional().isLength({ min: 6 }),
  validate,
  userController.updateProfile
);

module.exports = router;