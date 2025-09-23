const express = require('express');
const spaceController = require('../controllers/space.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSpacePermission } = require('../middlewares/permission.middleware');
const { space: spaceSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

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
    validateMiddleware.validateBody(spaceSchemas.createSpaceSchema),
    spaceController.createSpace
);

router.put('/:id', 
    requireSpacePermission('/:id'),
    validateMiddleware.validateBody(spaceSchemas.updateSpaceSchema),
    spaceController.updateSpace
);

router.get('/:id/members',
    requireSpacePermission('/:id/members'),
    spaceController.getSpaceMembers
);

router.post('/:id/members',
    requireSpacePermission('/:id/members'),
    validateMiddleware.validateBody(spaceSchemas.addMemberSchema),
    spaceController.addMember
);

router.delete('/:id/members/:memberId',
    requireSpacePermission('/:id/members'),
    spaceController.removeMember
);

router.post('/:id/archive',
    requireSpacePermission('/:id/archive'),
    spaceController.archiveSpace
);

// Permanently delete an archived space
router.delete('/:id/permanent',
    requireSpacePermission('/:id/permanent'),
    spaceController.permanentDeleteSpace
);

module.exports = router;
