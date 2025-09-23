const logger = require('../config/logger');

/**
 * GitHub Security Middleware
 * Ensures proper security and privacy measures for GitHub-related operations
 */

// Validate GitHub token scopes for sensitive operations
const validateGitHubScopes = (requiredScopes = ['read:org']) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user || !user.github || !user.github.accessToken) {
        return res.status(401).json({
          success: false,
          message: 'GitHub authentication required'
        });
      }

      // In a real implementation, you would validate the token scopes here
      // For now, we'll assume the token was validated during the linking process
      logger.info(`GitHub operation authorized for user: ${user._id}`);
      next();
    } catch (error) {
      logger.error('GitHub scope validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during scope validation'
      });
    }
  };
};

// Ensure user can only access their own GitHub data
const validateGitHubOwnership = (req, res, next) => {
  try {
    const user = req.user;
    const requestedUserId = req.params.userId || req.body.userId;

    if (requestedUserId && requestedUserId !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Cannot access other users\' GitHub data'
      });
    }

    next();
  } catch (error) {
    logger.error('GitHub ownership validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during ownership validation'
    });
  }
};

// Sanitize GitHub data before sending to client
const sanitizeGitHubData = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && data.data) {
      // Remove sensitive GitHub information
      if (Array.isArray(data.data)) {
        data.data = data.data.map(item => sanitizeGitHubItem(item));
      } else if (typeof data.data === 'object') {
        data.data = sanitizeGitHubItem(data.data);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Helper function to sanitize individual GitHub items
const sanitizeGitHubItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  
  // Remove sensitive fields
  const sensitiveFields = ['accessToken', 'tokenExpiresAt', 'scope'];
  const sanitized = { ...item };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  // If it's a user object with GitHub data, sanitize the GitHub section
  if (sanitized.github) {
    sanitized.github = {
      githubId: sanitized.github.githubId,
      username: sanitized.github.username,
      avatar: sanitized.github.avatar,
      email: sanitized.github.email,
      lastSync: sanitized.github.lastSync
    };
  }
  
  return sanitized;
};

// Rate limiting for GitHub API calls
const rateLimitGitHubCalls = (maxCalls = 10, windowMs = 60000) => {
  const calls = new Map();
  
  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    const now = Date.now();
    
    if (!userId) {
      return next();
    }
    
    const userCalls = calls.get(userId) || [];
    const recentCalls = userCalls.filter(timestamp => now - timestamp < windowMs);
    
    if (recentCalls.length >= maxCalls) {
      return res.status(429).json({
        success: false,
        message: 'Too many GitHub API calls. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    recentCalls.push(now);
    calls.set(userId, recentCalls);
    
    next();
  };
};

// Validate GitHub organization access
const validateOrgAccess = async (req, res, next) => {
  try {
    const { org } = req.params;
    const user = req.user;
    
    if (!org) {
      return res.status(400).json({
        success: false,
        message: 'Organization parameter is required'
      });
    }
    
    // In a real implementation, you would verify the user has access to this org
    // For now, we'll log the access attempt
    logger.info(`GitHub org access attempt: user ${user._id} accessing org ${org}`);
    
    next();
  } catch (error) {
    logger.error('GitHub org access validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during org access validation'
    });
  }
};

// Audit GitHub operations
const auditGitHubOperation = (operation) => {
  return (req, res, next) => {
    const startTime = Date.now();
    const userId = req.user?._id?.toString();
    const org = req.params?.org;
    
    // Log the operation start
    logger.info(`GitHub operation started: ${operation} by user ${userId}${org ? ` for org ${org}` : ''}`);
    
    // Override res.json to log completion
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      const success = data?.success !== false;
      
      logger.info(`GitHub operation completed: ${operation} by user ${userId}${org ? ` for org ${org}` : ''} - ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`);
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  validateGitHubScopes,
  validateGitHubOwnership,
  sanitizeGitHubData,
  rateLimitGitHubCalls,
  validateOrgAccess,
  auditGitHubOperation
};
