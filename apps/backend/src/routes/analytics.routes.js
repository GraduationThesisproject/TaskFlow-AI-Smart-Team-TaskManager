const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { analytics: analyticsSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSpacePermission, requireWorkspacePermission } = require('../middlewares/permission.middleware');
const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Space analytics routes
router.get('/space/:spaceId',
    requireSpacePermission('/:id/analytics'),
    analyticsController.getSpaceAnalytics
);

router.post('/space/:spaceId/generate',
    requireSpacePermission('/:id/analytics'),
    validateMiddleware.validateBody(analyticsSchemas.generateAnalyticsSchema),
    analyticsController.generateSpaceAnalytics
);

router.get('/space/:spaceId/export',
    requireSpacePermission('/:id/analytics'),
    analyticsController.exportAnalytics
);

router.get('/space/:spaceId/team-performance',
    requireSpacePermission('/:id/analytics'),
    analyticsController.getTeamPerformance
);

// User analytics route (current authenticated user)
router.get('/user',
    analyticsController.getUserAnalytics
);

// Workspace analytics routes
router.get('/workspace/:workspaceId',
    requireWorkspacePermission('/:id/analytics'),
    analyticsController.getWorkspaceAnalytics
);

module.exports = router;
