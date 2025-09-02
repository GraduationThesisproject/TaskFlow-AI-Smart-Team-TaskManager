const Integration = require('../models/Integration');
const { sendResponse } = require('../utils/responseHandler');
const { createIntegrationService } = require('../services/integration.service');
const logger = require('../config/logger');

// Get all integrations
const getIntegrations = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const integrations = await Integration.find(filter)
      .select('-apiKey -webhookSecret') // Exclude sensitive data
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedIntegrations = integrations.map(integration => ({
      id: integration._id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      status: integration.status,
      lastSync: integration.lastSyncFormatted,
      syncStatus: integration.syncStatus,
      isEnabled: integration.isEnabled,
      errorMessage: integration.errorMessage,
      retryCount: integration.retryCount,
      maxRetries: integration.maxRetries,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt
    }));

    sendResponse(res, 200, true, 'Integrations retrieved successfully', {
      integrations: transformedIntegrations,
      total: transformedIntegrations.length
    });
  } catch (error) {
    logger.error('Error getting integrations:', error);
    sendResponse(res, 500, false, 'Failed to retrieve integrations');
  }
};

// Get single integration
const getIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    
    const integration = await Integration.findById(id)
      .select('-apiKey -webhookSecret'); // Exclude sensitive data

    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    const transformedIntegration = {
      id: integration._id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      status: integration.status,
      lastSync: integration.lastSyncFormatted,
      syncStatus: integration.syncStatus,
      isEnabled: integration.isEnabled,
      errorMessage: integration.errorMessage,
      retryCount: integration.retryCount,
      maxRetries: integration.maxRetries,
      config: integration.config,
      metadata: integration.metadata,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt
    };

    sendResponse(res, 200, true, 'Integration retrieved successfully', {
      integration: transformedIntegration
    });
  } catch (error) {
    logger.error('Error getting integration:', error);
    sendResponse(res, 500, false, 'Failed to retrieve integration');
  }
};

// Create new integration
const createIntegration = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      apiKey,
      config = {},
      isEnabled = false
    } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return sendResponse(res, 400, false, 'Name, description, and category are required');
    }

    // Check if integration already exists
    const existingIntegration = await Integration.findOne({ name });
    if (existingIntegration) {
      return sendResponse(res, 400, false, 'Integration with this name already exists');
    }

    // Create integration
    const integration = new Integration({
      name,
      description,
      category,
      apiKey,
      config,
      isEnabled,
      status: isEnabled ? 'pending' : 'inactive'
    });

    await integration.save();

    // Test connection if enabled
    if (isEnabled && apiKey) {
      try {
        const service = createIntegrationService(integration);
        const testResult = await service.testConnection();
        
        if (testResult.success) {
          integration.status = 'active';
          integration.syncStatus = 'success';
        } else {
          integration.status = 'error';
          integration.syncStatus = 'error';
          integration.errorMessage = testResult.message;
        }
        
        await integration.save();
      } catch (error) {
        logger.error('Error testing integration connection:', error);
        integration.status = 'error';
        integration.syncStatus = 'error';
        integration.errorMessage = error.message;
        await integration.save();
      }
    }

    const transformedIntegration = {
      id: integration._id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      status: integration.status,
      lastSync: integration.lastSyncFormatted,
      syncStatus: integration.syncStatus,
      isEnabled: integration.isEnabled,
      errorMessage: integration.errorMessage
    };

    sendResponse(res, 201, true, 'Integration created successfully', {
      integration: transformedIntegration
    });
  } catch (error) {
    logger.error('Error creating integration:', error);
    sendResponse(res, 500, false, 'Failed to create integration');
  }
};

// Update integration
const updateIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const integration = await Integration.findById(id);
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        integration[key] = updateData[key];
      }
    });

    // Test connection if API key changed or integration is being enabled
    if ((updateData.apiKey && updateData.apiKey !== integration.apiKey) || 
        (updateData.isEnabled && !integration.isEnabled)) {
      try {
        const service = createIntegrationService(integration);
        const testResult = await service.testConnection();
        
        if (testResult.success) {
          integration.status = 'active';
          integration.syncStatus = 'success';
          integration.errorMessage = null;
        } else {
          integration.status = 'error';
          integration.syncStatus = 'error';
          integration.errorMessage = testResult.message;
        }
      } catch (error) {
        logger.error('Error testing integration connection:', error);
        integration.status = 'error';
        integration.syncStatus = 'error';
        integration.errorMessage = error.message;
      }
    }

    await integration.save();

    const transformedIntegration = {
      id: integration._id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      status: integration.status,
      lastSync: integration.lastSyncFormatted,
      syncStatus: integration.syncStatus,
      isEnabled: integration.isEnabled,
      errorMessage: integration.errorMessage
    };

    sendResponse(res, 200, true, 'Integration updated successfully', {
      integration: transformedIntegration
    });
  } catch (error) {
    logger.error('Error updating integration:', error);
    sendResponse(res, 500, false, 'Failed to update integration');
  }
};

// Delete integration
const deleteIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findById(id);
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    await Integration.findByIdAndDelete(id);

    sendResponse(res, 200, true, 'Integration deleted successfully');
  } catch (error) {
    logger.error('Error deleting integration:', error);
    sendResponse(res, 500, false, 'Failed to delete integration');
  }
};

// Test integration connection
const testIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findById(id).select('+apiKey');
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    if (!integration.apiKey) {
      return sendResponse(res, 400, false, 'API key is required to test connection');
    }

    const service = createIntegrationService(integration);
    const testResult = await service.testConnection();

    // Update integration status based on test result
    if (testResult.success) {
      integration.status = 'active';
      integration.syncStatus = 'success';
      integration.errorMessage = null;
    } else {
      integration.status = 'error';
      integration.syncStatus = 'error';
      integration.errorMessage = testResult.message;
    }

    await integration.save();

    sendResponse(res, 200, true, 'Connection test completed', {
      success: testResult.success,
      message: testResult.message,
      status: integration.status,
      syncStatus: integration.syncStatus
    });
  } catch (error) {
    logger.error('Error testing integration:', error);
    sendResponse(res, 500, false, 'Failed to test integration connection');
  }
};

// Sync integration
const syncIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findById(id).select('+apiKey');
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    if (!integration.isEnabled) {
      return sendResponse(res, 400, false, 'Integration must be enabled to sync');
    }

    if (!integration.apiKey) {
      return sendResponse(res, 400, false, 'API key is required to sync');
    }

    const service = createIntegrationService(integration);
    const syncResult = await service.sync();

    // Update integration with sync results
    if (syncResult.success) {
      await integration.updateSyncStatus('success');
    } else {
      await integration.updateSyncStatus('error', syncResult.message);
    }

    sendResponse(res, 200, true, 'Sync completed', {
      success: syncResult.success,
      message: syncResult.message,
      data: syncResult.data || null,
      lastSync: integration.lastSyncFormatted
    });
  } catch (error) {
    logger.error('Error syncing integration:', error);
    sendResponse(res, 500, false, 'Failed to sync integration');
  }
};

// Get integration health
const getIntegrationHealth = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findById(id).select('+apiKey');
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    const service = createIntegrationService(integration);
    const health = await service.getHealth();

    sendResponse(res, 200, true, 'Health check completed', {
      health
    });
  } catch (error) {
    logger.error('Error getting integration health:', error);
    sendResponse(res, 500, false, 'Failed to get integration health');
  }
};

// Toggle integration status
const toggleIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findById(id).select('+apiKey');
    if (!integration) {
      return sendResponse(res, 404, false, 'Integration not found');
    }

    integration.isEnabled = !integration.isEnabled;

    // Test connection if enabling
    if (integration.isEnabled && integration.apiKey) {
      try {
        const service = createIntegrationService(integration);
        const testResult = await service.testConnection();
        
        if (testResult.success) {
          integration.status = 'active';
          integration.syncStatus = 'success';
          integration.errorMessage = null;
        } else {
          integration.status = 'error';
          integration.syncStatus = 'error';
          integration.errorMessage = testResult.message;
        }
      } catch (error) {
        integration.status = 'error';
        integration.syncStatus = 'error';
        integration.errorMessage = error.message;
      }
    } else if (!integration.isEnabled) {
      integration.status = 'inactive';
    }

    await integration.save();

    const transformedIntegration = {
      id: integration._id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      status: integration.status,
      lastSync: integration.lastSyncFormatted,
      syncStatus: integration.syncStatus,
      isEnabled: integration.isEnabled,
      errorMessage: integration.errorMessage
    };

    sendResponse(res, 200, true, 'Integration status updated successfully', {
      integration: transformedIntegration
    });
  } catch (error) {
    logger.error('Error toggling integration:', error);
    sendResponse(res, 500, false, 'Failed to toggle integration status');
  }
};

// Get integration statistics
const getIntegrationStats = async (req, res) => {
  try {
    const stats = await Integration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          enabled: { $sum: { $cond: ['$isEnabled', 1, 0] } },
          disabled: { $sum: { $cond: [{ $not: '$isEnabled' }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Integration.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          enabled: { $sum: { $cond: ['$isEnabled', 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    sendResponse(res, 200, true, 'Integration statistics retrieved successfully', {
      stats: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        error: 0,
        pending: 0,
        enabled: 0,
        disabled: 0
      },
      categories: categoryStats
    });
  } catch (error) {
    logger.error('Error getting integration stats:', error);
    sendResponse(res, 500, false, 'Failed to get integration statistics');
  }
};

module.exports = {
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  getIntegrationHealth,
  toggleIntegration,
  getIntegrationStats
};
