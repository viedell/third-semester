const postService = require('../services/post.service');
const { asyncHandler } = require('../middleware/error.middleware');

class PostController {
  // Create a new post
  createPost = asyncHandler(async (req, res) => {
    const post = await postService.createPost(req.body, req.user.id);
    res.status(201).json({ success: true, data: post });
  });

  // Get all posts (with pagination)
  getAllPosts = asyncHandler(async (req, res) => {
    const { page, limit, published, authorId, tags, search } = req.query;
    const result = await postService.getAllPosts({
      page,
      limit,
      published,
      authorId,
      tags,
      search,
    });
    // data contains posts + pagination
    res.json({ success: true, data: result });
  });

  // Get post by ID
  getPostById = asyncHandler(async (req, res) => {
    const post = await postService.getPostById(req.params.id);
    res.json({ success: true, data: post });
  });

  // Get post by slug
  getPostBySlug = asyncHandler(async (req, res) => {
    const post = await postService.getPostBySlug(req.params.slug);
    res.json({ success: true, data: post });
  });

  // Update a post
  updatePost = asyncHandler(async (req, res) => {
    const post = await postService.updatePost(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: post });
  });

  // Delete a post
  deletePost = asyncHandler(async (req, res) => {
    const result = await postService.deletePost(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: result });
  });

  // Get post stats
  getPostStats = asyncHandler(async (req, res) => {
    const stats = await postService.getPostStats();
    res.json({ success: true, data: stats });
  });

  // Get popular posts
  getPopularPosts = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const posts = await postService.getPopularPosts(parseInt(limit) || 5);
    res.json({ success: true, data: { posts } });
  });

  // Get recent posts
  getRecentPosts = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const posts = await postService.getRecentPosts(parseInt(limit) || 5);
    res.json({ success: true, data: { posts } });
  });
}

module.exports = new PostController();
