const axios = require('axios');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');
const logger = require('../config/logger');
const config = require('../config/env');

class PowerBIService {
  constructor() {
    this.clientId = config.POWERBI_CLIENT_ID;
    this.clientSecret = config.POWERBI_CLIENT_SECRET;
    this.tenantId = config.POWERBI_TENANT_ID;
    this.scope = 'https://analysis.windows.net/powerbi/api/.default';
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Check if Power BI is configured with real values (not placeholders)
    this.isConfigured = this._isValidConfiguration();
  }

  /**
   * Check if the configuration contains real values (not placeholders)
   */
  _isValidConfiguration() {
    const hasClientId = this.clientId && 
                       this.clientId !== 'your_azure_app_client_id_here' && 
                       this.clientId.trim() !== '';
    
    const hasClientSecret = this.clientSecret && 
                           this.clientSecret !== 'your_azure_app_client_secret_here' && 
                           this.clientSecret.trim() !== '';
    
    const hasTenantId = this.tenantId && 
                       this.tenantId !== 'your_azure_tenant_id_here' && 
                       this.tenantId.trim() !== '';
    
    return hasClientId && hasClientSecret && hasTenantId;
  }

  /**
   * Check if Power BI is properly configured
   */
  checkConfiguration() {
    if (!this.isConfigured) {
      const hasPlaceholders = this.clientId === 'your_azure_app_client_id_here' || 
                             this.clientSecret === 'your_azure_app_client_secret_here' || 
                             this.tenantId === 'your_azure_tenant_id_here';
      
      if (hasPlaceholders) {
        throw new Error('Power BI has placeholder values in the .env file. Please replace them with your actual Azure AD application credentials. See the setup instructions in the configuration status endpoint.');
      } else {
        throw new Error('Power BI is not configured. Please set POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, and POWERBI_TENANT_ID in your environment variables.');
      }
    }
  }

  /**
   * Get Power BI access token using client credentials
   */
  async getAccessToken() {
    try {
      // Check configuration first
      this.checkConfiguration();
      
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credential = new ClientSecretCredential(
        this.tenantId,
        this.clientId,
        this.clientSecret
      );

      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: [this.scope]
      });

      const client = Client.initWithMiddleware({
        authProvider: authProvider
      });

      // Get access token
      const token = await credential.getToken(this.scope);
      this.accessToken = token.token;
      this.tokenExpiry = token.expiresOnTimestamp;

      return this.accessToken;
    } catch (error) {
      logger.error('PowerBI Service: Error getting access token:', error);
      throw new Error('Failed to authenticate with Power BI');
    }
  }

  /**
   * Make authenticated request to Power BI API
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios({
        url: `https://api.powerbi.com/v1.0/myorg${endpoint}`,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        data: options.data,
        ...options
      });

      return response.data;
    } catch (error) {
      logger.error('PowerBI Service: API request failed:', error);
      throw error;
    }
  }

  /**
   * Get Power BI configuration status
   */
  getConfigurationStatus() {
    const hasClientId = this.clientId && 
                       this.clientId !== 'your_azure_app_client_id_here' && 
                       this.clientId.trim() !== '';
    
    const hasClientSecret = this.clientSecret && 
                           this.clientSecret !== 'your_azure_app_client_secret_here' && 
                           this.clientSecret.trim() !== '';
    
    const hasTenantId = this.tenantId && 
                       this.tenantId !== 'your_azure_tenant_id_here' && 
                       this.tenantId.trim() !== '';

    const isPlaceholder = (value) => {
      return value && (
        value === 'your_azure_app_client_id_here' ||
        value === 'your_azure_app_client_secret_here' ||
        value === 'your_azure_tenant_id_here'
      );
    };

    return {
      isConfigured: this.isConfigured,
      hasClientId,
      hasClientSecret,
      hasTenantId,
      hasPlaceholders: isPlaceholder(this.clientId) || isPlaceholder(this.clientSecret) || isPlaceholder(this.tenantId),
      message: this.isConfigured 
        ? 'Power BI is properly configured'
        : hasPlaceholders
          ? 'Power BI has placeholder values. Please replace them with your actual Azure AD credentials.'
          : 'Power BI is not configured. Please set POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, and POWERBI_TENANT_ID in your environment variables.',
      setupInstructions: 'To set up Power BI, you need to: 1) Register an Azure AD application, 2) Grant Power BI API permissions, 3) Create a client secret, 4) Update the .env file with real values.'
    };
  }

  /**
   * Get available workspaces
   */
  async getWorkspaces() {
    try {
      // Check configuration first
      this.checkConfiguration();
      
      const data = await this.makeRequest('/groups');
      return data.value || [];
    } catch (error) {
      logger.error('PowerBI Service: Error fetching workspaces:', error);
      
      // If it's a configuration error, provide a helpful message
      if (error.message.includes('placeholder values') || error.message.includes('not configured')) {
        throw new Error('Power BI is not configured. Please contact your administrator to set up Power BI integration.');
      }
      
      throw new Error('Failed to fetch Power BI workspaces. Please try again later.');
    }
  }

  /**
   * Get reports from a workspace
   */
  async getReports(workspaceId) {
    try {
      const data = await this.makeRequest(`/groups/${workspaceId}/reports`);
      return data.value || [];
    } catch (error) {
      logger.error('PowerBI Service: Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get datasets from a workspace
   */
  async getDatasets(workspaceId) {
    try {
      const data = await this.makeRequest(`/groups/${workspaceId}/datasets`);
      return data.value || [];
    } catch (error) {
      logger.error('PowerBI Service: Error fetching datasets:', error);
      throw error;
    }
  }

  /**
   * Get report embed token
   */
  async getReportEmbedToken(reportId, workspaceId) {
    try {
      const data = await this.makeRequest(`/reports/${reportId}/GenerateToken`, {
        method: 'POST',
        data: {
          accessLevel: 'View',
          allowSaveAs: false,
          identities: []
        }
      });

      return data.token;
    } catch (error) {
      logger.error('PowerBI Service: Error getting embed token:', error);
      throw error;
    }
  }

  /**
   * Refresh a dataset
   */
  async refreshDataset(datasetId, workspaceId) {
    try {
      await this.makeRequest(`/groups/${workspaceId}/datasets/${datasetId}/refreshes`, {
        method: 'POST'
      });
    } catch (error) {
      logger.error('PowerBI Service: Error refreshing dataset:', error);
      throw error;
    }
  }

  /**
   * Get dataset schema
   */
  async getDatasetSchema(datasetId, workspaceId) {
    try {
      const data = await this.makeRequest(`/groups/${workspaceId}/datasets/${datasetId}/tables`);
      return {
        id: datasetId,
        tables: data.value || []
      };
    } catch (error) {
      logger.error('PowerBI Service: Error getting dataset schema:', error);
      throw error;
    }
  }

  /**
   * Get Power BI configuration
   */
  async getConfiguration() {
    try {
      // This would typically come from a database
      return {
        clientId: this.clientId,
        tenantId: this.tenantId,
        isConfigured: !!(this.clientId && this.clientSecret && this.tenantId)
      };
    } catch (error) {
      logger.error('PowerBI Service: Error getting configuration:', error);
      throw error;
    }
  }

  /**
   * Save Power BI configuration
   */
  async saveConfiguration(configData) {
    try {
      // This would typically save to a database
      // For now, we'll update the service instance
      if (configData.clientId) this.clientId = configData.clientId;
      if (configData.clientSecret) this.clientSecret = configData.clientSecret;
      if (configData.tenantId) this.tenantId = configData.tenantId;

      // Clear cached token to force re-authentication
      this.accessToken = null;
      this.tokenExpiry = null;

      return await this.getConfiguration();
    } catch (error) {
      logger.error('PowerBI Service: Error saving configuration:', error);
      throw error;
    }
  }

  /**
   * Test Power BI connection
   */
  async testConnection(configData) {
    try {
      // Temporarily update credentials for testing
      const originalClientId = this.clientId;
      const originalClientSecret = this.clientSecret;
      const originalTenantId = this.tenantId;

      if (configData.clientId) this.clientId = configData.clientId;
      if (configData.clientSecret) this.clientSecret = configData.clientSecret;
      if (configData.tenantId) this.tenantId = configData.tenantId;

      // Try to get an access token
      const token = await this.getAccessToken();

      // Restore original credentials
      this.clientId = originalClientId;
      this.clientSecret = originalClientSecret;
      this.tenantId = originalTenantId;

      return {
        success: true,
        message: 'Connection test successful',
        tokenExpiry: this.tokenExpiry
      };
    } catch (error) {
      logger.error('PowerBI Service: Connection test failed:', error);
      throw new Error('Connection test failed: ' + error.message);
    }
  }
}

module.exports = new PowerBIService();
