const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, postValidation, queryValidation } = require('../middleware/validation.middleware');

// ========================================
// PUBLIC ROUTES - NO AUTHENTICATION
// ========================================

// Get popular posts
router.get('/popular', postController.getPopularPosts);

// Get recent posts
router.get('/recent', postController.getRecentPosts);

// Get posts by slug (for public blog viewing)
router.get(
  '/slug/:slug',
  validate(postValidation.slugParam),
  postController.getPostBySlug
);

// Get all posts (with optional filters)
router.get(
  '/',
  validate(queryValidation.pagination),
  postController.getAllPosts
);

// Get single post by ID (PUBLIC - anyone can view)
router.get(
  '/:id',
  validate(postValidation.idParam),
  postController.getPostById
);

// ========================================
// PROTECTED ROUTES - AUTHENTICATION REQUIRED
// ========================================

// Apply authentication to all routes below
router.use(authenticate);

// Get post statistics (Admin only)
router.get(
  '/stats/admin',
  authorize('ADMIN'),
  postController.getPostStats
);

// Create new post (Writer or Admin)
router.post(
  '/',
  authorize('WRITER', 'ADMIN'),
  validate(postValidation.create),
  postController.createPost
);

// Update existing post (Author or Admin)
router.patch(
  '/:id',
  authorize('WRITER', 'ADMIN'),
  validate([...postValidation.idParam, ...postValidation.update]),
  postController.updatePost
);

// Delete post (Author or Admin)
router.delete(
  '/:id',
  authorize('WRITER', 'ADMIN'),
  validate(postValidation.idParam),
  postController.deletePost
);

module.exports = router;