const userService = require('../services/user.service');
const { asyncHandler } = require('../middleware/error.middleware');

class UserController {
  getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers(
      parseInt(page) || 1,
      parseInt(limit) || 20
    );

    res.json({
      success: true,
      data: result,
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: { user },
    });
  });

  updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await userService.updateUserRole(
      req.params.id,
      role,
      req.user.id
    );

    res.json({
      success: true,
      data: { user },
    });
  });

  deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id, req.user.id);

    res.json({
      success: true,
      data: result,
    });
  });

  getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();

    res.json({
      success: true,
      data: { stats },
    });
  });
}

module.exports = new UserController();
