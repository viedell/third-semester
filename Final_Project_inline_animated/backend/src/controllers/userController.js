const userService = require('../services/userService');

class UserController {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await userService.getAllUsers(parseInt(page), parseInt(limit));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await userService.updateUserRole(id, role);
      
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile (authenticated user)
   */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();