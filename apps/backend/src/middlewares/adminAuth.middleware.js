const jwt = require('../utils/jwt');
const Admin = require('../models/Admin');
const { sendResponse } = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * Middleware to authenticate admin users
 * Works with the new Admin model (separate from User model)
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendResponse(res, 401, false, 'Access denied. No token provided.');
    }

    // Verify token using JWT utility
    const decoded = jwt.verifyToken(token);
    logger.info(`Admin auth: Token decoded:`, decoded);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.id).select('-password -twoFactorSecret -backupCodes -recoveryToken');
    logger.info(`Admin auth: Admin lookup result:`, admin ? { id: admin._id, email: admin.userEmail, role: admin.role } : 'null');
    
    if (!admin) {
      return sendResponse(res, 401, false, 'Access denied. Invalid token.');
    }

    if (!admin.isActive) {
      return sendResponse(res, 401, false, 'Access denied. Account is deactivated.');
    }

    // Add admin info to request (for backward compatibility with existing controllers)
    req.admin = admin;
    req.user = { id: admin._id };
    next();
  } catch (error) {
    logger.error('Admin authentication middleware error:', error);
    
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
const requireAdminPermission = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if admin info is already set by authenticateAdmin middleware
      if (!req.admin) {
        return sendResponse(res, 401, false, 'Access denied. Authentication required.');
      }

      // If no specific permissions required, proceed
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
      }

      // Check if admin has required permissions
      const admin = req.admin;
      const hasPermission = requiredPermissions.every(permission => 
        admin.hasPermission(permission)
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
const requireSuperAdmin = async (req, res, next) => {
  try {
    // Check if admin info is already set by authenticateAdmin middleware
    if (!req.admin) {
      return sendResponse(res, 401, false, 'Access denied. Authentication required.');
    }

    // Check if admin is super admin
    if (req.admin.role !== 'super_admin') {
      return sendResponse(res, 403, false, 'Access denied. Super admin privileges required.');
    }

    next();
  } catch (error) {
    logger.error('Super admin middleware error:', error);
    return sendResponse(res, 500, false, 'Internal server error.');
  }
};

/**
 * Middleware to check if admin has admin management permissions
 */
const requireAdminManagement = async (req, res, next) => {
  try {
    // Check if admin info is already set by authenticateAdmin middleware
    if (!req.admin) {
      return sendResponse(res, 401, false, 'Access denied. Authentication required.');
    }

    // Check if admin has admin management permission
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Access denied. Admin management permission required.');
    }

    next();
  } catch (error) {
    logger.error('Admin management middleware error:', error);
    return sendResponse(res, 500, false, 'Internal server error.');
  }
};

module.exports = {
  authenticateAdmin,
  requireAdminPermission,
  requireSuperAdmin,
  requireAdminManagement
};
