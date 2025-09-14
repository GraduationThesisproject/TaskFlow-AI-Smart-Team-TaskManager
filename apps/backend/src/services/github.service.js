const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const env = require('../config/env');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.clientId = env.GITHUB_CLIENT_ID;
    this.clientSecret = env.GITHUB_CLIENT_SECRET;
    
    // GitHub App configuration
    this.appId = env.GITHUB_APP_ID;
    this.privateKey = env.GITHUB_PRIVATE_KEY;
  }

  // Get user's GitHub organizations
  async getUserOrganizations(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user/orgs`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });

      return response.data.map(org => ({
        id: org.id,
        login: org.login,
        name: org.name || org.login,
        url: org.url,
        avatar: org.avatar_url,
        description: org.description,
        isPrivate: org.type === 'Organization'
      }));
    } catch (error) {
      logger.error('Error fetching GitHub organizations:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub organizations: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get repositories for a specific organization
  async getOrganizationRepositories(accessToken, orgLogin) {
    try {
      const response = await axios.get(`${this.baseURL}/orgs/${orgLogin}/repos`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        },
        params: {
          type: 'all', // Include both public and private repos
          sort: 'updated',
          per_page: 100
        }
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.url,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        isPrivate: repo.private,
        isFork: repo.fork,
        language: repo.language,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at
      }));
    } catch (error) {
      logger.error('Error fetching GitHub repositories:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub repositories: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get branches for a specific repository
  async getRepositoryBranches(accessToken, orgLogin, repoName) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${orgLogin}/${repoName}/branches`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        },
        params: {
          per_page: 100
        }
      });

      return response.data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url
        },
        protection: {
          enabled: branch.protection?.enabled || false,
          requiredStatusChecks: branch.protection?.required_status_checks?.enabled || false,
          enforceAdmins: branch.protection?.enforce_admins?.enabled || false
        }
      }));
    } catch (error) {
      logger.error('Error fetching GitHub branches:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub branches: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get GitHub user profile
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });

      return {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar_url,
        url: response.data.url,
        htmlUrl: response.data.html_url
      };
    } catch (error) {
      logger.error('Error fetching GitHub user profile:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub user profile: ${error.response?.data?.message || error.message}`);
    }
  }

  // Validate GitHub access token
  async validateToken(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Check if token has required scopes
  async checkTokenScopes(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });

      const scopes = response.headers['x-oauth-scopes'];
      if (!scopes) return { hasRequiredScopes: false, missingScopes: ['read:org', 'repo'] };

      const requiredScopes = ['read:org', 'repo'];
      const userScopes = scopes.split(',').map(s => s.trim());
      const missingScopes = requiredScopes.filter(scope => !userScopes.includes(scope));

      return {
        hasRequiredScopes: missingScopes.length === 0,
        missingScopes,
        userScopes
      };
    } catch (error) {
      logger.error('Error checking GitHub token scopes:', error.response?.data || error.message);
      return { hasRequiredScopes: false, missingScopes: ['read:org', 'repo'] };
    }
  }

  // Validate GitHub integration completeness
  async validateGitHubIntegration(accessToken) {
    try {
      // Check token validity
      const isValid = await this.validateToken(accessToken);
      if (!isValid) {
        return {
          isValid: false,
          reason: 'invalid_token',
          message: 'GitHub token is invalid or expired'
        };
      }

      // Check scopes
      const scopeCheck = await this.checkTokenScopes(accessToken);
      if (!scopeCheck.hasRequiredScopes) {
        return {
          isValid: false,
          reason: 'insufficient_scopes',
          message: 'Insufficient GitHub permissions',
          missingScopes: scopeCheck.missingScopes,
          userScopes: scopeCheck.userScopes
        };
      }

      // Test organization access
      try {
        await this.getUserOrganizations(accessToken);
      } catch (orgError) {
        if (orgError.message.includes('read:org scope')) {
          return {
            isValid: false,
            reason: 'org_access_denied',
            message: 'Cannot access GitHub organizations',
            missingScopes: ['read:org']
          };
        }
      }

      return {
        isValid: true,
        reason: 'valid',
        message: 'GitHub integration is valid and complete'
      };
    } catch (error) {
      logger.error('Error validating GitHub integration:', error);
      return {
        isValid: false,
        reason: 'validation_error',
        message: 'Failed to validate GitHub integration'
      };
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      return {
        accessToken: response.data.access_token,
        scope: response.data.scope,
        tokenType: response.data.token_type
      };
    } catch (error) {
      logger.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // GitHub App Installation Methods
  async getInstallation(installationId) {
    try {
      const response = await axios.get(`${this.baseURL}/app/installations/${installationId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAppToken()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting installation:', error.response?.data || error.message);
      throw new Error(`Failed to get installation: ${error.message}`);
    }
  }

  async getAppToken() {
    try {
      // Generate JWT token for GitHub App
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iat: now - 60, // Issued at time (1 minute ago)
        exp: now + (10 * 60), // Expires in 10 minutes
        iss: this.appId // GitHub App ID
      };

      const token = jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
      return token;
    } catch (error) {
      logger.error('Error generating app token:', error);
      throw new Error('Failed to generate app token');
    }
  }

  async sendInstallationNotification(installationId, notification) {
    try {
      const appToken = await this.getAppToken();
      
      // Create an issue or comment in the repository/organization
      const response = await axios.post(`${this.baseURL}/repos/${notification.repository}/issues`, {
        title: `TaskFlow Integration: ${notification.type}`,
        body: notification.message,
        labels: ['taskflow', 'integration']
      }, {
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error sending installation notification:', error.response?.data || error.message);
      // Don't throw error for notification failures
      logger.warn('Installation notification failed, but installation was successful');
    }
  }
}

module.exports = new GitHubService();
