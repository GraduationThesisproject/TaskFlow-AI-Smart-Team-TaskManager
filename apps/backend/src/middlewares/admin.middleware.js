const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Middleware to check if the authenticated user is an admin
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendResponse(res, 401, false, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return sendResponse(res, 401, false, 'Access denied. Invalid token.');
    }

    if (!admin.isActive) {
      return sendResponse(res, 401, false, 'Access denied. Account is deactivated.');
    }

    // Add admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, false, 'Access denied. Invalid token.');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, false, 'Access denied. Token expired.');
    }
    
    return sendResponse(res, 500, false, 'Internal server error.');
  }
};

/**
 * Middleware to check if admin has specific permissions
 */
const adminPermissionMiddleware = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // First check if user is admin
      await adminMiddleware(req, res, (err) => {
        if (err) return next(err);
      });

      // If no specific permissions required, proceed
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
      }

      // Check if admin has required permissions
      const admin = req.admin;
      const hasPermission = requiredPermissions.every(permission => 
        admin.permissions && admin.permissions.includes(permission)
      );

      if (!hasPermission) {
        return sendResponse(res, 403, false, 'Access denied. Insufficient permissions.');
      }

      next();
    } catch (error) {
      logger.error('Admin permission middleware error:', error);
      return sendResponse(res, 500, false, 'Internal server error.');
    }
  };
};

/**
 * Middleware to check if admin is super admin
 */
const superAdminMiddleware = async (req, res, next) => {
  try {
    // First check if user is admin
    await adminMiddleware(req, res, (err) => {
      if (err) return next(err);
    });

    // Check if admin is super admin
    if (!req.admin.isSuperAdmin) {
      return sendResponse(res, 403, false, 'Access denied. Super admin privileges required.');
    }

    next();
  } catch (error) {
    logger.error('Super admin middleware error:', error);
    return sendResponse(res, 500, false, 'Internal server error.');
  }
};

module.exports = {
  adminMiddleware,
  adminPermissionMiddleware,
  superAdminMiddleware
};
