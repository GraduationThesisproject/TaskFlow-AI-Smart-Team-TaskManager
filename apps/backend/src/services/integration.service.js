const axios = require('axios');
const logger = require('../config/logger');
const Integration = require('../models/Integration');

class BaseIntegrationService {
  constructor(integration) {
    this.integration = integration;
    this.name = integration.name;
    this.config = integration.config || {};
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  async sync() {
    throw new Error('sync must be implemented by subclass');
  }

  async getHealth() {
    try {
      const result = await this.testConnection();
      return {
        status: result.success ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        message: result.message
      };
    } catch (error) {
      return {
        status: 'error',
        lastCheck: new Date(),
        message: error.message
      };
    }
  }
}

class SlackIntegrationService extends BaseIntegrationService {
  constructor(integration) {
    super(integration);
    this.apiToken = integration.apiKey;
    this.baseUrl = 'https://slack.com/api';
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/auth.test`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      if (response.data.ok) {
        return {
          success: true,
          message: `Connected to Slack workspace: ${response.data.team}`
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Failed to authenticate with Slack'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sync() {
    try {
      // Get channels
      const channelsResponse = await axios.get(`${this.baseUrl}/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        },
        params: {
          types: 'public_channel,private_channel'
        }
      });

      // Get users
      const usersResponse = await axios.get(`${this.baseUrl}/users.list`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return {
        success: true,
        message: `Synced ${channelsResponse.data.channels?.length || 0} channels and ${usersResponse.data.members?.length || 0} users`,
        data: {
          channels: channelsResponse.data.channels || [],
          users: usersResponse.data.members || []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

class GoogleDriveIntegrationService extends BaseIntegrationService {
  constructor(integration) {
    super(integration);
    this.apiKey = integration.apiKey;
    this.baseUrl = 'https://www.googleapis.com/drive/v3';
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/about`, {
        params: {
          key: this.apiKey,
          fields: 'user,storageQuota'
        }
      });

      return {
        success: true,
        message: `Connected to Google Drive: ${response.data.user?.emailAddress}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sync() {
    try {
      const response = await axios.get(`${this.baseUrl}/files`, {
        params: {
          key: this.apiKey,
          pageSize: 100,
          fields: 'files(id,name,mimeType,size,modifiedTime)'
        }
      });

      return {
        success: true,
        message: `Synced ${response.data.files?.length || 0} files`,
        data: {
          files: response.data.files || []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

class GitHubIntegrationService extends BaseIntegrationService {
  constructor(integration) {
    super(integration);
    this.apiToken = integration.apiKey;
    this.baseUrl = 'https://api.github.com';
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `token ${this.apiToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return {
        success: true,
        message: `Connected to GitHub as: ${response.data.login}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sync() {
    try {
      // Get repositories
      const reposResponse = await axios.get(`${this.baseUrl}/user/repos`, {
        headers: {
          'Authorization': `token ${this.apiToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          per_page: 100
        }
      });

      // Get issues
      const issuesResponse = await axios.get(`${this.baseUrl}/issues`, {
        headers: {
          'Authorization': `token ${this.apiToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          per_page: 100,
          state: 'open'
        }
      });

      return {
        success: true,
        message: `Synced ${reposResponse.data.length} repositories and ${issuesResponse.data.length} issues`,
        data: {
          repositories: reposResponse.data,
          issues: issuesResponse.data
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

class StripeIntegrationService extends BaseIntegrationService {
  constructor(integration) {
    super(integration);
    this.apiKey = integration.apiKey;
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/account`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        message: `Connected to Stripe account: ${response.data.id}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sync() {
    try {
      // Get customers
      const customersResponse = await axios.get(`${this.baseUrl}/customers`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: {
          limit: 100
        }
      });

      // Get charges
      const chargesResponse = await axios.get(`${this.baseUrl}/charges`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: {
          limit: 100
        }
      });

      return {
        success: true,
        message: `Synced ${customersResponse.data.data.length} customers and ${chargesResponse.data.data.length} charges`,
        data: {
          customers: customersResponse.data.data,
          charges: chargesResponse.data.data
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

class MailchimpIntegrationService extends BaseIntegrationService {
  constructor(integration) {
    super(integration);
    this.apiKey = integration.apiKey;
    this.serverPrefix = this.config.serverPrefix || 'us1';
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/ping`, {
        auth: {
          username: 'anystring',
          password: this.apiKey
        }
      });

      return {
        success: true,
        message: 'Connected to Mailchimp API'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sync() {
    try {
      // Get lists
      const listsResponse = await axios.get(`${this.baseUrl}/lists`, {
        auth: {
          username: 'anystring',
          password: this.apiKey
        },
        params: {
          count: 100
        }
      });

      // Get campaigns
      const campaignsResponse = await axios.get(`${this.baseUrl}/campaigns`, {
        auth: {
          username: 'anystring',
          password: this.apiKey
        },
        params: {
          count: 100
        }
      });

      return {
        success: true,
        message: `Synced ${listsResponse.data.lists?.length || 0} lists and ${campaignsResponse.data.campaigns?.length || 0} campaigns`,
        data: {
          lists: listsResponse.data.lists || [],
          campaigns: campaignsResponse.data.campaigns || []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// Factory function to create the appropriate service
function createIntegrationService(integration) {
  switch (integration.name.toLowerCase()) {
    case 'slack':
      return new SlackIntegrationService(integration);
    case 'google drive':
      return new GoogleDriveIntegrationService(integration);
    case 'github':
      return new GitHubIntegrationService(integration);
    case 'stripe':
      return new StripeIntegrationService(integration);
    case 'mailchimp':
      return new MailchimpIntegrationService(integration);
    default:
      return new BaseIntegrationService(integration);
  }
}

module.exports = {
  BaseIntegrationService,
  SlackIntegrationService,
  GoogleDriveIntegrationService,
  GitHubIntegrationService,
  StripeIntegrationService,
  MailchimpIntegrationService,
  createIntegrationService
};
