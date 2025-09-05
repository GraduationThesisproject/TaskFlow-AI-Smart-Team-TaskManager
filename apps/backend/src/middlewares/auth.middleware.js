const jwt = require('../utils/jwt');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return sendResponse(res, 401, false, 'No token provided, access denied');
        }
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;
        if (!token) {
            return sendResponse(res, 401, false, 'No token provided, access denied');
        }
        const decoded = jwt.verifyToken(token);
        
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive) {
            return sendResponse(res, 401, false, 'Token is valid but user not found or inactive');
        }
        if (user.isLocked) {
            return sendResponse(res, 423, false, 'Account is temporarily locked');
        }
        const deviceId = req.header('X-Device-ID');
        
        if (deviceId) {
            try {
                const userSessions = await user.getSessions();
                const session = userSessions.getSessionByDevice(deviceId);
                
                if (session && session.isActive) {
                    await userSessions.updateActivity(session.sessionId);
                }
            } catch (sessionError) {
                return sendResponse(res, 401, false, 'Session validation warning');
            }
        }
        // Populate user roles
        const userRoles = await user.populate('roles');
        
        req.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            roles: userRoles.roles,
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return sendResponse(res, 401, false, 'Invalid token');
        } else if (error.name === 'TokenExpiredError') {
            return sendResponse(res, 401, false, 'Token expired');
        } else {
            console.error('Auth middleware error:', error);
            return sendResponse(res, 500, false, 'Server error in authentication');
        }
    }
};

// Middleware to check for specific system roles
const requireSystemRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, 401, false, 'Authentication required');
        }

        const userSystemRole = req.user.systemRole;
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        const hasRequiredRole = requiredRoles.includes(userSystemRole);

        if (!hasRequiredRole) {
            return sendResponse(res, 403, false, 'Insufficient system permissions');
        }

        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = requireSystemRole('admin');

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return next();
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;

        if (!token) {
            return next();
        }

        const decoded = jwt.verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (user) {
            // SECURITY FIX: Get verified roles from database
            const userRoles = await user.getRoles();
            
            req.user = {
                id: user._id,
                email: user.email,
                name: user.name,
                roles: userRoles,
                systemRole: userRoles.systemRole
            };
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

module.exports = {
    authMiddleware,
    requireSystemRole,
    requireAdmin,
    optionalAuth,
    default: authMiddleware,
};

// Export default as authMiddleware for backward compatibility
module.exports.default = authMiddleware;
