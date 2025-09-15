const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const Board = require('../models/Board');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const { hasPermission } = require('../config/pathPermissions');

// Require system admin role
const requireSystemAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        if (userRoles.systemRole !== 'admin' && userRoles.systemRole !== 'super_admin') {
            return sendResponse(res, 403, false, 'System admin permissions required');
        }
        next();
    } catch (error) {
        sendResponse(res, 500, false, 'Server error checking admin permissions');
    }
};

// Require workspace permission
const requireWorkspacePermission = (path) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;
            if (!workspaceId) {
                return sendResponse(res, 400, false, 'Workspace ID required');
            }
            
            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return sendResponse(res, 404, false, 'Workspace not found');
            }
            
            req.workspace = workspace;
            
            // Allow users and admins to access workspace analytics
            // Handle users without system roles (default to 'user' role)
            const systemRole = userRoles.systemRole || 'user';
            if(!['user', 'moderator', 'admin', 'super_admin'].includes(systemRole)) {
                return sendResponse(res, 403, false, 'Insufficient permissions');
            }

            // Get user's role in this specific workspace
            let wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspaceId.toString()
            );

            logger.info(`User ${userId} workspace role check:`, {
                workspaceId,
                userRoles: userRoles.workspaces,
                foundRole: wsRole,
                workspaceOwner: workspace.owner?.toString()
            });

            // If no role found but user is workspace owner, create a temporary role object
            if (!wsRole && workspace.owner && workspace.owner.toString() === userId.toString()) {
                logger.info(`User ${userId} is workspace owner, creating temporary role`);
                wsRole = { role: 'owner' };
            }

            if (!wsRole) {
                return sendResponse(res, 403, false, 'No workspace access found');
            }

            // Check if user has permission for this path and method
            const fullPath = `/workspace${path}`;
            logger.info(`Permission check: role=${wsRole.role}, path=${fullPath}, method=${req.method}`);
            
            if(hasPermission(wsRole.role, fullPath, req.method)) {
                return next();
            }

            return sendResponse(res, 403, false, 'You are not authorized to access this workspace');
        } catch (error) {
            logger.error('Workspace permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking workspace permissions');
        }
    };
};

// Require space permission (replaces project permission)
const requireSpacePermission = (path = '') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            const spaceId = req.params.id || req.params.spaceId || req.body.spaceId;

            if (!spaceId) {
                return sendResponse(res, 400, false, 'Space ID required');
            }

            const space = await Space.findById(spaceId);

            if (!space) {
                return sendResponse(res, 404, false, 'Space not found');
            }

            req.space = space;

            // Allow all authenticated users with valid system roles
            const validSystemRoles = ['user', 'moderator', 'admin', 'super_admin'];
            if(userRoles.systemRole && !validSystemRoles.includes(userRoles.systemRole)) {
                return sendResponse(res, 403, false, 'Invalid system role');
            }

            // Get user's role in the workspace that contains this space
            const workspaceId = space.workspace;
            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return sendResponse(res, 404, false, 'Workspace not found');
            }
            
            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspaceId.toString()
            );

            // If no role found but user is workspace owner, create a temporary role object
            if (!wsRole && workspace.owner && workspace.owner.toString() === userId.toString()) {
                logger.info(`User ${userId} is workspace owner, creating temporary role for space access`);
                wsRole = { role: 'owner' };
            }

            if (!wsRole) {
                return sendResponse(res, 403, false, 'No workspace access found');
            }

            // Check if user has permission for this path and method
            if(hasPermission(wsRole.role, `/space${path}`, req.method)) {
                return next();
            }

            return sendResponse(res, 403, false, 'You are not authorized to access this space');
        } catch (error) {
            logger.error('Space permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking space permissions');
        }
    };
};

// Require specific space permission
const requireSpaceSpecificPermission = (path = '') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            const spaceId = req.params.id || req.params.spaceId || req.body.spaceId;

            if (!spaceId) {
                return sendResponse(res, 400, false, 'Space ID required');
            }

            const space = await Space.findById(spaceId);

            if (!space) {
                return sendResponse(res, 404, false, 'Space not found');
            }

            req.space = space;

            // Allow all authenticated users with valid system roles
            const validSystemRoles = ['user', 'moderator', 'admin', 'super_admin'];
            if(userRoles.systemRole && !validSystemRoles.includes(userRoles.systemRole)) {
                return sendResponse(res, 403, false, 'Invalid system role');
            }

            // Get user's role in the workspace that contains this space
            const workspaceId = space.workspace;
            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspaceId.toString()
            );

            if (!wsRole) {
                return sendResponse(res, 403, false, 'No workspace access found');
            }

            // Check if user has permission for this path and method
            if(hasPermission(wsRole.role, `/space${path}`, req.method)) {
                return next();
            }

            return sendResponse(res, 403, false, 'You are not authorized to access this space');
        } catch (error) {
            logger.error('Space specific permission check error:', error);
            sendResponse(res, 500, false, 'Server error checking space specific permissions');
        }
    };
};

// Require board permission
const requireBoardPermission = (path = '') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            const boardId = req.params.id || req.params.boardId || req.body.boardId;

            if (!boardId) {
                return sendResponse(res, 400, false, 'Board ID required');
            }

            const board = await Board.findById(boardId);
            if (!board) {
                return sendResponse(res, 404, false, 'Board not found');
            }

            req.board = board;

            // Allow all authenticated users with valid system roles
            const validSystemRoles = ['user', 'moderator', 'admin', 'super_admin'];
            if(userRoles.systemRole && !validSystemRoles.includes(userRoles.systemRole)) {
                return sendResponse(res, 403, false, 'Invalid system role');
            }

            // Get user's role in the workspace that contains this board
            // First, we need to get the space to find the workspace
            const space = await Space.findById(board.space);
            if (!space) {
                return sendResponse(res, 404, false, 'Space not found');
            }
            
            const workspaceId = space.workspace;
            const wsRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspaceId.toString()
            );

            if (!wsRole) {
                return sendResponse(res, 403, false, 'No workspace access found');
            }

            // Check if user has permission for this path and method
            if(hasPermission(wsRole.role, `/board${path}`, req.method)) {
                return next();
            }

            return sendResponse(res, 403, false, 'You are not authorized to access this board');
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
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const taskId = req.params.taskId || req.params.id;

        if (!taskId) {
            return sendResponse(res, 400, false, 'Task ID required');
        }

        const Task = require('../models/Task');
        const task = await Task.findById(taskId);

        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        req.task = task;

        // Check if user has direct access to task (assignee, reporter, watcher)
        const hasDirectAccess = task.assignees.some(a => a.toString() === userId) ||
                               task.reporter.toString() === userId ||
                               task.watchers.some(w => w.toString() === userId);

        if (hasDirectAccess) {
            return next();
        }

        // Check if user has board access through workspace membership
        const board = await Board.findById(task.board);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Get the space to find the workspace
        const space = await Space.findById(board.space);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        const workspaceId = space.workspace;
        const wsRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId.toString()
        );

        if (!wsRole) {
            return sendResponse(res, 403, false, 'No workspace access found');
        }

        // For now, allow access if user has any workspace role
        // The specific permission check can be added later if needed
        return next();
    } catch (error) {
        logger.error('Task access check error:', error);
        sendResponse(res, 500, false, 'Server error checking task access');
    }
};

// Check if user can edit task
const requireTaskEditPermission = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const task = req.task; // Should be set by requireTaskAccess

        if (!task) {
            return sendResponse(res, 400, false, 'Task context required');
        }

        // Allow all authenticated users with valid system roles
        const validSystemRoles = ['user', 'moderator', 'admin', 'super_admin'];
        if(userRoles.systemRole && !validSystemRoles.includes(userRoles.systemRole)) {
            return sendResponse(res, 403, false, 'Invalid system role');
        }

        // Check if user can edit task directly
        const canEditDirectly = task.assignees.some(a => a.toString() === userId) ||
                               task.reporter.toString() === userId;

        if (canEditDirectly) {
            return next();
        }

        // Get user's role in the workspace that contains this task
        const board = await Board.findById(task.board);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Get the space to find the workspace
        const space = await Space.findById(board.space);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        const workspaceId = space.workspace;
        const wsRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId.toString()
        );

        if (!wsRole) {
            return sendResponse(res, 403, false, 'No workspace access found');
        }

        // Check if user has permission for this path and method
        if(hasPermission(wsRole.role, req.path, req.method)) {
            return next();
        }

        return sendResponse(res, 403, false, 'Insufficient permissions to edit this task');
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
const requireSpaceMember = requireSpacePermission('/:id');
const requireSpaceAdmin = requireSpacePermission('/:id');
const requireWorkspaceMember = requireWorkspacePermission('');
const requireWorkspaceAdmin = requireWorkspacePermission('');

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