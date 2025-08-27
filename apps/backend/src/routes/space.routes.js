const express = require('express');
const spaceController = require('../controllers/space.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSpacePermission, requireWorkspacePermission } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const createSpaceSchema = {
    name: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    workspaceId: { required: true, objectId: true },
    settings: { object: true },
    permissions: { object: true }
};

const updateSpaceSchema = {
    name: { minLength: 2, maxLength: 200 },
    description: { maxLength: 1000 },
    settings: { object: true },
    permissions: { object: true }
};

const addMemberSchema = {
    userId: { required: true, objectId: true },
    role: { enum: ['viewer', 'member', 'admin'], default: 'member' }
};

// Routes - Support both URL patterns for backward compatibility
router.get('/workspace/:workspaceId',
    spaceController.getSpaces
);

// Add route that matches frontend expectation: /spaces?workspace=workspaceId
router.get('/',
    spaceController.getSpacesByWorkspace
);

router.get('/:id', 
    spaceController.getSpace
);

router.post('/', 
    validateMiddleware(createSpaceSchema),
    spaceController.createSpace
);

router.put('/:id', 
    requireSpacePermission('canEditSettings'),
    validateMiddleware(updateSpaceSchema),
    spaceController.updateSpace
);

router.post('/:id/members',
    requireSpacePermission('canManageMembers'),
    validateMiddleware(addMemberSchema),
    spaceController.addMember
);

router.post('/:id/archive',
    requireSpacePermission('canEditSettings'),
    spaceController.archiveSpace
);

module.exports = router;
