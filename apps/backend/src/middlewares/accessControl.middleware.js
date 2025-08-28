const { sendResponse } = require('../utils/responseHandler');
const logger = require('../config/logger');

// Access Control Matrix based on the provided image
const ACCESS_MATRIX = {
  'super_admin': {
    'dashboard_overview': 'full',
    'user_role_mgmt': 'full',
    'templates_configs': 'full',
    'analytics_insights': 'full',
    'system_health': 'full',
    'integration_mgmt': 'full',
    'notifications_comms': 'full',
    'powerbi_integration': 'full',
    'customer_support': 'full',
    'profile_settings': 'full',
    'security_compliance': 'full',
    'deployment_env': 'full'
  },
  'admin': {
    'dashboard_overview': 'full',
    'user_role_mgmt': 'limited', // All except Super Admins
    'templates_configs': 'full',
    'analytics_insights': 'full',
    'system_health': 'view',
    'integration_mgmt': 'limited',
    'notifications_comms': 'full',
    'powerbi_integration': 'view_manage_datasets',
    'customer_support': 'full',
    'profile_settings': 'basic_system_self',
    'security_compliance': 'logs_readonly',
    'deployment_env': 'denied'
  },
  'moderator': {
    'dashboard_overview': 'limited',
    'user_role_mgmt': 'limited', // No deletes, no role assign
    'templates_configs': 'readonly',
    'analytics_insights': 'limited',
    'system_health': 'view_only',
    'integration_mgmt': 'denied',
    'notifications_comms': 'limited',
    'powerbi_integration': 'view_only',
    'customer_support': 'respond_only',
    'profile_settings': 'self_only',
    'security_compliance': 'denied',
    'deployment_env': 'denied'
  }
};

// Helper function to check access level
const checkAccessLevel = (userRole, feature, requiredLevel = 'view') => {
  if (!ACCESS_MATRIX[userRole] || !ACCESS_MATRIX[userRole][feature]) {
    return false;
  }

  const userAccess = ACCESS_MATRIX[userRole][feature];
  
  // Access level hierarchy (from lowest to highest)
  const accessLevels = ['denied', 'view_only', 'view', 'limited', 'basic_system_self', 'self_only', 'respond_only', 'view_manage_datasets', 'logs_readonly', 'full'];
  
  const userLevelIndex = accessLevels.indexOf(userAccess);
  const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
  
  return userLevelIndex >= requiredLevelIndex;
};

// Middleware to check feature access
const requireFeatureAccess = (feature, requiredLevel = 'view') => {
  return (req, res, next) => {
    try {
      // Check if admin info is available (from adminAuth middleware)
      if (!req.admin) {
        return sendResponse(res, 401, false, 'Authentication required');
      }

      const adminRole = req.admin.role;
      
      if (!adminRole) {
        return sendResponse(res, 403, false, 'Admin role not found');
      }

      // Check if admin has access to the feature
      if (!checkAccessLevel(adminRole, feature, requiredLevel)) {
        logger.warn(`Access denied: Admin ${req.admin._id} (${adminRole}) attempted to access ${feature} (required: ${requiredLevel})`);
        return sendResponse(res, 403, false, `Access denied to ${feature}. Insufficient permissions.`);
      }

      logger.info(`Access granted: Admin ${req.admin._id} (${adminRole}) accessing ${feature}`);
      next();
    } catch (error) {
      logger.error('Feature access check error:', error);
      return sendResponse(res, 500, false, 'Server error checking feature access');
    }
  };
};

// Specific feature access middlewares
const requireUserManagementAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('user_role_mgmt', requiredLevel);

const requireAnalyticsAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('analytics_insights', requiredLevel);

const requireSystemHealthAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('system_health', requiredLevel);

const requireIntegrationAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('integration_mgmt', requiredLevel);

const requirePowerBIAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('powerbi_integration', requiredLevel);

const requireSecurityAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('security_compliance', requiredLevel);

const requireDeploymentAccess = (requiredLevel = 'view') => 
  requireFeatureAccess('deployment_env', requiredLevel);

// Middleware to check if admin can manage other users
const requireUserManagementPermission = (action = 'view') => {
  return (req, res, next) => {
    try {
      // Check if admin info is available (from adminAuth middleware)
      if (!req.admin) {
        return sendResponse(res, 401, false, 'Authentication required');
      }

      const adminRole = req.admin.role;
      const targetUserId = req.params.userId || req.body.userId;
      
      if (!adminRole) {
        return sendResponse(res, 403, false, 'Admin role not found');
      }

      // Super Admin can manage everyone
      if (adminRole === 'super_admin') {
        return next();
      }

      // Admin can manage users except Super Admins
      if (adminRole === 'admin') {
        if (action === 'delete' || action === 'role_assign') {
          // Check if target user is Super Admin
          const User = require('../models/User');
          const UserRoles = require('../models/UserRoles');
          
          UserRoles.findOne({ userId: targetUserId })
            .then(userRoles => {
              if (userRoles && userRoles.systemRole === 'super_admin') {
                return sendResponse(res, 403, false, 'Admins cannot modify Super Admin users');
              }
              next();
            })
            .catch(error => {
              logger.error('Error checking target user role:', error);
              return sendResponse(res, 500, false, 'Server error checking user permissions');
            });
        } else {
          next();
        }
        return;
      }

      // Moderator has limited access
      if (adminRole === 'moderator') {
        if (action === 'delete' || action === 'role_assign') {
          return sendResponse(res, 403, false, 'Moderators cannot delete users or assign roles');
        }
        return next();
      }

      return sendResponse(res, 403, false, 'Insufficient permissions for user management');
    } catch (error) {
      logger.error('User management permission check error:', error);
      return sendResponse(res, 500, false, 'Server error checking user management permissions');
    }
  };
};

// Middleware to check if user can access their own profile
const requireProfileAccess = (targetUserId) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return sendResponse(res, 401, false, 'Authentication required');
      }

      const userSystemRole = req.user.systemRole;
      const requestingUserId = req.user.id;
      
      // Users can always access their own profile
      if (requestingUserId === targetUserId) {
        return next();
      }

      // Check if user has permission to access other profiles
      if (userSystemRole === 'super_admin') {
        return next(); // Full access
      }

      if (userSystemRole === 'admin') {
        // Admin can access basic system profiles and their own
        return next();
      }

      if (userSystemRole === 'moderator') {
        // Moderator can only access their own profile
        return sendResponse(res, 403, false, 'Moderators can only access their own profile');
      }

      return sendResponse(res, 403, false, 'Insufficient permissions for profile access');
    } catch (error) {
      logger.error('Profile access check error:', error);
      return sendResponse(res, 500, false, 'Server error checking profile access permissions');
    }
  };
};

module.exports = {
  requireFeatureAccess,
  requireUserManagementAccess,
  requireAnalyticsAccess,
  requireSystemHealthAccess,
  requireIntegrationAccess,
  requirePowerBIAccess,
  requireSecurityAccess,
  requireDeploymentAccess,
  requireUserManagementPermission,
  requireProfileAccess,
  checkAccessLevel,
  ACCESS_MATRIX
};
