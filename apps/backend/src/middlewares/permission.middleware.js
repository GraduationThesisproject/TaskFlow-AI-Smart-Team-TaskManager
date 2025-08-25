const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const Board = require('../models/Board');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Require system admin role
const requireSystemAdmin = (req, res, next) => {
    (async () => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();

            if (userRoles.systemRole !== 'admin' && userRoles.systemRole !== 'super_admin') {
                return sendResponse(res, 403, false, 'System admin permissions required');
            }

            next();
        } catch (error) {
            logger.error('System admin check error:', error);
            sendResponse(res, 500, false, 'Server error checking admin permissions');
        }
    })();
};

// Require workspace permission
const requireWorkspacePermission = (roleOrPermission = 'member') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;

            if (!workspaceId) {
                return sendResponse(res, 400, false, 'Workspace ID required');
            }

            // Check if workspace exists first
            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return sendResponse(res, 404, false, 'Workspace not found');
            }

            const user = await User.findById(userId);
            const userRoles = await user.getRoles();

            // Permission-mode: roleOrPermission starts with 'can'
            if (typeof roleOrPermission === 'string' && roleOrPermission.startsWith('can')) {
                const wsRole = userRoles.workspaces.find(ws => ws.workspace.toString() === workspaceId.toString());
                const allowed = wsRole?.permissions?.[roleOrPermission] === true;
                if (!allowed) {
                    return sendResponse(res, 403, false, `Workspace permission '${roleOrPermission}' required`);
                }
            } else {
                // Role-mode: fallback to role hierarchy check
                if (!userRoles.hasWorkspaceRole(workspaceId, roleOrPermission)) {
                    return sendResponse(res, 403, false, `Workspace ${roleOrPermission} role required`);
                }
            }

            req.workspace = workspace;
            next();
        } catch (error) {
            logger.error('Workspace permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking workspace permissions');
        }
    };
};

// Require space permission (formerly project permission)
const requireSpacePermission = (roleOrPermission = 'member') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const spaceId = req.params.id || req.params.spaceId || req.body.spaceId;

            if (!spaceId) {
                return sendResponse(res, 400, false, 'Space ID required');
            }

            const user = await User.findById(userId);
            const userRoles = await user.getRoles();

            // Check if it's a permission (starts with 'can') or a role
            if (roleOrPermission.startsWith('can')) {
                if (!userRoles.hasSpacePermission(spaceId, roleOrPermission)) {
                    return sendResponse(res, 403, false, `Permission '${roleOrPermission}' required`);
                }
            } else {
                if (!userRoles.hasSpaceRole(spaceId, roleOrPermission)) {
                    return sendResponse(res, 403, false, `Space ${roleOrPermission} role required`);
                }
            }

            req.space = await Space.findById(spaceId);
            next();
        } catch (error) {
            logger.error('Space permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking space permissions');
        }
    };
};

// Require specific space permission
const requireSpaceSpecificPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const spaceId = req.params.id || req.params.spaceId || req.body.spaceId;

            if (!spaceId) {
                return sendResponse(res, 400, false, 'Space ID required');
            }

            const [user, space] = await Promise.all([
                User.findById(userId),
                Space.findById(spaceId)
            ]);

            if (!space) {
                return sendResponse(res, 404, false, 'Space not found');
            }

            const userRoles = await user.getRoles();
            const hasRolePermission = userRoles.hasSpacePermission(spaceId, permission);
            const hasMemberPermission = (typeof space.hasPermission === 'function')
                ? space.hasPermission(userId, permission)
                : false;

            if (!hasRolePermission && !hasMemberPermission) {
                return sendResponse(res, 403, false, `Space permission '${permission}' required`);
            }

            req.space = space;
            next();
        } catch (error) {
            logger.error('Space permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking space permissions');
        }
    };
};

// Require board permission
const requireBoardPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const boardId = req.params.boardId || req.body.boardId;

            if (!boardId) {
                return sendResponse(res, 400, false, 'Board ID required');
            }

            const user = await User.findById(userId);
            const userRoles = await user.getRoles();

            if (!userRoles.hasBoardPermission(boardId, permission)) {
                return sendResponse(res, 403, false, `Board permission '${permission}' required`);
            }

            req.board = await Board.findById(boardId);
            next();
        } catch (error) {
            logger.error('Board permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking board permissions');
        }
    };
};

// Check if user is resource owner
const requireResourceOwner = (resourceField = 'userId') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const resourceUserId = req.params[resourceField] || req.body[resourceField];

            if (!resourceUserId) {
                return sendResponse(res, 400, false, 'Resource user ID required');
            }

            if (userId !== resourceUserId) {
                return sendResponse(res, 403, false, 'Access denied - not resource owner');
            }

            next();
        } catch (error) {
            logger.error('Resource owner check error:', error);
            sendResponse(res, 500, false, 'Server error checking resource ownership');
        }
    };
};

// Check multiple permissions (OR logic)
const requireAnyPermission = (...permissionChecks) => {
    return async (req, res, next) => {
        let hasPermission = false;
        let lastError = null;

        for (const permissionCheck of permissionChecks) {
            try {
                // Create a mock response to capture permission check result
                const mockRes = {
                    status: () => mockRes,
                    json: () => {},
                    send: () => {}
                };

                let nextCalled = false;
                const mockNext = () => { 
                    nextCalled = true; 
                    hasPermission = true; 
                };

                await permissionCheck(req, mockRes, mockNext);

                if (hasPermission) {
                    break;
                }
            } catch (error) {
                lastError = error;
            }
        }

        if (hasPermission) {
            next();
        } else {
            return sendResponse(res, 403, false, 'Insufficient permissions');
        }
    };
};

// Check if user can access task (assignee, reporter, watcher, or board access)
const requireTaskAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.taskId || req.params.id;

        if (!taskId) {
            return sendResponse(res, 400, false, 'Task ID required');
        }

        const Task = require('../models/Task');
        const task = await Task.findById(taskId);

        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        // Check if user has direct access to task
        const hasDirectAccess = task.assignees.some(a => a.toString() === userId) ||
                               task.reporter.toString() === userId ||
                               task.watchers.some(w => w.toString() === userId);

        // Check if user has board access
        const hasBoardAccess = userRoles.hasBoardPermission(task.board, 'canView');

        if (!hasDirectAccess && !hasBoardAccess) {
            return sendResponse(res, 403, false, 'Access denied to this task');
        }

        req.task = task;
        next();
    } catch (error) {
        logger.error('Task access check error:', error);
        sendResponse(res, 500, false, 'Server error checking task access');
    }
};

// Check if user can edit task
const requireTaskEditPermission = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const task = req.task; // Should be set by requireTaskAccess

        if (!task) {
            return sendResponse(res, 400, false, 'Task context required');
        }

        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        // Check if user can edit task
        const canEdit = task.assignees.some(a => a.toString() === userId) ||
                       task.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(task.board, 'canEditTasks');

        if (!canEdit) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit this task');
        }

        next();
    } catch (error) {
        logger.error('Task edit permission check error:', error);
        sendResponse(res, 500, false, 'Server error checking task edit permissions');
    }
};

// Rate limiting middleware for sensitive operations
const rateLimitSensitiveOps = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const userId = req.user.id;
        const now = Date.now();
        const userRequests = requests.get(userId) || [];

        // Clean old requests
        const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

        if (validRequests.length >= maxRequests) {
            return sendResponse(res, 429, false, 'Too many requests, please try again later');
        }

        validRequests.push(now);
        requests.set(userId, validRequests);

        next();
    };
};

// Feature flag middleware
const requireFeatureFlag = (featureName) => {
    return (req, res, next) => {
        // This would check against feature flags in database or config
        // For now, just pass through
        next();
    };
};

// IP whitelist middleware
const requireWhitelistedIP = (whitelist = []) => {
    return (req, res, next) => {
        if (whitelist.length === 0) {
            return next();
        }

        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (!whitelist.includes(clientIP)) {
            return sendResponse(res, 403, false, 'IP address not whitelisted');
        }

        next();
    };
};

// Combined middleware for common permission patterns
const requireSpaceMember = requireSpacePermission('member');
const requireSpaceAdmin = requireSpacePermission('admin');
const requireWorkspaceMember = requireWorkspacePermission('member');
const requireWorkspaceAdmin = requireWorkspacePermission('admin');

module.exports = {
    requireSystemAdmin,
    requireWorkspacePermission,
    requireSpacePermission,
    requireSpaceSpecificPermission,
    requireBoardPermission,
    requireResourceOwner,
    requireAnyPermission,
    requireTaskAccess,
    requireTaskEditPermission,
    rateLimitSensitiveOps,
    requireFeatureFlag,
    requireWhitelistedIP,
    // Common combinations
    requireSpaceMember,
    requireSpaceAdmin,
    requireWorkspaceMember,
    requireWorkspaceAdmin
};