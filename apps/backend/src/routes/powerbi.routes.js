const express = require('express');
const { adminMiddleware } = require('../middlewares/admin.middleware');
const powerbiController = require('../controllers/powerbi.controller');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Power BI authentication and configuration
router.post('/auth/token', powerbiController.getAccessToken);
router.get('/workspaces', powerbiController.getWorkspaces);
router.get('/workspaces/:workspaceId/reports', powerbiController.getReports);
router.get('/workspaces/:workspaceId/datasets', powerbiController.getDatasets);
router.post('/reports/:reportId/embed-token', powerbiController.getReportEmbedToken);
router.post('/datasets/:datasetId/refresh', powerbiController.refreshDataset);
router.get('/datasets/:datasetId/schema', powerbiController.getDatasetSchema);

// Configuration management
router.get('/config/status', powerbiController.getConfigStatus);
router.get('/config', powerbiController.getConfig);
router.post('/config', powerbiController.saveConfig);
router.post('/test-connection', powerbiController.testConnection);

module.exports = router;
