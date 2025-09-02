const express = require('express');
const integrationController = require('../controllers/integration.controller');
const { authenticateAdmin } = require('../middlewares/adminAuth.middleware');
const { requireIntegrationAccess } = require('../middlewares/accessControl.middleware');

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Get all integrations
router.get('/', requireIntegrationAccess('view'), integrationController.getIntegrations);

// Get integration statistics
router.get('/stats', requireIntegrationAccess('view'), integrationController.getIntegrationStats);

// Get single integration
router.get('/:id', requireIntegrationAccess('view'), integrationController.getIntegration);

// Create new integration
router.post('/', requireIntegrationAccess('limited'), integrationController.createIntegration);

// Update integration
router.put('/:id', requireIntegrationAccess('limited'), integrationController.updateIntegration);

// Delete integration
router.delete('/:id', requireIntegrationAccess('full'), integrationController.deleteIntegration);

// Test integration connection
router.post('/:id/test', requireIntegrationAccess('limited'), integrationController.testIntegration);

// Sync integration
router.post('/:id/sync', requireIntegrationAccess('limited'), integrationController.syncIntegration);

// Get integration health
router.get('/:id/health', requireIntegrationAccess('view'), integrationController.getIntegrationHealth);

// Toggle integration status
router.patch('/:id/toggle', requireIntegrationAccess('limited'), integrationController.toggleIntegration);

module.exports = router;
