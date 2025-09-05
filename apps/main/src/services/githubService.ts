/*🔗 GitHubService.ts - GitHub Integration Service*/

import axiosInstance from '../config/axios';
import type {
  GitHubOrg,
  GitHubRepo,
  GitHubBranch,
  GitHubStatus,
  GitHubSyncResult,
  GitHubApiResponse,
  GitHubError
} from '../types/github.types';

export class GitHubService {
  
  // Get GitHub account status
  static async getStatus(): Promise<GitHubApiResponse<GitHubStatus>> {
    try {
      const response = await axiosInstance.get('/github/status');
      return response.data;
    } catch (error: any) {
      console.error('Error checking GitHub status:', error);
      throw this.handleError(error);
    }
  }

  // Fetch user's GitHub organizations
  static async getOrganizations(): Promise<GitHubApiResponse<GitHubOrg[]>> {
    try {
      const response = await axiosInstance.get('/github/orgs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching GitHub organizations:', error);
      throw this.handleError(error);
    }
  }

  // Fetch repositories for a specific organization
  static async getOrganizationRepositories(orgLogin: string): Promise<GitHubApiResponse<GitHubRepo[]>> {
    try {
      const response = await axiosInstance.get(`/github/orgs/${orgLogin}/repos`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching GitHub repositories:', error);
      throw this.handleError(error);
    }
  }

  // Fetch branches for a specific repository
  static async getRepositoryBranches(orgLogin: string, repoName: string): Promise<GitHubApiResponse<GitHubBranch[]>> {
    try {
      const response = await axiosInstance.get(`/github/repos/${orgLogin}/${repoName}/branches`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching GitHub branches:', error);
      throw this.handleError(error);
    }
  }

  // Sync GitHub data
  static async syncData(): Promise<GitHubApiResponse<GitHubSyncResult>> {
    try {
      const response = await axiosInstance.post('/github/sync');
      return response.data;
    } catch (error: any) {
      console.error('Error syncing GitHub data:', error);
      throw this.handleError(error);
    }
  }

  // Unlink GitHub account
  static async unlinkAccount(): Promise<GitHubApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.delete('/github/unlink');
      return response.data;
    } catch (error: any) {
      console.error('Error unlinking GitHub account:', error);
      throw this.handleError(error);
    }
  }

  // Force re-authentication
  static async forceReAuth(): Promise<GitHubApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/github/force-reauth');
      return response.data;
    } catch (error: any) {
      console.error('Error forcing GitHub re-authentication:', error);
      throw this.handleError(error);
    }
  }

  // Generate GitHub OAuth URL
  static generateOAuthUrl(config: {
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
  }): string {
    const { clientId, redirectUri, scope = 'user:email read:org repo', state } = config;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope
    });

    if (state) {
      params.append('state', state);
    }

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Handle API errors and convert to standardized format
  private static handleError(error: any): GitHubError {
    if (error.response?.data) {
      const { data } = error.response;
      
      // Check for scope-related errors
      if (data.message?.includes('read:org scope') || data.message?.includes('insufficient')) {
        return {
          message: data.message || 'Insufficient GitHub permissions',
          status: error.response.status,
          reason: 'insufficient_scopes',
          missingScopes: data.data?.missingScopes || ['read:org', 'repo'],
          action: 're_auth'
        };
      }

      // Check for organization access errors
      if (data.message?.includes('Cannot access') || data.message?.includes('access denied')) {
        return {
          message: data.message || 'Cannot access GitHub organizations',
          status: error.response.status,
          reason: 'org_access_denied',
          action: 're_auth'
        };
      }

      // Check for token errors
      if (data.message?.includes('token') || data.message?.includes('unauthorized')) {
        return {
          message: data.message || 'Invalid GitHub token',
          status: error.response.status,
          reason: 'token_invalid',
          action: 're_auth'
        };
      }

      return {
        message: data.message || 'GitHub API error',
        status: error.response.status,
        reason: 'network_error'
      };
    }

    // Network or other errors
    return {
      message: error.message || 'Network error',
      reason: 'network_error'
    };
  }

  // Validate GitHub integration
  static async validateIntegration(): Promise<{
    isValid: boolean;
    reason?: string;
    missingScopes?: string[];
  }> {
    try {
      const statusResponse = await this.getStatus();
      
      if (!statusResponse.success || !statusResponse.data?.linked) {
        return { isValid: false, reason: 'not_linked' };
      }

      if (!statusResponse.data.hasRequiredScopes) {
        return {
          isValid: false,
          reason: 'insufficient_scopes',
          missingScopes: statusResponse.data.missingScopes
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating GitHub integration:', error);
      return { isValid: false, reason: 'validation_failed' };
    }
  }
}
