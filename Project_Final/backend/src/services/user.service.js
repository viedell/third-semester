const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const prisma = new PrismaClient();

class UserService {
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        posts: {
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true,
            viewCount: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUserRole(id, role, requestingUserId) {
    // Prevent users from changing their own role
    if (id === requestingUserId) {
      throw new ForbiddenError('You cannot change your own role');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async deleteUser(id, requestingUserId) {
    // Prevent users from deleting themselves
    if (id === requestingUserId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async getUserStats() {
    const [totalUsers, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count;
      return acc;
    }, {});

    return {
      total: totalUsers,
      byRole: roleStats,
    };
  }
}

module.exports = new UserService();
