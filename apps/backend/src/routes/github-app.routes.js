const express = require('express');
const githubAppController = require('../controllers/github-app.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Initialize router
const router = express.Router();

// ============================================================================
// GITHUB APP INSTALLATION ROUTES
// ============================================================================

// Handle GitHub App installation callback
router.get('/install/callback', 
    githubAppController.handleInstallationCallback
);

// Get installation status
router.get('/install/status',
    authMiddleware,
    githubAppController.getInstallationStatus
);

// Uninstall GitHub App
router.post('/uninstall',
    authMiddleware,
    githubAppController.uninstallApp
);

module.exports = router;

