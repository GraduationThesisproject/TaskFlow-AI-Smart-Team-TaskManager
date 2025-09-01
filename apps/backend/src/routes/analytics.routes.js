const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { analytics: analyticsSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Space analytics routes
router.get('/space/:spaceId',
    analyticsController.getSpaceAnalytics
);

router.post('/space/:spaceId/generate',
    validateMiddleware(analyticsSchemas.generateAnalyticsSchema),
    analyticsController.generateSpaceAnalytics
);

router.get('/space/:spaceId/export',
    analyticsController.exportAnalytics
);

router.get('/space/:spaceId/team-performance',
    analyticsController.getTeamPerformance
);

// // User analytics route (current authenticated user)
router.get('/user',
    analyticsController.getUserAnalytics
);

// Workspace analytics routes
router.get('/workspace/:workspaceId',
    analyticsController.getWorkspaceAnalytics
);

module.exports = router;
