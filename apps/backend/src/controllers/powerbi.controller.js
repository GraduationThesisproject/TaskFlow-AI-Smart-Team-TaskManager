const PowerBIService = require('../services/powerbi.service');
const { success, badRequest, serverError, unauthorized } = require('../utils/response');
const logger = require('../config/logger');

class PowerBIController {
  /**
   * Get Power BI access token
   */
  async getAccessToken(req, res) {
    try {
      const token = await PowerBIService.getAccessToken();
      return success(res, 'Power BI access token retrieved successfully', { accessToken: token, expiresIn: 3600 });
    } catch (error) {
      logger.error('PowerBI Controller: Error getting access token:', error);
      return serverError(res, 'Failed to get Power BI access token');
    }
  }

  /**
   * Get available workspaces
   */
  async getWorkspaces(req, res) {
    try {
      const workspaces = await PowerBIService.getWorkspaces();
      return success(res, 'Power BI workspaces retrieved successfully', { workspaces });
    } catch (error) {
      logger.error('PowerBI Controller: Error fetching workspaces:', error);
      
      // Check if it's a configuration error
      if (error.message.includes('not configured')) {
        return res.status(503).json({
          success: false,
          message: error.message,
          error: 'POWERBI_NOT_CONFIGURED',
          data: null
        });
      }
      
      return serverError(res, error.message || 'Failed to fetch Power BI workspaces');
    }
  }

  /**
   * Get reports from a workspace
   */
  async getReports(req, res) {
    try {
      const { workspaceId } = req.params;
      const reports = await PowerBIService.getReports(workspaceId);
      return success(res, 'Power BI reports retrieved successfully', { reports });
    } catch (error) {
      logger.error('PowerBI Controller: Error fetching reports:', error);
      return serverError(res, 'Failed to fetch Power BI reports');
    }
  }

  /**
   * Get datasets from a workspace
   */
  async getDatasets(req, res) {
    try {
      const { workspaceId } = req.params;
      const datasets = await PowerBIService.getDatasets(workspaceId);
      return success(res, 'Power BI datasets retrieved successfully', { datasets });
    } catch (error) {
      logger.error('PowerBI Controller: Error fetching datasets:', error);
      return serverError(res, 'Failed to fetch Power BI datasets');
    }
  }

  /**
   * Get report embed token
   */
  async getReportEmbedToken(req, res) {
    try {
      const { reportId } = req.params;
      const { workspaceId } = req.body;
      
      if (!workspaceId) {
        return badRequest(res, 'Workspace ID is required');
      }

      const embedToken = await PowerBIService.getReportEmbedToken(reportId, workspaceId);
      return success(res, 'Report embed token retrieved successfully', { embedToken });
    } catch (error) {
      logger.error('PowerBI Controller: Error getting embed token:', error);
      return serverError(res, 'Failed to get report embed token');
    }
  }

  /**
   * Refresh a dataset
   */
  async refreshDataset(req, res) {
    try {
      const { datasetId } = req.params;
      const { workspaceId } = req.body;
      
      if (!workspaceId) {
        return badRequest(res, 'Workspace ID is required');
      }

      await PowerBIService.refreshDataset(datasetId, workspaceId);
      return success(res, 'Dataset refresh initiated successfully', { message: 'Dataset refresh initiated successfully' });
    } catch (error) {
      logger.error('PowerBI Controller: Error refreshing dataset:', error);
      return serverError(res, 'Failed to refresh dataset');
    }
  }

  /**
   * Get dataset schema
   */
  async getDatasetSchema(req, res) {
    try {
      const { datasetId } = req.params;
      const { workspaceId } = req.body;
      
      if (!workspaceId) {
        return badRequest(res, 'Workspace ID is required');
      }

      const dataset = await PowerBIService.getDatasetSchema(datasetId, workspaceId);
      return success(res, 'Dataset schema retrieved successfully', { dataset });
    } catch (error) {
      logger.error('PowerBI Controller: Error getting dataset schema:', error);
      return serverError(res, 'Failed to get dataset schema');
    }
  }

  /**
   * Get Power BI configuration status
   */
  async getConfigStatus(req, res) {
    try {
      const status = PowerBIService.getConfigurationStatus();
      return success(res, 'Power BI configuration status retrieved successfully', { status });
    } catch (error) {
      logger.error('PowerBI Controller: Error getting configuration status:', error);
      return serverError(res, 'Failed to get Power BI configuration status');
    }
  }

  /**
   * Get Power BI configuration
   */
  async getConfig(req, res) {
    try {
      const config = await PowerBIService.getConfiguration();
      return success(res, 'Power BI configuration retrieved successfully', { config });
    } catch (error) {
      logger.error('PowerBI Controller: Error getting configuration:', error);
      return serverError(res, 'Failed to get Power BI configuration');
    }
  }

  /**
   * Save Power BI configuration
   */
  async saveConfig(req, res) {
    try {
      const configData = req.body;
      const config = await PowerBIService.saveConfiguration(configData);
      return success(res, 'Configuration saved successfully', { config, message: 'Configuration saved successfully' });
    } catch (error) {
      logger.error('PowerBI Controller: Error saving configuration:', error);
      return serverError(res, 'Failed to save Power BI configuration');
    }
  }

  /**
   * Test Power BI connection
   */
  async testConnection(req, res) {
    try {
      const configData = req.body;
      const result = await PowerBIService.testConnection(configData);
      return success(res, 'Connection test successful', { 
        message: 'Connection test successful',
        details: result 
      });
    } catch (error) {
      logger.error('PowerBI Controller: Error testing connection:', error);
      return serverError(res, 'Connection test failed');
    }
  }
}

module.exports = new PowerBIController();
