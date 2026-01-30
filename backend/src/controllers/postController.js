const postService = require('../services/postService');

class PostController {
  /**
   * Get all published posts (public)
   */
  async getPublishedPosts(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await postService.getPublishedPosts(
        parseInt(page),
        parseInt(limit),
        search
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single post by slug (public)
   */
  async getPostBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const post = await postService.getPostBySlug(slug);
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts by tag (public)
   */
  async getPostsByTag(req, res, next) {
    try {
      const { tag } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await postService.getPostsByTag(
        tag,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's posts (authenticated)
   */
  async getMyPosts(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await postService.getMyPosts(
        req.user.id,
        req.user.role,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new post (authenticated, writer/admin)
   */
  async createPost(req, res, next) {
    try {
      const post = await postService.createPost(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update post (authenticated, owner/admin)
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await postService.updatePost(
        id,
        req.body,
        req.user.id,
        req.user.role
      );
      
      res.json({
        success: true,
        message: 'Post updated successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete post (authenticated, owner/admin)
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await postService.deletePost(
        id,
        req.user.id,
        req.user.role
      );
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();