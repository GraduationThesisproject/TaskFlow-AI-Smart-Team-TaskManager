const express = require('express');
const githubController = require('../controllers/github.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { checkGitHubLinked, requireGitHubLinked, getGitHubStatus } = require('../middlewares/github.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

// Import validation schemas
const githubSchemas = require('./validator').github;

// Initialize router
const router = express.Router();

// ============================================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================================

// GitHub Account Linking - Check if already linked first
router.post('/link', 
    authMiddleware,
    checkGitHubLinked, // Prevents linking if already connected
    validateMiddleware.validateBody(githubSchemas.linkAccountSchema),
    githubController.linkGitHubAccount
);

// Get user's GitHub organizations - Requires GitHub connection
router.get('/orgs',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    githubController.getUserOrganizations
);

// Get repositories for a specific organization - Requires GitHub connection
router.get('/orgs/:org/repos',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    validateMiddleware.validateParams(githubSchemas.orgParamSchema),
    githubController.getOrganizationRepositories
);

// Get branches for a specific repository - Requires GitHub connection
router.get('/repos/:org/:repo/branches',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    validateMiddleware.validateParams(githubSchemas.repoParamSchema),
    githubController.getRepositoryBranches
);

// Get members of a specific organization - Requires GitHub connection
router.get('/orgs/:org/members',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    validateMiddleware.validateParams(githubSchemas.orgParamSchema),
    githubController.getOrganizationMembers
);

// Get organization members with email mapping - Requires GitHub connection
router.get('/orgs/:org/members-with-emails',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    validateMiddleware.validateParams(githubSchemas.orgParamSchema),
    githubController.getOrganizationMembersWithEmails
);

// Sync GitHub data (refresh orgs, repos, branches) - Requires GitHub connection
router.post('/sync',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    githubController.syncGitHubData
);

// Unlink GitHub account - Requires GitHub connection
router.delete('/unlink',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    githubController.unlinkGitHubAccount
);

// Force re-authentication for GitHub (when scopes are insufficient)
router.post('/force-reauth',
    authMiddleware,
    requireGitHubLinked, // Ensures user has GitHub connected
    githubController.forceReAuth
);

// Get GitHub account status - Always returns status (doesn't block)
router.get('/status',
    authMiddleware,
    getGitHubStatus, // Gets status without blocking
    githubController.getGitHubStatus
);

module.exports = router;