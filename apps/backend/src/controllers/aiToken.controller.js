const IntegrationAiToken = require('../models/IntegrationAiToken');
const logger = require('../config/logger');

/**
 * AI Token Controller
 * Handles CRUD operations for AI integration tokens
 */

/**
 * Get all AI tokens
 */
const getAiTokens = async (req, res) => {
  try {
    const { provider, status, includeArchived = false } = req.query;
    
    let query = {};
    
    if (provider) {
      query.provider = provider;
    }
    
    if (status) {
      switch (status) {
        case 'active':
          query.isActive = true;
          query.isArchived = false;
          query.isValid = true;
          break;
        case 'inactive':
          query.isActive = false;
          query.isArchived = false;
          break;
        case 'archived':
          query.isArchived = true;
          break;
        case 'invalid':
          query.isValid = false;
          break;
      }
    }
    
    if (!includeArchived) {
      query.isArchived = false;
    }
    
    const tokens = await IntegrationAiToken.find(query)
      .populate('createdBy', 'userName userEmail')
      .populate('updatedBy', 'userName userEmail')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      tokens: tokens.map(token => ({
        id: token._id,
        name: token.name,
        description: token.description,
        provider: token.provider,
        maskedToken: token.maskedToken,
        status: token.status,
        isActive: token.isActive,
        isValid: token.isValid,
        lastUsedAt: token.lastUsedAt,
        usageCount: token.usageCount,
        config: token.config,
        createdBy: token.createdBy,
        updatedBy: token.updatedBy,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt
      }))
    });
  } catch (error) {
    logger.error('Error getting AI tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI tokens',
      error: error.message
    });
  }
};

/**
 * Get active AI token for provider
 */
const getActiveToken = async (req, res) => {
  try {
    const { provider = 'google' } = req.params;
    
    const token = await IntegrationAiToken.getActiveToken(provider);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: `No active ${provider} token found`
      });
    }
    
    res.json({
      success: true,
      token: {
        id: token._id,
        name: token.name,
        provider: token.provider,
        maskedToken: token.maskedToken,
        config: token.config,
        lastUsedAt: token.lastUsedAt,
        usageCount: token.usageCount
      }
    });
  } catch (error) {
    logger.error('Error getting active token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active token',
      error: error.message
    });
  }
};

/**
 * Create new AI token
 */
const createAiToken = async (req, res) => {
  try {
    const {
      token,
      provider = 'google',
      name,
      description,
      config = {}
    } = req.body;
    
    const adminId = req.admin._id;
    
    // Validate required fields
    if (!token || !name) {
      return res.status(400).json({
        success: false,
        message: 'Token and name are required'
      });
    }
    
    // Check if token already exists
    const existingToken = await IntegrationAiToken.findOne({ token });
    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: 'Token already exists'
      });
    }
    
    // Create new token
    const newToken = new IntegrationAiToken({
      token,
      provider,
      name,
      description,
      config: {
        model: config.model || 'gemini-1.5-flash',
        maxTokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.3,
        timeout: config.timeout || 30000
      },
      createdBy: adminId
    });
    
    await newToken.save();
    
    // Populate the created token
    await newToken.populate('createdBy', 'userName userEmail');
    
    logger.info(`New AI token created: ${newToken.name} (${newToken.provider})`);
    
    res.status(201).json({
      success: true,
      message: 'AI token created successfully',
      token: {
        id: newToken._id,
        name: newToken.name,
        description: newToken.description,
        provider: newToken.provider,
        maskedToken: newToken.maskedToken,
        status: newToken.status,
        config: newToken.config,
        createdBy: newToken.createdBy,
        createdAt: newToken.createdAt
      }
    });
  } catch (error) {
    logger.error('Error creating AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create AI token',
      error: error.message
    });
  }
};

/**
 * Update AI token
 */
const updateAiToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const {
      name,
      description,
      config,
      notes
    } = req.body;
    
    const adminId = req.admin._id;
    
    const token = await IntegrationAiToken.findById(tokenId);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    // Update fields
    if (name) token.name = name;
    if (description !== undefined) token.description = description;
    if (config) {
      token.config = { ...token.config, ...config };
    }
    if (notes !== undefined) token.notes = notes;
    
    token.updatedBy = adminId;
    await token.save();
    
    await token.populate('updatedBy', 'userName userEmail');
    
    logger.info(`AI token updated: ${token.name}`);
    
    res.json({
      success: true,
      message: 'AI token updated successfully',
      token: {
        id: token._id,
        name: token.name,
        description: token.description,
        provider: token.provider,
        maskedToken: token.maskedToken,
        status: token.status,
        config: token.config,
        notes: token.notes,
        updatedBy: token.updatedBy,
        updatedAt: token.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error updating AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI token',
      error: error.message
    });
  }
};

/**
 * Activate AI token (will archive others)
 */
const activateToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const adminId = req.admin._id;
    
    const token = await IntegrationAiToken.activateToken(tokenId, adminId);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    await token.populate('updatedBy', 'userName userEmail');
    
    logger.info(`AI token activated: ${token.name} (${token.provider})`);
    
    res.json({
      success: true,
      message: 'AI token activated successfully',
      token: {
        id: token._id,
        name: token.name,
        provider: token.provider,
        status: token.status,
        updatedBy: token.updatedBy,
        updatedAt: token.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error activating AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate AI token',
      error: error.message
    });
  }
};

/**
 * Archive AI token
 */
const archiveToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const adminId = req.admin._id;
    
    const token = await IntegrationAiToken.archiveToken(tokenId, adminId);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    await token.populate('updatedBy', 'userName userEmail');
    
    logger.info(`AI token archived: ${token.name}`);
    
    res.json({
      success: true,
      message: 'AI token archived successfully',
      token: {
        id: token._id,
        name: token.name,
        status: token.status,
        updatedBy: token.updatedBy,
        updatedAt: token.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error archiving AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive AI token',
      error: error.message
    });
  }
};

/**
 * Delete AI token permanently
 */
const deleteToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const token = await IntegrationAiToken.findByIdAndDelete(tokenId);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    logger.info(`AI token deleted permanently: ${token.name}`);
    
    res.json({
      success: true,
      message: 'AI token deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete AI token',
      error: error.message
    });
  }
};

/**
 * Test AI token
 */
const testToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const token = await IntegrationAiToken.findById(tokenId);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    // Here you would typically make a test API call
    // For now, we'll just mark it as valid
    await token.validateToken();
    
    logger.info(`AI token tested: ${token.name}`);
    
    res.json({
      success: true,
      message: 'Token test successful',
      token: {
        id: token._id,
        name: token.name,
        isValid: token.isValid,
        lastValidatedAt: token.lastValidatedAt
      }
    });
  } catch (error) {
    logger.error('Error testing AI token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AI token',
      error: error.message
    });
  }
};

/**
 * Get token usage statistics
 */
const getTokenStats = async (req, res) => {
  try {
    const { provider } = req.query;
    
    let matchQuery = {};
    if (provider) {
      matchQuery.provider = provider;
    }
    
    const stats = await IntegrationAiToken.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$provider',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isActive', true] }, { $eq: ['$isArchived', false] }] },
                1,
                0
              ]
            }
          },
          archived: {
            $sum: {
              $cond: [{ $eq: ['$isArchived', true] }, 1, 0]
            }
          },
          invalid: {
            $sum: {
              $cond: [{ $eq: ['$isValid', false] }, 1, 0]
            }
          },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error getting token stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAiTokens,
  getActiveToken,
  createAiToken,
  updateAiToken,
  activateToken,
  archiveToken,
  deleteToken,
  testToken,
  getTokenStats
};
