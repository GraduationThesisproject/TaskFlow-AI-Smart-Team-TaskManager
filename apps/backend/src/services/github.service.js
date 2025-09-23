const axios = require('axios');
const logger = require('../config/logger');
const env = require('../config/env');
const User = require('../models/User');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.clientId = env.GITHUB_CLIENT_ID;
    this.clientSecret = env.GITHUB_CLIENT_SECRET;
  }

  // Get organizations for the authenticated user
  async getOrganizations(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user/orgs`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        },
        params: {
          per_page: 100
        }
      });

      return response.data.map(org => ({
        id: org.id,
        login: org.login,
        name: org.name || org.login,
        description: org.description,
        url: org.url,
        htmlUrl: org.html_url,
        avatar: org.avatar_url,
        type: org.type,
        siteAdmin: org.site_admin
      }));
    } catch (error) {
      logger.error('Error fetching GitHub organizations:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub organizations: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get repositories for a specific organization
  async getRepositories(accessToken, orgLogin) {
    try {
      const response = await axios.get(`${this.baseURL}/orgs/${orgLogin}/repos`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        },
        params: {
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
      logger.error('Error fetching GitHub repository branches:', error.response?.data || error.message);
      throw new Error(`Failed to fetch repository branches: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get members of a specific organization
  async getOrganizationMembers(accessToken, orgLogin) {
    try {
      const membersResponse = await axios.get(`${this.baseURL}/orgs/${orgLogin}/members`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        },
        params: {
          per_page: 100
        }
      });

      // GitHub API doesn't provide email addresses for organization members due to privacy
      // Return basic member information without trying to fetch emails
      const members = membersResponse.data.map(member => ({
        id: member.id,
        login: member.login,
        name: member.login, // Use login as name since we can't get real name without additional API calls
        email: null, // GitHub doesn't provide emails for org members due to privacy
        avatar: member.avatar_url,
        url: member.url,
        htmlUrl: member.html_url,
        type: member.type,
        siteAdmin: member.site_admin
      }));

      logger.info(`Fetched ${members.length} GitHub organization members (emails not available due to privacy settings)`);
      
      return members;
    } catch (error) {
      logger.error('Error fetching GitHub organization members:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub organization members: ${error.response?.data?.message || error.message}`);
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

  // Get GitHub user emails (private emails if user:email scope is granted)
  async getUserEmails(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user/emails`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });

      return response.data.map(email => ({
        email: email.email,
        primary: email.primary,
        verified: email.verified,
        visibility: email.visibility
      }));
    } catch (error) {
      logger.error('Error fetching GitHub user emails:', error.response?.data || error.message);
      throw new Error(`Failed to fetch GitHub user emails: ${error.response?.data?.message || error.message}`);
    }
  }

  // Map GitHub usernames to emails for organization members
  async mapOrgMembersToEmails(accessToken, orgLogin) {
    try {
      // Get organization members (usernames only)
      const members = await this.getOrganizationMembers(accessToken, orgLogin);
      
      // Get all users in your database who have GitHub OAuth
      const users = await User.find({ 
        'github.accessToken': { $exists: true },
        'github.username': { $in: members.map(m => m.login) }
      }).select('github.username github.email email name _id');

      // Create mapping
      const usernameToEmailMap = {};
      users.forEach(user => {
        if (user.github?.username) {
          usernameToEmailMap[user.github.username] = {
            email: user.github.email || user.email,
            name: user.name,
            userId: user._id
          };
        }
      });

      // Enhance members with email data
      const enhancedMembers = members.map(member => ({
        ...member,
        email: usernameToEmailMap[member.login]?.email || null,
        name: usernameToEmailMap[member.login]?.name || member.login,
        userId: usernameToEmailMap[member.login]?.userId || null,
        isAppUser: !!usernameToEmailMap[member.login]
      }));

      logger.info(`Mapped ${enhancedMembers.filter(m => m.isAppUser).length} of ${enhancedMembers.length} org members to app users`);
      
      return enhancedMembers;
    } catch (error) {
      logger.error('Error mapping org members to emails:', error);
      throw new Error(`Failed to map organization members to emails: ${error.message}`);
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
          message: 'GitHub token lacks required scopes',
          missingScopes: scopeCheck.missingScopes
        };
      }

      // Check if user has organizations
      const orgs = await this.getOrganizations(accessToken);
      if (orgs.length === 0) {
        return {
          isValid: false,
          reason: 'no_organizations',
          message: 'User is not a member of any GitHub organizations'
        };
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
}

module.exports = new GitHubService();