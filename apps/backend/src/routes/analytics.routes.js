const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireProjectPermission, requireWorkspacePermission } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const generateAnalyticsSchema = {
    periodType: { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] },
    startDate: { date: true },
    endDate: { date: true },
    includeAI: { boolean: true }
};

// Project analytics routes
router.get('/project/:projectId',
    analyticsController.getProjectAnalytics
);

router.post('/project/:projectId/generate',
    validateMiddleware(generateAnalyticsSchema),
    analyticsController.generateProjectAnalytics
);

router.get('/project/:projectId/export',
    analyticsController.exportAnalytics
);

router.get('/project/:projectId/team-performance',
    analyticsController.getTeamPerformance
);

// User analytics routes
router.get('/user/me', analyticsController.getUserAnalytics);

// Workspace analytics routes
router.get('/workspace/:workspaceId',
    analyticsController.getWorkspaceAnalytics
);

module.exports = router;
