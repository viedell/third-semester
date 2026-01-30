const prisma = require('../config/database');

class PostService {
  /**
   * Generate slug from title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Calculate read time
   */
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Get all published posts (public)
   */
  async getPublishedPosts(page = 1, limit = 10, searchQuery = '') {
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { excerpt: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { has: searchQuery } }
        ]
      })
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readTime: true,
          views: true,
          tags: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single post by slug (public)
   */
  async getPostBySlug(slug, incrementViews = true) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatar: true
          }
        }
      }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new Error('Post not available');
    }

    // Increment views
    if (incrementViews) {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      });
      post.views += 1;
    }

    return post;
  }

  /**
   * Get all posts for authenticated user (writer/admin)
   */
  async getMyPosts(userId, role, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = role === 'ADMIN' ? {} : { authorId: userId };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create new post
   */
  async createPost(postData, authorId) {
    const { title, excerpt, content, coverImage, tags, status, metaTitle, metaDesc } = postData;

    // Generate slug
    let slug = this.generateSlug(title);
    
    // Ensure unique slug
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate read time
    const readTime = this.calculateReadTime(content);

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        tags: tags || [],
        status: status || 'DRAFT',
        readTime,
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || excerpt,
        authorId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return post;
  }

  /**
   * Update post
   */
  async updatePost(postId, updateData, userId, userRole) {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Check permissions
    if (userRole !== 'ADMIN' && existingPost.authorId !== userId) {
      throw new Error('Unauthorized to update this post');
    }

    // Update slug if title changed
    if (updateData.title && updateData.title !== existingPost.title) {
      updateData.slug = this.generateSlug(updateData.title);
    }

    // Update read time if content changed
    if (updateData.content) {
      updateData.readTime = this.calculateReadTime(updateData.content);
    }

    // Set publishedAt if status changed to PUBLISHED
    if (updateData.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return post;
  }

  /**
   * Delete post
   */
  async deletePost(postId, userId, userRole) {
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Check permissions
    if (userRole !== 'ADMIN' && existingPost.authorId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      tags: { has: tag }
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readTime: true,
          tags: true,
          author: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts,
      tag,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new PostService();