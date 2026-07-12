// src/middleware/role.middleware.js

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // authMiddleware should already attach the user to req.user
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please login.",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization failed.",
      });
    }
  };
};

export default authorize;