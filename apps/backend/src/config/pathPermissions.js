/**
 * Path-based permissions configuration
 * Maps API endpoints to required roles and permissions
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
    'owner': 4,
    'admin': 3,
    'member': 2,
    'viewer': 1,
    'guest': 0
};

// Workspace permissions
const WORKSPACE_PERMISSIONS = {
    // Workspace CRUD operations
    '/workspace/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner']
    },
    '/workspace/:id/settings': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    },
    '/workspace/:id/members': {
        GET: ['owner', 'admin', 'member'],
        POST: ['owner', 'admin'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/workspace/:id/members/:memberId': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
 },
    '/workspace/:id/billing': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    },
    '/workspace/:id/spaces': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/workspace/:id/boards': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/workspace/:id/analytics': {
        GET: ['owner', 'admin', 'member']
    },
    '/workspace/:id/export': {
        GET: ['owner', 'admin']
    },
    '/workspace/:id/archive': {
        POST: ['owner', 'admin']
    },
    '/workspace/:id/restore': {
        POST: ['owner', 'admin']
    },
    '/workspace/:id/logo': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/workspace/:id/avatar': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/workspace/:id/rules': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner']
    },
    '/workspace/:id/rules/upload': {
        POST: ['owner', 'admin']
    },
    '/workspace/:id/invite-link': {
        GET: ['owner', 'admin']
    },
    '/workspace/:id/invite': {
        POST: ['owner', 'admin']
    },
    '/workspace/:id/transfer-ownership': {
        POST: ['owner']
    },
    '/workspace/:id/permanent': {
        DELETE: ['owner']
    }
};

// Space permissions
const SPACE_PERMISSIONS = {
    '/space/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin']
    },
    '/space/:id/settings': {
        GET: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin', 'member']
    },
    '/space/:id/members': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/space/:id/boards': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/space/:id/tasks': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/space/:id/analytics': {
        GET: ['owner', 'admin', 'member']
    },
    '/space/:id/archive': {
        POST: ['owner', 'admin']
    },
    '/space/:id/permanent': {
        DELETE: ['owner', 'admin']
    }
};

// Board permissions
const BOARD_PERMISSIONS = {
    '/board/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin']
    },
    '/board/space/:spaceId': {
        GET: ['owner', 'admin', 'member', 'viewer']
    },
    '/board/:id/settings': {
        GET: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin', 'member']
    },
    '/board/:id/members': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/board/:id/columns': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin']
    },
    '/board/:id/columns/:columnId': {
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin']
    },
    '/board/:id/columns/reorder': {
        PATCH: ['owner', 'admin', 'member']
    },
    '/board/:id/tasks': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/board/:id/analytics': {
        GET: ['owner', 'admin', 'member']
    },
    '/board/:id/export': {
        GET: ['owner', 'admin', 'member']
    },
    '/board/:id/tags': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member']
    },
    '/board/:id/tags/:tagName': {
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin', 'member']
    }
};

// Task permissions
const TASK_PERMISSIONS = {
    '/task': {
        POST: ['owner', 'admin', 'member']
    },
    '/task/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin']
    },
    '/task/:id/assign': {
        POST: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin', 'member']
    },
    '/task/:id/comments': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin', 'member']
    },
    '/task/:id/attachments': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        DELETE: ['owner', 'admin', 'member']
    },
    '/task/:id/time': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin', 'member'],
        PUT: ['owner', 'admin', 'member']
    },
    '/task/:id/move': {
        POST: ['owner', 'admin', 'member']
    },
    '/task/:id/duplicate': {
        POST: ['owner', 'admin', 'member']
    }
};

// User management permissions
const USER_PERMISSIONS = {
    '/user/profile': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member', 'viewer']
    },
    '/user/:id': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/user/:id/roles': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    },
    '/user/:id/permissions': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    },
    '/user/:id/workspaces': {
        GET: ['owner', 'admin', 'member', 'viewer']
    }
};

// Auth permissions (for authenticated users)
const AUTH_PERMISSIONS = {
    '/auth/me': {
        GET: ['owner', 'admin', 'member', 'viewer']
    },
    '/auth/profile': {
        PUT: ['owner', 'admin', 'member', 'viewer']
    },
    '/auth/activity': {
        GET: ['owner', 'admin', 'member', 'viewer']
    },
    '/auth/sessions': {
        GET: ['owner', 'admin', 'member', 'viewer']
    },
    '/auth/logout': {
        POST: ['owner', 'admin', 'member', 'viewer']
    }
};

// Organization permissions
const ORGANIZATION_PERMISSIONS = {
    '/organization/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner']
    },
    '/organization/:id/settings': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    },
    '/organization/:id/members': {
        GET: ['owner', 'admin', 'member'],
        POST: ['owner', 'admin'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/organization/:id/workspaces': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        POST: ['owner', 'admin']
    },
    '/organization/:id/billing': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin']
    }
};

// Notification permissions
const NOTIFICATION_PERMISSIONS = {
    '/notifications': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member', 'viewer']
    },
    '/notifications/:id': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member', 'viewer'],
        DELETE: ['owner', 'admin', 'member', 'viewer']
    },
    '/notifications/settings': {
        GET: ['owner', 'admin', 'member', 'viewer'],
        PUT: ['owner', 'admin', 'member', 'viewer']
    }
};

// Report and analytics permissions
const REPORT_PERMISSIONS = {
    '/reports/workspace/:id': {
        GET: ['owner', 'admin', 'member']
    },
    '/reports/space/:id': {
        GET: ['owner', 'admin', 'member']
    },
    '/reports/board/:id': {
        GET: ['owner', 'admin', 'member']
    },
    '/reports/user/:id': {
        GET: ['owner', 'admin']
    },
    '/reports/organization/:id': {
        GET: ['owner', 'admin']
    }
};

// Integration permissions
const INTEGRATION_PERMISSIONS = {
    '/integrations': {
        GET: ['owner', 'admin'],
        POST: ['owner', 'admin']
    },
    '/integrations/:id': {
        GET: ['owner', 'admin'],
        PUT: ['owner', 'admin'],
        DELETE: ['owner', 'admin']
    },
    '/integrations/:id/connect': {
        POST: ['owner', 'admin']
    },
    '/integrations/:id/disconnect': {
        POST: ['owner', 'admin']
    }
};

// Combine all permissions
const ALL_PATH_PERMISSIONS = {
    ...WORKSPACE_PERMISSIONS,
    ...SPACE_PERMISSIONS,
    ...BOARD_PERMISSIONS,
    ...TASK_PERMISSIONS,
    ...USER_PERMISSIONS,
    ...AUTH_PERMISSIONS,
    ...ORGANIZATION_PERMISSIONS,
    ...NOTIFICATION_PERMISSIONS,
    ...REPORT_PERMISSIONS,
    ...INTEGRATION_PERMISSIONS
};

// Helper functions
const getPathPermission = (path, method) => {
    return ALL_PATH_PERMISSIONS[path]?.[method] || null;
};

const hasRolePermission = (userRole, requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
};
const hasPermission = (userRole, path, method) => {
    const permissions = ALL_PATH_PERMISSIONS[path];
    const allowedRoles = permissions?.[method];
    const hasAccess = allowedRoles?.includes(userRole);
    
    console.log(`Permission check:`, {
        userRole,
        path,
        method,
        permissions,
        allowedRoles,
        hasAccess
    });
    
    return hasAccess;
};

const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] || 0;
};

const canAccess = (userRole, requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    // Check exact role match first
    if (requiredRoles.includes(userRole)) return true;
    
    // Check role hierarchy
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = Math.min(...requiredRoles.map(role => getRoleLevel(role)));
    
    return userLevel >= requiredLevel;
};

module.exports = {
    ROLE_HIERARCHY,
    ALL_PATH_PERMISSIONS,
    WORKSPACE_PERMISSIONS,
    SPACE_PERMISSIONS,
    BOARD_PERMISSIONS,
    TASK_PERMISSIONS,
    USER_PERMISSIONS,
    AUTH_PERMISSIONS,
    ORGANIZATION_PERMISSIONS,
    NOTIFICATION_PERMISSIONS,
    REPORT_PERMISSIONS,
    INTEGRATION_PERMISSIONS,
    getPathPermission,
    hasRolePermission,
    hasPermission,
    getRoleLevel,
    canAccess
};
