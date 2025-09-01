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
    validateMiddleware(spaceSchemas.createSpaceSchema),
    spaceController.createSpace
);

router.put('/:id', 
    requireSpacePermission(),
    validateMiddleware(spaceSchemas.updateSpaceSchema),
    spaceController.updateSpace
);

router.post('/:id/members',
    requireSpacePermission(),
    validateMiddleware(spaceSchemas.addMemberSchema),
    spaceController.addMember
);

router.post('/:id/archive',
    requireSpacePermission(),
    spaceController.archiveSpace
);

module.exports = router;
