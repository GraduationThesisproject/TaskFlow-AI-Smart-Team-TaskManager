import { useState, useEffect, useCallback } from 'react';
import { env } from '../config/env';
import { GitHubService } from '../services/githubService';
import type {
  GitHubOrg,
  GitHubRepo,
  GitHubBranch,
  GitHubStatus,
  UseGitHubReturn,
  GitHubError
} from '../types/github.types';

export const useGitHub = (): UseGitHubReturn => {
  const [githubStatus, setGitHubStatus] = useState<GitHubStatus | null>(null);
  const [organizations, setOrganizations] = useState<GitHubOrg[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
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
        // Handle specific error cases
        if (response.error?.reason === 'insufficient_scopes') {
          setError(`Insufficient GitHub permissions: ${response.error.missingScopes?.join(', ')}. Please re-authenticate to grant access.`);
        } else if (response.error?.reason === 'org_access_denied') {
          setError('Cannot access GitHub organizations. Please re-authenticate to grant required permissions.');
        } else {
          setError(response.message || 'Failed to fetch organizations');
        }
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch organizations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch repositories for an organization
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
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch repositories');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Fetch branches for a repository
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
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      const githubError = error as GitHubError;
      setError(githubError.message || 'Failed to fetch branches');
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
        // Refresh status after sync
        await checkGitHubStatus();
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
  }, [clearError, checkGitHubStatus]);

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
        
        // Redirect to GitHub authentication
        linkGitHubAccount();
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
  }, [clearError, linkGitHubAccount]);

  // Initialize GitHub status on mount
  useEffect(() => {
    checkGitHubStatus();
  }, [checkGitHubStatus]);

  // Fetch organizations when GitHub is linked
  useEffect(() => {
    if (githubStatus?.linked) {
      fetchOrganizations();
    }
  }, [githubStatus?.linked, fetchOrganizations]);

  return {
    // State
    githubStatus,
    organizations,
    repositories,
    branches,
    isLoading,
    error,
    
    // Actions
    checkGitHubStatus,
    fetchOrganizations,
    fetchRepositories,
    fetchBranches,
    syncGitHubData,
    linkGitHubAccount,
    unlinkGitHubAccount,
    forceReAuth,
    
    // Utilities
    clearError
  };
};