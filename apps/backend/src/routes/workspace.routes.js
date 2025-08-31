const express = require('express');
const workspaceController = require('../controllers/workspace.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireWorkspacePermission } = require('../middlewares/permission.middleware');
const { workspace: workspaceSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get('/', workspaceController.getAllWorkspaces);

router.get('/:id', 
    workspaceController.getWorkspace
);

// Generate invite link for workspace
router.get('/:id/invite-link', 
    
    workspaceController.generateInviteLink
);

router.post('/', 
    validateMiddleware(workspaceSchemas.createWorkspaceSchema),
    workspaceController.createWorkspace
);

router.put('/:id', 
    requireWorkspacePermission(),
    validateMiddleware(workspaceSchemas.updateWorkspaceSchema),
    workspaceController.updateWorkspace
);

router.post('/:id/invite',
    requireWorkspacePermission(),
    validateMiddleware(workspaceSchemas.inviteMemberSchema),
    workspaceController.inviteMember
);

router.post('/accept-invitation/:token',
    workspaceController.acceptInvitation
);

router.get('/:id/members',
    workspaceController.getWorkspaceMembers
);

router.delete('/:id/members/:memberId',
    requireWorkspacePermission(),
    workspaceController.removeMember
);

router.put('/:id/settings',
    requireWorkspacePermission(),
    validateMiddleware(workspaceSchemas.updateSettingsSchema),
    workspaceController.updateSettings
);

router.get('/:id/analytics',

    workspaceController.getWorkspaceAnalytics
);

router.post('/:id/transfer-ownership',
    requireWorkspacePermission(), // Only owner has this permission
    validateMiddleware(workspaceSchemas.transferOwnershipSchema),
    workspaceController.transferOwnership
);

// Delete workspace - rely on controller for final permission (owner or privileged admin)
router.delete('/:id',
    requireWorkspacePermission(),
    workspaceController.deleteWorkspace
);

module.exports = router;