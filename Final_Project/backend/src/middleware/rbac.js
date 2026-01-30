/**
 * Role-Based Access Control middleware
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Check if user is post owner or admin
 */
const isPostOwnerOrAdmin = async (req, res, next) => {
  const prisma = require('../config/database');
  
  try {
    const postId = req.params.id;
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Allow if admin or post owner
    if (req.user.role === 'ADMIN' || post.authorId === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to modify this post'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking permissions'
    });
  }
};

module.exports = {
  authorize,
  isPostOwnerOrAdmin
};