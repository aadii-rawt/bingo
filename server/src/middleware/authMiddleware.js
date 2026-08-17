const User = require("../models/User");
const {
  verifyAccessToken,
} = require("../utils/token");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.status === "SUSPENDED" ||
      user.status === "REJECTED"
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role.slug)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource",
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role.isSuperAdmin) {
      return next();
    }

    const hasPermission = req.user.role.permissions.some(
      (item) => item.slug === permission
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
};