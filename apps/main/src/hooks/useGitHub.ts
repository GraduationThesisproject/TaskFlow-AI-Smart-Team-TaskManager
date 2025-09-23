import { useState, useEffect, useCallback } from 'react';
import { env } from '../config/env';
import { GitHubService } from '../services/githubService';
import type {
  GitHubOrg,
  GitHubRepo,
  GitHubBranch,
  GitHubMember,
  GitHubStatus,
  UseGitHubReturn,
  GitHubError
} from '../types/github.types';

export const useGitHub = (): UseGitHubReturn => {
  const [githubStatus, setGitHubStatus] = useState<GitHubStatus | null>(null);
  const [organizations, setOrganizations] = useState<GitHubOrg[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [members, setMembers] = useState<GitHubMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Clear error state
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Check GitHub account status
  const checkGitHubStatus = useCallback(async (): Promise<GitHubStatus | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getStatus();
      
      if (response.success && response.data) {
        setGitHubStatus(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to check GitHub status');
        return null;
      }
    } catch (error: any) {
      console.error('Error checking GitHub status:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to check GitHub status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch GitHub organizations
  const fetchOrganizations = useCallback(async (): Promise<GitHubOrg[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getOrganizations();
      
      if (response.success && response.data) {
        setOrganizations(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch organizations');
        setOrganizations([]);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching GitHub organizations:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch organizations');
      setOrganizations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch repositories for a specific organization
  const fetchRepositories = useCallback(async (orgLogin: string): Promise<GitHubRepo[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getOrganizationRepositories(orgLogin);
      
      if (response.success && response.data) {
        setRepositories(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch repositories');
        setRepositories([]);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching GitHub repositories:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch repositories');
      setRepositories([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch branches for a specific repository
  const fetchBranches = useCallback(async (orgLogin: string, repoName: string): Promise<GitHubBranch[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getRepositoryBranches(orgLogin, repoName);
      
      if (response.success && response.data) {
        setBranches(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch branches');
        setBranches([]);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching GitHub branches:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch branches');
      setBranches([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch members of a specific organization
  const fetchMembers = useCallback(async (orgLogin: string): Promise<GitHubMember[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getOrganizationMembers(orgLogin);
      
      if (response.success && response.data) {
        // Handle nested structure: { organization: org, members: [...] }
        const membersData = response.data.members || response.data;
        const membersArray = Array.isArray(membersData) ? membersData : [];
        setMembers(membersArray);
        return membersArray;
      } else {
        setError(response.message || 'Failed to fetch organization members');
        setMembers([]);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching GitHub organization members:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch organization members');
      setMembers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch organization members with email mapping
  const fetchMembersWithEmails = useCallback(async (orgLogin: string): Promise<GitHubMember[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.getOrganizationMembersWithEmails(orgLogin);
      
      if (response.success && response.data) {
        // Handle nested structure: { organization: org, members: [...] }
        const membersData = response.data.members || response.data;
        const membersArray = Array.isArray(membersData) ? membersData : [];
        setMembers(membersArray);
        return membersArray;
      } else {
        setError(response.message || 'Failed to fetch organization members with emails');
        setMembers([]);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching GitHub organization members with emails:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch organization members with emails');
      setMembers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Sync GitHub data
  const syncGitHubData = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.syncData();
      
      if (response.success) {
        // Refresh all data after sync
        await Promise.all([
          checkGitHubStatus(),
          fetchOrganizations()
        ]);
        return true;
      } else {
        setError(response.message || 'Failed to sync GitHub data');
        return false;
      }
    } catch (error: any) {
      console.error('Error syncing GitHub data:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to sync GitHub data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkGitHubStatus, fetchOrganizations, clearError]);

  // Unlink GitHub account
  const unlinkGitHubAccount = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.unlinkAccount();
      
      if (response.success) {
        // Clear all GitHub data
        setGitHubStatus({ linked: false });
        setOrganizations([]);
        setRepositories([]);
        setBranches([]);
        setMembers([]);
        return true;
      } else {
        setError(response.message || 'Failed to unlink GitHub account');
        return false;
      }
    } catch (error: any) {
      console.error('Error unlinking GitHub account:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to unlink GitHub account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Link GitHub account (redirects to OAuth)
  const linkGitHubAccount = useCallback((): void => {
    const oauthUrl = GitHubService.generateOAuthUrl({
      clientId: env.GITHUB_CLIENT_ID,
      redirectUri: env.GITHUB_CALLBACK_URL,
      scope: 'user:email read:org repo'
    });
    
    window.location.href = oauthUrl;
  }, []);

  // Link GitHub account via popup (for settings page)
  const linkGitHubAccountPopup = useCallback((): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const oauthUrl = GitHubService.generatePopupOAuthUrl({
        clientId: env.GITHUB_CLIENT_ID,
        scope: 'user:email read:org repo',
        state: 'popup-oauth'
      });
      
      // Open popup window
      const popup = window.open(
        oauthUrl,
        'github-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Listen for popup messages
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_OAUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          // Refresh GitHub status after successful OAuth
          try {
            await checkGitHubStatus();
          } catch (error) {
            console.error('Failed to refresh GitHub status after OAuth:', error);
          }
          
          resolve(true);
        } else if (event.data.type === 'GITHUB_OAUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'OAuth failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('OAuth cancelled by user'));
        }
      }, 1000);
    });
  }, [checkGitHubStatus]);

  // Force re-authentication
  const forceReAuth = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await GitHubService.forceReAuth();
      
      if (response.success) {
        // Clear current GitHub status and redirect to re-authentication
        setGitHubStatus({ linked: false });
        setOrganizations([]);
        setRepositories([]);
        setBranches([]);
        setMembers([]);
        return true;
      } else {
        setError(response.message || 'Failed to force re-authentication');
        return false;
      }
    } catch (error: any) {
      console.error('Error forcing GitHub re-authentication:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to force re-authentication');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Auto-check GitHub status on mount
  useEffect(() => {
    checkGitHubStatus();
  }, [checkGitHubStatus]);

  return {
    // State
    githubStatus,
    organizations,
    repositories,
    branches,
    members,
    isLoading,
    error,

    // Actions
    checkGitHubStatus,
    fetchOrganizations,
    fetchRepositories,
    fetchBranches,
    fetchMembers,
    fetchMembersWithEmails,
    syncGitHubData,
    linkGitHubAccount,
    linkGitHubAccountPopup,
    unlinkGitHubAccount,
    forceReAuth,

    // Utilities
    clearError
  };
};