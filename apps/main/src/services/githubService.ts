/*🔗 GitHubService.ts - GitHub Integration Service*/

import axiosInstance from '../config/axios';
import type {
  GitHubOrg,
  GitHubRepo,
  GitHubBranch,
  GitHubMember,
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

  // Fetch members of a specific organization
  static async getOrganizationMembers(orgLogin: string): Promise<GitHubApiResponse<GitHubMember[]>> {
    try {
      const response = await axiosInstance.get(`/github/orgs/${orgLogin}/members`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching GitHub organization members:', error);
      throw this.handleError(error);
    }
  }

  // Fetch organization members with email mapping
  static async getOrganizationMembersWithEmails(orgLogin: string): Promise<GitHubApiResponse<GitHubMember[]>> {
    try {
      const response = await axiosInstance.get(`/github/orgs/${orgLogin}/members-with-emails`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching GitHub organization members with emails:', error);
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

  // Generate popup-based OAuth URL with popup callback
  static generatePopupOAuthUrl(config: {
    clientId: string;
    scope?: string;
    state?: string;
  }): string {
    const { clientId, scope = 'user:email read:org repo', state } = config;
    
    // Use the existing GitHub callback URL but with popup state
    const redirectUri = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/github/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: 'popup-oauth' // Add popup state to distinguish from regular OAuth
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Handle API errors and convert to standardized format
  private static handleError(error: any): GitHubError {
    const githubError: GitHubError = {
      message: 'An unexpected error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR'
    };

    if (error.response) {
      // Server responded with error status
      githubError.status = error.response.status;
      githubError.message = error.response.data?.message || error.response.statusText || 'Server error';
      githubError.code = error.response.data?.code || 'SERVER_ERROR';
    } else if (error.request) {
      // Request was made but no response received
      githubError.message = 'Network error - please check your connection';
      githubError.code = 'NETWORK_ERROR';
    } else {
      // Something else happened
      githubError.message = error.message || 'Unknown error occurred';
      githubError.code = 'CLIENT_ERROR';
    }

    return githubError;
  }
}