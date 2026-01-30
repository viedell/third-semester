const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId, newRole) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const { firstName, lastName, bio, avatar, currentPassword, newPassword } = updateData;

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        throw new Error('Current password is required to set new password');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
      delete updateData.currentPassword;
      delete updateData.newPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(updateData.password && { password: updateData.password })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        avatar: true
      }
    });

    return updatedUser;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();