const IntegrationAiToken = require('../models/IntegrationAiToken');
const logger = require('../config/logger');

/**
 * AI Token Service
 * Manages AI token retrieval and usage
 */
class AiTokenService {
  constructor() {
    this.tokenCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get active token for provider
   */
  async getActiveToken(provider = 'google') {
    try {
      // Check cache first
      const cacheKey = `active_${provider}`;
      const cached = this.tokenCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.token;
      }

      // Get from database
      const token = await IntegrationAiToken.getActiveToken(provider);
      
      if (!token) {
        logger.warn(`No active ${provider} token found`);
        return null;
      }

      // Cache the token
      this.tokenCache.set(cacheKey, {
        token,
        timestamp: Date.now()
      });

      return token;
    } catch (error) {
      logger.error('Error getting active token:', error);
      return null;
    }
  }

  /**
   * Get token value for API usage
   */
  async getTokenValue(provider = 'google') {
    try {
      const token = await this.getActiveToken(provider);
      return token ? token.token : null;
    } catch (error) {
      logger.error('Error getting token value:', error);
      return null;
    }
  }

  /**
   * Get token configuration
   */
  async getTokenConfig(provider = 'google') {
    try {
      const token = await this.getActiveToken(provider);
      return token ? token.config : null;
    } catch (error) {
      logger.error('Error getting token config:', error);
      return null;
    }
  }

  /**
   * Update token usage
   */
  async updateTokenUsage(provider = 'google') {
    try {
      const token = await this.getActiveToken(provider);
      if (token) {
        await token.updateUsage();
        
        // Clear cache to force refresh
        this.clearCache(provider);
      }
    } catch (error) {
      logger.error('Error updating token usage:', error);
    }
  }

  /**
   * Validate token
   */
  async validateToken(provider = 'google') {
    try {
      const token = await this.getActiveToken(provider);
      if (!token) {
        return { valid: false, error: 'No active token found' };
      }

      // Here you would typically make a test API call
      // For now, we'll just mark it as valid
      await token.validateToken();
      
      return { valid: true, token };
    } catch (error) {
      logger.error('Error validating token:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Create new token
   */
  async createToken(tokenData, adminId) {
    try {
      const {
        token,
        provider = 'google',
        name,
        description,
        config = {}
      } = tokenData;

      // Check if token already exists
      const existingToken = await IntegrationAiToken.findOne({ token });
      if (existingToken) {
        throw new Error('Token already exists');
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
      
      // Clear cache
      this.clearCache(provider);
      
      logger.info(`New AI token created: ${newToken.name} (${newToken.provider})`);
      
      return newToken;
    } catch (error) {
      logger.error('Error creating token:', error);
      throw error;
    }
  }

  /**
   * Activate token (will archive others)
   */
  async activateToken(tokenId, adminId) {
    try {
      const token = await IntegrationAiToken.activateToken(tokenId, adminId);
      
      if (!token) {
        throw new Error('Token not found');
      }

      // Clear cache
      this.clearCache(token.provider);
      
      logger.info(`AI token activated: ${token.name} (${token.provider})`);
      
      return token;
    } catch (error) {
      logger.error('Error activating token:', error);
      throw error;
    }
  }

  /**
   * Archive token
   */
  async archiveToken(tokenId, adminId) {
    try {
      const token = await IntegrationAiToken.archiveToken(tokenId, adminId);
      
      if (!token) {
        throw new Error('Token not found');
      }

      // Clear cache
      this.clearCache(token.provider);
      
      logger.info(`AI token archived: ${token.name}`);
      
      return token;
    } catch (error) {
      logger.error('Error archiving token:', error);
      throw error;
    }
  }

  /**
   * Get all tokens
   */
  async getAllTokens(filters = {}) {
    try {
      const { provider, status, includeArchived = false } = filters;
      
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
      
      return tokens;
    } catch (error) {
      logger.error('Error getting all tokens:', error);
      throw error;
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(provider = null) {
    try {
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
      
      return stats;
    } catch (error) {
      logger.error('Error getting token stats:', error);
      throw error;
    }
  }

  /**
   * Clear cache for provider
   */
  clearCache(provider = null) {
    if (provider) {
      this.tokenCache.delete(`active_${provider}`);
    } else {
      this.tokenCache.clear();
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      cacheSize: this.tokenCache.size,
      cacheExpiry: this.cacheExpiry,
      providers: ['google', 'openai', 'anthropic', 'azure']
    };
  }
}

// Create singleton instance
const aiTokenService = new AiTokenService();

module.exports = aiTokenService;
