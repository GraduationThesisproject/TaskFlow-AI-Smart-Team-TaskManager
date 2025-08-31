const Integration = require('../../models/Integration');
const logger = require('../../config/logger');

class IntegrationSeeder {
  constructor() {
    this.integrations = [
      {
        name: 'Slack',
        description: 'Team communication and notifications',
        category: 'communication',
        status: 'active',
        syncStatus: 'success',
        isEnabled: true,
        apiKey: 'xoxb-sample-slack-token',
        config: {
          defaultChannel: '#general',
          notificationsEnabled: true
        },
        lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        syncInterval: 30,
        metadata: {
          workspaceName: 'TaskFlow Team',
          memberCount: 25
        }
      },
      {
        name: 'Google Drive',
        description: 'File storage and document collaboration',
        category: 'storage',
        status: 'active',
        syncStatus: 'success',
        isEnabled: true,
        apiKey: 'AIza-sample-google-api-key',
        config: {
          syncFolders: ['TaskFlow Documents', 'Shared Resources'],
          autoBackup: true
        },
        lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        syncInterval: 60,
        metadata: {
          totalFiles: 150,
          storageUsed: '2.5 GB'
        }
      },
      {
        name: 'GitHub',
        description: 'Code repository and version control',
        category: 'development',
        status: 'active',
        syncStatus: 'warning',
        isEnabled: true,
        apiKey: 'ghp-sample-github-token',
        config: {
          repositories: ['taskflow-main', 'taskflow-admin'],
          webhookEnabled: true
        },
        lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        syncInterval: 120,
        metadata: {
          totalRepos: 8,
          openIssues: 12
        }
      },
      {
        name: 'Stripe',
        description: 'Payment processing and billing',
        category: 'analytics',
        status: 'inactive',
        syncStatus: 'error',
        isEnabled: false,
        apiKey: 'sk_test_sample-stripe-key',
        config: {
          webhookEndpoint: '/api/webhooks/stripe',
          currency: 'USD'
        },
        lastSync: null,
        syncInterval: 60,
        errorMessage: 'API key expired',
        metadata: {
          totalCustomers: 0,
          monthlyRevenue: 0
        }
      },
      {
        name: 'Mailchimp',
        description: 'Email marketing and automation',
        category: 'marketing',
        status: 'pending',
        syncStatus: 'error',
        isEnabled: false,
        apiKey: 'sample-mailchimp-api-key',
        config: {
          serverPrefix: 'us1',
          defaultList: 'Newsletter Subscribers'
        },
        lastSync: null,
        syncInterval: 60,
        errorMessage: 'Configuration incomplete',
        metadata: {
          totalSubscribers: 0,
          activeCampaigns: 0
        }
      },
      {
        name: 'Discord',
        description: 'Team chat and voice communication',
        category: 'communication',
        status: 'active',
        syncStatus: 'success',
        isEnabled: true,
        apiKey: 'sample-discord-bot-token',
        config: {
          defaultChannel: 'general',
          notificationsEnabled: true
        },
        lastSync: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        syncInterval: 45,
        metadata: {
          serverName: 'TaskFlow Community',
          memberCount: 15
        }
      },
      {
        name: 'Dropbox',
        description: 'Cloud file storage and sharing',
        category: 'storage',
        status: 'active',
        syncStatus: 'success',
        isEnabled: true,
        apiKey: 'sample-dropbox-access-token',
        config: {
          syncFolder: '/TaskFlow',
          autoSync: true
        },
        lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        syncInterval: 90,
        metadata: {
          totalFiles: 75,
          storageUsed: '1.2 GB'
        }
      },
      {
        name: 'Jira',
        description: 'Project management and issue tracking',
        category: 'development',
        status: 'active',
        syncStatus: 'success',
        isEnabled: true,
        apiKey: 'sample-jira-api-token',
        config: {
          projectKey: 'TF',
          syncIssues: true
        },
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        syncInterval: 180,
        metadata: {
          totalProjects: 3,
          openIssues: 8
        }
      }
    ];
  }

  async seed() {
    try {
      logger.info('Starting integration seeding...');

      // Clear existing integrations
      await Integration.deleteMany({});
      logger.info('Cleared existing integrations');

      // Insert new integrations
      const createdIntegrations = await Integration.insertMany(this.integrations);
      logger.info(`Created ${createdIntegrations.length} integrations`);

      // Log created integrations
      createdIntegrations.forEach(integration => {
        logger.info(`Created integration: ${integration.name} (${integration.category})`);
      });

      return {
        success: true,
        message: `Successfully seeded ${createdIntegrations.length} integrations`,
        count: createdIntegrations.length
      };
    } catch (error) {
      logger.error('Error seeding integrations:', error);
      return {
        success: false,
        message: 'Failed to seed integrations',
        error: error.message
      };
    }
  }

  async clear() {
    try {
      await Integration.deleteMany({});
      logger.info('Cleared all integrations');
      return {
        success: true,
        message: 'Successfully cleared all integrations'
      };
    } catch (error) {
      logger.error('Error clearing integrations:', error);
      return {
        success: false,
        message: 'Failed to clear integrations',
        error: error.message
      };
    }
  }

  async getStats() {
    try {
      const total = await Integration.countDocuments();
      const active = await Integration.countDocuments({ status: 'active' });
      const enabled = await Integration.countDocuments({ isEnabled: true });
      const byCategory = await Integration.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        total,
        active,
        enabled,
        byCategory
      };
    } catch (error) {
      logger.error('Error getting integration stats:', error);
      return null;
    }
  }
}

module.exports = IntegrationSeeder;
