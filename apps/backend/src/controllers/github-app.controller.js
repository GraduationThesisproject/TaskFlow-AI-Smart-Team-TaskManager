const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const githubService = require('../services/github.service');

// Handle GitHub App installation callback
exports.handleInstallationCallback = async (req, res) => {
  try {
    const { installation_id, state } = req.query;
    
    if (!installation_id) {
      return sendResponse(res, 400, false, 'Installation ID is required');
    }

    // Parse state to get context
    let context;
    try {
      context = JSON.parse(decodeURIComponent(state));
    } catch (error) {
      return sendResponse(res, 400, false, 'Invalid state parameter');
    }

    const { type, workspaceId, spaceId, organization, repository } = context;

    // Get installation details from GitHub
    const installation = await githubService.getInstallation(installation_id);
    
    if (!installation) {
      return sendResponse(res, 400, false, 'Invalid installation ID');
    }

    // Handle workspace installation
    if (type === 'workspace' && workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return sendResponse(res, 404, false, 'Workspace not found');
      }

      // Update workspace with GitHub App installation
      workspace.githubApp = {
        installationId: installation_id,
        organization: organization,
        appId: installation.app_id,
        account: installation.account,
        installedAt: new Date(),
        permissions: installation.permissions
      };

      await workspace.save();

      // Send notification to GitHub organization
      await githubService.sendInstallationNotification(installation_id, {
        type: 'workspace_linked',
        workspaceName: workspace.name,
        organization: organization,
        message: `TaskFlow workspace "${workspace.name}" has been linked to your GitHub organization "${organization}"`
      });

      return sendResponse(res, 200, true, 'Workspace linked to GitHub organization successfully', {
        workspaceId: workspace._id,
        organization: organization,
        installationId: installation_id
      });
    }

    // Handle space installation
    if (type === 'space' && spaceId) {
      const space = await Space.findById(spaceId);
      if (!space) {
        return sendResponse(res, 404, false, 'Space not found');
      }

      // Update space with GitHub App installation
      space.githubApp = {
        installationId: installation_id,
        repository: repository,
        appId: installation.app_id,
        account: installation.account,
        installedAt: new Date(),
        permissions: installation.permissions
      };

      await space.save();

      // Send notification to GitHub repository
      await githubService.sendInstallationNotification(installation_id, {
        type: 'space_linked',
        spaceName: space.name,
        repository: repository,
        message: `TaskFlow space "${space.name}" has been linked to your GitHub repository "${repository}"`
      });

      return sendResponse(res, 200, true, 'Space linked to GitHub repository successfully', {
        spaceId: space._id,
        repository: repository,
        installationId: installation_id
      });
    }

    return sendResponse(res, 400, false, 'Invalid installation type');

  } catch (error) {
    logger.error('Error handling GitHub App installation:', error);
    sendResponse(res, 500, false, `Failed to handle installation: ${error.message}`);
  }
};

// Get installation status
exports.getInstallationStatus = async (req, res) => {
  try {
    const { workspaceId, spaceId } = req.query;
    
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return sendResponse(res, 404, false, 'Workspace not found');
      }
      
      return sendResponse(res, 200, true, 'Installation status retrieved', {
        installed: !!workspace.githubApp?.installationId,
        organization: workspace.githubApp?.organization,
        installedAt: workspace.githubApp?.installedAt
      });
    }

    if (spaceId) {
      const space = await Space.findById(spaceId);
      if (!space) {
        return sendResponse(res, 404, false, 'Space not found');
      }
      
      return sendResponse(res, 200, true, 'Installation status retrieved', {
        installed: !!space.githubApp?.installationId,
        repository: space.githubApp?.repository,
        installedAt: space.githubApp?.installedAt
      });
    }

    return sendResponse(res, 400, false, 'Workspace ID or Space ID is required');

  } catch (error) {
    logger.error('Error getting installation status:', error);
    sendResponse(res, 500, false, `Failed to get installation status: ${error.message}`);
  }
};

// Uninstall GitHub App
exports.uninstallApp = async (req, res) => {
  try {
    const { workspaceId, spaceId } = req.body;
    
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return sendResponse(res, 404, false, 'Workspace not found');
      }
      
      // Remove GitHub App installation
      workspace.githubApp = undefined;
      await workspace.save();
      
      return sendResponse(res, 200, true, 'GitHub App uninstalled from workspace');
    }

    if (spaceId) {
      const space = await Space.findById(spaceId);
      if (!space) {
        return sendResponse(res, 404, false, 'Space not found');
      }
      
      // Remove GitHub App installation
      space.githubApp = undefined;
      await space.save();
      
      return sendResponse(res, 200, true, 'GitHub App uninstalled from space');
    }

    return sendResponse(res, 400, false, 'Workspace ID or Space ID is required');

  } catch (error) {
    logger.error('Error uninstalling GitHub App:', error);
    sendResponse(res, 500, false, `Failed to uninstall: ${error.message}`);
  }
};
