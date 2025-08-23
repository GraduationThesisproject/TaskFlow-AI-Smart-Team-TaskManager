const express = require('express');
const workspaceController = require('../controllers/workspace.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireWorkspacePermission, requireWorkspaceMember, requireWorkspaceAdmin } = require('../middlewares/permission.middleware');
const authMiddleware = require('../middlewares/auth.middleware');   
const router = express.Router();

// Validation schemas
const createWorkspaceSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    plan: { enum: ['free', 'basic', 'premium', 'enterprise'] }
};

const updateWorkspaceSchema = {
    name: { minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    settings: { object: true }
};


const inviteMemberSchema = {
    email: { required: true, email: true },
    role: { enum: ['member', 'admin'], default: 'member' },
    message: { maxLength: 500 }
};

const updateSettingsSchema = {
    section: { required: true, string: true },
    updates: { required: true, object: true }
};

const transferOwnershipSchema = {
    newOwnerId: { required: true, objectId: true }
};

// Routes
router.get('/', workspaceController.getAllWorkspaces);

router.get('/:id', 
    requireWorkspaceMember,
    workspaceController.getWorkspace
);

router.post('/', 
    validateMiddleware(createWorkspaceSchema),
    workspaceController.createWorkspace
);

router.put('/:id', 
    requireWorkspacePermission('canEditSettings'),
    validateMiddleware(updateWorkspaceSchema),
    workspaceController.updateWorkspace
);

router.post('/:id/invite',
    requireWorkspacePermission('canManageMembers'),
    validateMiddleware(inviteMemberSchema),
    workspaceController.inviteMember
);

router.post('/accept-invitation/:token',
    workspaceController.acceptInvitation
);

router.get('/:id/members',
    requireWorkspaceMember,
    workspaceController.getWorkspaceMembers
);

router.delete('/:id/members/:memberId',
    requireWorkspacePermission('canManageMembers'),
    workspaceController.removeMember
);

router.put('/:id/settings',
    requireWorkspacePermission('canEditSettings'),
    validateMiddleware(updateSettingsSchema),
    workspaceController.updateSettings
);

router.get('/:id/analytics',
    requireWorkspaceMember,
    workspaceController.getWorkspaceAnalytics
);

router.post('/:id/transfer-ownership',
    requireWorkspacePermission('canDeleteWorkspace'), // Only owner has this permission
    validateMiddleware(transferOwnershipSchema),
    workspaceController.transferOwnership
);


module.exports = router;
