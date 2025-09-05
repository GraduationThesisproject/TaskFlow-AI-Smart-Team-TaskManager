const express = require('express');
const workspaceController = require('../controllers/workspace.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireWorkspacePermission, requireWorkspaceMember } = require('../middlewares/permission.middleware');
const { workspace: workspaceSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createMulterUpload } = require('../config/multer');

const router = express.Router();

// Create multer upload instances
const multerUpload = createMulterUpload('workspace_rules');

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get('/', workspaceController.getAllWorkspaces);

router.get('/:id',
    requireWorkspacePermission('/:id'),
    workspaceController.getWorkspace
);

// Generate invite link for workspace
router.get('/:id/invite-link', 
    requireWorkspacePermission('/:id/invite-link'),
    workspaceController.generateInviteLink
);

router.post('/', 
    validateMiddleware.validateBody(workspaceSchemas.createWorkspaceSchema),
    workspaceController.createWorkspace
);

router.get('/:id/analytics',
    requireWorkspacePermission('/:id/analytics'),
    workspaceController.getWorkspaceAnalytics
);





router.post('/:id/restore',
    requireWorkspacePermission('/:id/restore'),
    workspaceController.restoreWorkspace
);



router.put('/:id', 
    requireWorkspacePermission('/:id'),
    validateMiddleware.validateBody(workspaceSchemas.updateWorkspaceSchema),
    workspaceController.updateWorkspace
);

router.post('/:id/invite',
    requireWorkspacePermission('/:id/invite'),
    validateMiddleware.validateBody(workspaceSchemas.inviteMemberSchema),
    workspaceController.inviteMember
);

router.post('/accept-invitation/:token',
    workspaceController.acceptInvitation
);

router.get('/:id/members',
    requireWorkspacePermission('/:id/members'),
    workspaceController.getWorkspaceMembers
);

router.delete('/:id/members/:memberId',
    requireWorkspacePermission('/:id/members/:memberId'),
    workspaceController.removeMember
);

router.put('/:id/settings',
    requireWorkspacePermission('/:id/settings'),
    validateMiddleware.validateBody(workspaceSchemas.updateSettingsSchema),
    workspaceController.updateSettings
);

// Avatar upload routes
router.post('/:id/avatar',
    requireWorkspacePermission('/:id/avatar'),
    createMulterUpload('workspace_avatar').single('avatar'),
    workspaceController.uploadWorkspaceAvatar
);

router.delete('/:id/avatar',
    requireWorkspacePermission('/:id/avatar'),
    workspaceController.removeWorkspaceAvatar
);

// Workspace rules routes
router.get('/:id/rules',
    requireWorkspacePermission('/:id/rules'),
    workspaceController.getWorkspaceRules
);

router.put('/:id/rules',
    requireWorkspacePermission('/:id/rules'),
    validateMiddleware.validateBody(workspaceSchemas.updateWorkspaceRulesSchema),
    workspaceController.updateWorkspaceRules
);

// File upload route for workspace rules (PDF)
router.post('/:id/rules/upload',
    requireWorkspacePermission('/:id/rules/upload'),
    multerUpload.single('rulesFile'),
    workspaceController.uploadWorkspaceRules
);

router.delete('/:id/rules',
    requireWorkspacePermission('/:id/rules'),
    workspaceController.deleteWorkspaceRules
);

router.post('/:id/transfer-ownership',
    requireWorkspacePermission('/:id/transfer-ownership'), // Only owner has this permission
    validateMiddleware.validateBody(workspaceSchemas.transferOwnershipSchema),
    workspaceController.transferOwnership
);



// Permanently delete an archived workspace
router.delete('/:id/permanent',
    requireWorkspacePermission('/:id/permanent'),
    workspaceController.permanentDeleteWorkspace
);

// Delete workspace - rely on controller for final permission (owner or privileged admin)
router.delete('/:id',
    requireWorkspacePermission('/:id'),
    workspaceController.deleteWorkspace
);

module.exports = router;
