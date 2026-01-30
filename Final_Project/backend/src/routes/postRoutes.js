const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize, isPostOwnerOrAdmin } = require('../middleware/rbac');
const {
  createPostValidator,
  updatePostValidator,
  uuidValidator,
  slugValidator,
  paginationValidator
} = require('../middleware/validator');
const { validate } = require('../utils/validation');

// Public routes
router.get('/published', paginationValidator, validate, postController.getPublishedPosts);
router.get('/slug/:slug', slugValidator, validate, postController.getPostBySlug);
router.get('/tag/:tag', paginationValidator, validate, postController.getPostsByTag);

// Protected routes - Writer and Admin can create/manage posts
router.get(
  '/my-posts',
  authenticate,
  authorize('WRITER', 'ADMIN'),
  paginationValidator,
  validate,
  postController.getMyPosts
);

router.post(
  '/',
  authenticate,
  authorize('WRITER', 'ADMIN'),
  createPostValidator,
  validate,
  postController.createPost
);

router.put(
  '/:id',
  authenticate,
  authorize('WRITER', 'ADMIN'),
  uuidValidator,
  updatePostValidator,
  validate,
  isPostOwnerOrAdmin,
  postController.updatePost
);

router.delete(
  '/:id',
  authenticate,
  authorize('WRITER', 'ADMIN'),
  uuidValidator,
  validate,
  isPostOwnerOrAdmin,
  postController.deletePost
);

module.exports = router;