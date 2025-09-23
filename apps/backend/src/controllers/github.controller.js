const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const Board = require('../models/Board');
const githubService = require('../services/github.service');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const { encryptToken, decryptToken } = require('../utils/github');

// Link GitHub account using authorization code
exports.linkGitHubAccount = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return sendResponse(res, 400, false, 'Authorization code is required');
    }

    // Exchange code for access token
    const tokenData = await githubService.exchangeCodeForToken(code);
    
    // Check if token has required scopes
    const scopeCheck = await githubService.checkTokenScopes(tokenData.accessToken);
    if (!scopeCheck.hasRequiredScopes) {
      return sendResponse(res, 400, false, 'Insufficient GitHub permissions', {
        missingScopes: scopeCheck.missingScopes,
        message: 'Please re-authenticate with required permissions: read:org and repo'
      });
    }

    // Get GitHub user profile and emails
    const [githubProfile, userEmails] = await Promise.all([
      githubService.getUserProfile(tokenData.accessToken),
      githubService.getUserEmails(tokenData.accessToken)
    ]);

    // Find primary email from user emails
    const primaryEmail = userEmails.find(email => email.primary && email.verified) || 
                        userEmails.find(email => email.verified) || 
                        userEmails[0];

    // Update user with GitHub information
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.github = {
      accessToken: encryptToken(tokenData.accessToken),
      githubId: githubProfile.id,
      username: githubProfile.login,
      avatar: githubProfile.avatar,
      email: primaryEmail?.email || githubProfile.email,
      scope: tokenData.scope,
      lastSync: new Date()
    };

    // Update OAuth providers flag
    if (!user.oauthProviders) {
      user.oauthProviders = [];
    }
    if (!user.oauthProviders.includes('github')) {
      user.oauthProviders.push('github');
    }
    user.hasOAuthProviders = true;

    await user.save();

    logger.info(`GitHub account linked for user: ${userId} with email: ${user.github.email}`);

    sendResponse(res, 200, true, 'GitHub account linked successfully', {
      githubUsername: githubProfile.login,
      githubEmail: user.github.email,
      scope: tokenData.scope,
      hasRequiredScopes: true
    });

  } catch (error) {
    logger.error('Error linking GitHub account:', error);
    sendResponse(res, 500, false, `Failed to link GitHub account: ${error.message}`);
  }
};

// Get user's GitHub organizations
exports.getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+github.accessToken');
    // Middleware already validated GitHub connection, just get token
    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate GitHub integration before fetching organizations
    const validation = await githubService.validateGitHubIntegration(accessToken);
    if (!validation.isValid) {
      if (validation.reason === 'insufficient_scopes') {
        return sendResponse(res, 403, false, 'Insufficient GitHub permissions. You need at least read:org scope to list your organizations.', {
          action: 'redirect',
          missingScopes: validation.missingScopes,
          userScopes: validation.userScopes,
          reason: validation.reason
        });
      } else if (validation.reason === 'org_access_denied') {
        return sendResponse(res, 403, false, 'Cannot access GitHub organizations. Please re-authenticate to grant required permissions.', {
          action: 'redirect',
          missingScopes: validation.missingScopes,
          reason: validation.reason
        });
      } else {
        return sendResponse(res, 400, false, validation.message, {
          action: 'redirect',
          reason: validation.reason
        });
      }
    }

    const organizations = await githubService.getOrganizations(accessToken);
    sendResponse(res, 200, true, 'GitHub organizations fetched successfully', 
      organizations
    );

  } catch (error) {
    logger.error('Error fetching GitHub organizations:', error);
    sendResponse(res, 500, false, `Failed to fetch GitHub organizations: ${error.message}`);
  }
};

// Get repositories for a specific organization
exports.getOrganizationRepositories = async (req, res) => {
  try {
    const { org } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+github.accessToken');
    // Middleware already validated GitHub connection, just get token
    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate token and check scopes before fetching repositories
    const scopeCheck = await githubService.checkTokenScopes(accessToken);
    console.log("---------------scopeCheck------------", scopeCheck);
    if (!scopeCheck.hasRequiredScopes) {
      return sendResponse(res, 403, false, 'Insufficient GitHub permissions. You need at least read:org scope to access repositories.', {
        action: 'redirect',
        missingScopes: scopeCheck.missingScopes
      });
    }

    const repositories = await githubService.getRepositories(accessToken, org);
    
    sendResponse(res, 200, true, 'GitHub repositories fetched successfully', {
      organization: org,
      repositories
    });

  } catch (error) {
    logger.error('Error fetching GitHub repositories:', error);
    sendResponse(res, 500, false, `Failed to fetch GitHub repositories: ${error.message}`);
  }
};

// Get branches for a specific repository
exports.getRepositoryBranches = async (req, res) => {
  try {
    const { org, repo } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+github.accessToken');
    // Middleware already validated GitHub connection, just get token
    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate token and check scopes before fetching branches
    const scopeCheck = await githubService.checkTokenScopes(accessToken);
    if (!scopeCheck.hasRequiredScopes) {
      return sendResponse(res, 403, false, 'Insufficient GitHub permissions. You need at least read:org scope to access repository branches.', {
        action: 'redirect',
        missingScopes: scopeCheck.missingScopes
      });
    }

    const branches = await githubService.getRepositoryBranches(accessToken, org, repo);
    
    sendResponse(res, 200, true, 'GitHub branches fetched successfully', {
      organization: org,
      repository: repo,
      branches
    });

  } catch (error) {
    logger.error('Error fetching GitHub branches:', error);
    sendResponse(res, 500, false, `Failed to fetch GitHub branches: ${error.message}`);
  }
};

// Get members of a specific organization
exports.getOrganizationMembers = async (req, res) => {
  try {
    const { org } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+github.accessToken');
    // Middleware already validated GitHub connection, just get token
    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate token and check scopes
    const isValid = await githubService.validateToken(accessToken);
    if (!isValid) {
      return sendResponse(res, 400, false, 'GitHub token is invalid or expired');
    }

    const members = await githubService.getOrganizationMembers(accessToken, org);
    
    sendResponse(res, 200, true, 'GitHub organization members fetched successfully', {
      organization: org,
      members
    });

  } catch (error) {
    logger.error('Error fetching GitHub organization members:', error);
    sendResponse(res, 500, false, `Failed to fetch GitHub organization members: ${error.message}`);
  }
};

// Get organization members with email mapping
exports.getOrganizationMembersWithEmails = async (req, res) => {
  try {
    const { org } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+github.accessToken');
    const accessToken = decryptToken(user.github.accessToken);
    
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate token and check scopes
    const isValid = await githubService.validateToken(accessToken);
    if (!isValid) {
      return sendResponse(res, 400, false, 'GitHub token is invalid or expired');
    }

    const membersWithEmails = await githubService.mapOrgMembersToEmails(accessToken, org);

    sendResponse(res, 200, true, 'GitHub organization members with email mapping fetched successfully', {
      organization: org,
      members: membersWithEmails,
      totalMembers: membersWithEmails.length,
      appUsers: membersWithEmails.filter(m => m.isAppUser).length
    });

  } catch (error) {
    logger.error('Error fetching GitHub organization members with emails:', error);
    sendResponse(res, 500, false, `Failed to fetch organization members with emails: ${error.message}`);
  }
};

// Sync GitHub data (refresh orgs, repos, branches)
exports.syncGitHubData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+github.accessToken');
    
    // Middleware already validated GitHub connection, just get token
    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 400, false, 'Invalid GitHub token');
    }

    // Validate token and check scopes
    const isValid = await githubService.validateToken(accessToken);
    if (!isValid) {
      return sendResponse(res, 400, false, 'GitHub token is invalid or expired');
    }

    const scopeCheck = await githubService.checkTokenScopes(accessToken);
    if (!scopeCheck.hasRequiredScopes) {
      return sendResponse(res, 400, false, 'Insufficient GitHub permissions', {
        missingScopes: scopeCheck.missingScopes
      });
    }

    // Update last sync time
    user.github.lastSync = new Date();
    await user.save();

    sendResponse(res, 200, true, 'GitHub data synced successfully', {
      lastSync: user.github.lastSync,
      hasRequiredScopes: true
    });

  } catch (error) {
    logger.error('Error syncing GitHub data:', error);
    sendResponse(res, 500, false, `Failed to sync GitHub data: ${error.message}`);
  }
};

// Unlink GitHub account
exports.unlinkGitHubAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Middleware already validated GitHub connection exists
    // Remove GitHub information
    user.github = {
      accessToken: null,
      githubId: null,
      username: null,
      avatar: null,
      email: null,
      scope: null,
      tokenExpiresAt: null,
      lastSync: null
    };

    // Update OAuth providers flag
    if (user.oauthProviders && user.oauthProviders.includes('github')) {
      user.oauthProviders = user.oauthProviders.filter(provider => provider !== 'github');
      user.hasOAuthProviders = user.oauthProviders.length > 0;
    }

    await user.save();

    logger.info(`GitHub account unlinked for user: ${userId}`);

    sendResponse(res, 200, true, 'GitHub account unlinked successfully');

  } catch (error) {
    logger.error('Error unlinking GitHub account:', error);
    sendResponse(res, 500, false, `Failed to unlink GitHub account: ${error.message}`);
  }
};

// Force re-authentication for GitHub (when scopes are insufficient)
exports.forceReAuth = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Clear existing GitHub data to force re-authentication
    user.github = {
      accessToken: null,
      githubId: null,
      username: null,
      avatar: null,
      email: null,
      scope: null,
      tokenExpiresAt: null,
      lastSync: null
    };

    // Remove GitHub from OAuth providers
    if (user.oauthProviders && user.oauthProviders.includes('github')) {
      user.oauthProviders = user.oauthProviders.filter(provider => provider !== 'github');
      user.hasOAuthProviders = user.oauthProviders.length > 0;
    }

    await user.save();

    logger.info(`GitHub re-authentication forced for user: ${userId}`);

    sendResponse(res, 200, true, 'GitHub account unlinked. Please re-authenticate with proper scopes.', {
      action: 'redirect',
      redirectUrl: '/github/connect'
    });

  } catch (error) {
    logger.error('Error forcing GitHub re-authentication:', error);
    sendResponse(res, 500, false, `Failed to force re-authentication: ${error.message}`);
  }
};

// Get GitHub account status
exports.getGitHubStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+github.accessToken');
    
    // Use status from middleware
    const { githubStatus } = req;
    
    if (!githubStatus.isLinked) {
      return sendResponse(res, 200, true, 'GitHub account not linked', {
        linked: false
      });
    }

    const accessToken = decryptToken(user.github.accessToken);
    if (!accessToken) {
      return sendResponse(res, 200, true, 'GitHub token invalid', {
        linked: false,
        reason: 'invalid_token'
      });
    }

    // Validate GitHub integration comprehensively
    const validation = await githubService.validateGitHubIntegration(accessToken);
    const scopeCheck = await githubService.checkTokenScopes(accessToken);

    sendResponse(res, 200, true, 'GitHub account status retrieved', {
      linked: true,
      username: user.github.username,
      avatar: user.github.avatar,
      lastSync: user.github.lastSync,
      tokenValid: validation.isValid,
      hasRequiredScopes: scopeCheck.hasRequiredScopes,
      missingScopes: scopeCheck.missingScopes || [],
      validation: {
        isValid: validation.isValid,
        reason: validation.reason,
        message: validation.message
      }
    });

  } catch (error) {
    logger.error('Error getting GitHub status:', error);
    sendResponse(res, 500, false, `Failed to get GitHub status: ${error.message}`);
  }
};