const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const router = express.Router();

// Validation schemas
const generateAnalyticsSchema = {
    periodType: { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] },
    startDate: { date: true },
    endDate: { date: true },
    includeAI: { boolean: true }
};

// Space analytics routes
router.get('/space/:spaceId',
    analyticsController.getSpaceAnalytics
);

router.post('/space/:spaceId/generate',
    validateMiddleware(generateAnalyticsSchema),
    analyticsController.generateSpaceAnalytics
);

router.get('/space/:spaceId/export',
    analyticsController.exportAnalytics
);

router.get('/space/:spaceId/team-performance',
    analyticsController.getTeamPerformance
);

// User analytics routes - temporarily disabled
// router.get('/user/me', analyticsController.getUserAnalytics);

// Workspace analytics routes
router.get('/workspace/:workspaceId',
    analyticsController.getWorkspaceAnalytics
);

module.exports = router;
