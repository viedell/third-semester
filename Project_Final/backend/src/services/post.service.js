const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const prisma = new PrismaClient();

class PostService {
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createPost(data, authorId) {
    const slug = this.generateSlug(data.title);

    const post = await prisma.post.create({
      data: {
        ...data,
        slug,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  async getAllPosts(filters = {}) {
    const { page = 1, limit = 10, published, authorId, tags, search } = filters;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (published !== undefined) where.published = published === true || published === 'true';
    if (authorId) where.authorId = authorId;
    if (tags?.length) where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // PUBLIC - Anyone can view posts by ID
  async getPostById(id) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return post;
  }

  async getPostBySlug(slug) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...post,
      viewCount: post.viewCount + 1,
    };
  }

  async updatePost(id, data, userId, userRole) {
    const post = await this.getPostById(id);

    // Check permissions: author can edit their own posts, admins can edit any post
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to edit this post');
    }

    // Generate new slug if title is being updated
    if (data.title && data.title !== post.title) {
      data.slug = this.generateSlug(data.title);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedPost;
  }

  async deletePost(id, userId, userRole) {
    const post = await this.getPostById(id);

    // Check permissions: author can delete their own posts, admins can delete any post
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this post');
    }

    await prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  async getPostStats() {
    const [total, published, drafts, views] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
    ]);

    return {
      total,
      published,
      drafts,
      totalViews: views._sum.viewCount || 0,
    };
  }

  async getPopularPosts(limit = 5) {
    const limitNum = Number(limit) || 5;

    return prisma.post.findMany({
      where: { published: true },
      take: limitNum,
      orderBy: { viewCount: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getRecentPosts(limit = 5) {
    const limitNum = Number(limit) || 5;

    return prisma.post.findMany({
      where: { published: true },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

module.exports = new PostService();