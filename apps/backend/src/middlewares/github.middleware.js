const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Middleware to check if user is already linked to GitHub account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkGitHubLinked = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Authentication required');
        }

        // Find user and check GitHub integration status
        const user = await User.findById(req.user.id).select('github oauthProviders');
        
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Check if user has GitHub integration
        const hasGitHubLinked = user.github && user.github.githubId && user.github.accessToken;
        const hasOAuthProvider = user.oauthProviders && user.oauthProviders.includes('github');

        if (hasGitHubLinked || hasOAuthProvider) {
            return sendResponse(res, 409, false, 'User already linked to GitHub account', {
                action: 'redirect',
                message: 'You are already connected to GitHub',
                githubStatus: {
                    isLinked: true,
                    username: user.github?.username,
                    hasAccessToken: !!user.github?.accessToken
                }
            });
        }

        // Add GitHub status to request for potential use in controllers
        req.githubStatus = {
            isLinked: false,
            hasAccessToken: false,
            hasOAuthProvider: false
        };

        next();
    } catch (error) {
        logger.error('GitHub middleware error:', error);
        return sendResponse(res, 500, false, 'Server error checking GitHub status');
    }
};

/**
 * Middleware to check if user has GitHub integration (for protected routes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireGitHubLinked = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Authentication required');
        }

        // Find user and check GitHub integration status
        const user = await User.findById(req.user.id).select('github oauthProviders');
        
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Check if user has GitHub integration
        const hasGitHubLinked = user.github && user.github.githubId && user.github.accessToken;
        const hasOAuthProvider = user.oauthProviders && user.oauthProviders.includes('github');

        if (!hasGitHubLinked && !hasOAuthProvider) {
            return sendResponse(res, 403, false, 'GitHub account linking required', {
                action: 'redirect',
                message: 'Please connect your GitHub account to continue',
                redirectUrl: '/github/connect',
                githubStatus: {
                    isLinked: false,
                    hasAccessToken: false,
                    hasOAuthProvider: false
                }
            });
        }

        // Add GitHub status to request
        req.githubStatus = {
            isLinked: true,
            hasAccessToken: !!user.github?.accessToken,
            hasOAuthProvider: hasOAuthProvider,
            githubData: user.github
        };

        next();
    } catch (error) {
        logger.error('GitHub middleware error:', error);
        return sendResponse(res, 500, false, 'Server error checking GitHub status');
    }
};

/**
 * Middleware to get GitHub status without blocking (for informational routes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getGitHubStatus = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Authentication required');
        }

        // Find user and check GitHub integration status
        const user = await User.findById(req.user.id).select('github oauthProviders');
        
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Check if user has GitHub integration
        const hasGitHubLinked = user.github && user.github.githubId && user.github.accessToken;
        const hasOAuthProvider = user.oauthProviders && user.oauthProviders.includes('github');

        // Add GitHub status to request
        req.githubStatus = {
            isLinked: hasGitHubLinked || hasOAuthProvider,
            hasAccessToken: !!user.github?.accessToken,
            hasOAuthProvider: hasOAuthProvider,
            githubData: user.github
        };

        next();
    } catch (error) {
        logger.error('GitHub middleware error:', error);
        return sendResponse(res, 500, false, 'Server error checking GitHub status');
    }
};

module.exports = {
    checkGitHubLinked,
    requireGitHubLinked,
    getGitHubStatus
};
