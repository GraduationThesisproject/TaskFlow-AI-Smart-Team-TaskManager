const express = require('express');
const router = express.Router();
const { cleanupNullUsers, getDatabaseHealth } = require('../controllers/cleanup.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Apply auth middleware to all cleanup routes
router.use(authMiddleware);

// Clean up null user references
router.post('/null-users', cleanupNullUsers);

// Get database health report
router.get('/health', getDatabaseHealth);

module.exports = router;
