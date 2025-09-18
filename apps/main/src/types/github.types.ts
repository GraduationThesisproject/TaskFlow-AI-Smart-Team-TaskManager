// GitHub Integration Types

export interface GitHubOrg {
  id: number;
  login: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  isPrivate: boolean;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  htmlUrl: string;
  cloneUrl: string;
  isPrivate: boolean;
  isFork: boolean;
  language: string;
  defaultBranch: string;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protection: {
    enabled: boolean;
    requiredStatusChecks: boolean;
    enforceAdmins: boolean;
  };
}

export interface GitHubMember {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar: string;
  url: string;
  htmlUrl: string;
  type: 'User' | 'Bot';
  siteAdmin: boolean;
  userId?: string; // Added for app user mapping
  isAppUser?: boolean; // Added to indicate if user is in our app
}

export interface GitHubStatus {
  linked: boolean;
  username?: string;
  avatar?: string;
  lastSync?: string;
  tokenValid?: boolean;
  hasRequiredScopes?: boolean;
  missingScopes?: string[];
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  company?: string;
  location?: string;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
}

export interface GitHubSyncResult {
  success: boolean;
  message: string;
  data?: {
    organizations?: GitHubOrg[];
    repositories?: GitHubRepo[];
    user?: GitHubUser;
  };
}

export interface GitHubError {
  message: string;
  status?: number;
  reason?: 'insufficient_scopes' | 'org_access_denied' | 'token_invalid' | 'network_error';
  missingScopes?: string[];
  action?: 'redirect' | 're_auth';
}

// API Response types
export interface GitHubApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: GitHubError;
}

// Hook return types
export interface UseGitHubReturn {
  // State
  githubStatus: GitHubStatus | null;
  organizations: GitHubOrg[];
  repositories: GitHubRepo[];
  branches: GitHubBranch[];
  members: GitHubMember[];
  isLoading: boolean;
  error: string;
  
  // Actions
  checkGitHubStatus: () => Promise<GitHubStatus | null>;
  fetchOrganizations: () => Promise<GitHubOrg[]>;
  fetchRepositories: (orgLogin: string) => Promise<GitHubRepo[]>;
  fetchBranches: (orgLogin: string, repoName: string) => Promise<GitHubBranch[]>;
  fetchMembers: (orgLogin: string) => Promise<GitHubMember[]>;
  fetchMembersWithEmails: (orgLogin: string) => Promise<GitHubMember[]>;
  syncGitHubData: () => Promise<boolean>;
  linkGitHubAccount: () => void;
  linkGitHubAccountPopup: () => Promise<boolean>;
  unlinkGitHubAccount: () => Promise<boolean>;
  forceReAuth: () => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
}