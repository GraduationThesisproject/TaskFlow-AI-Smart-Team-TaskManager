import React, { useState, useEffect } from 'react';
import type { Workspace } from '../../types/workspace.types';

import { Github, Link, Unlink, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Separator, Alert } from '@taskflow/ui'
import { useGitHub } from '../../hooks/useGitHub';
import { useWorkspace } from '../../hooks/useWorkspace';

interface SettingsLayoutProps {
  currentWorkspace: Workspace;
  onWorkspaceUpdate?: (updatedWorkspace: Workspace) => void;
}

const WorkspaceSettingsHeader: React.FC = () => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold mb-2">Workspace Settings</h1>
    <p className="text-muted-foreground">Configure your workspace preferences and permissions</p>
  </div>
);

const GitHubIntegrationCard: React.FC<{ workspace: Workspace; onWorkspaceUpdate?: (updatedWorkspace: Workspace) => void }> = ({ workspace, onWorkspaceUpdate }) => {
  const [isLinking, setIsLinking] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  
  const {
    githubStatus,
    organizations,
    isLoading,
    error,
    checkGitHubStatus,
    fetchOrganizations,
    syncGitHubData,
    linkGitHubAccount,
    linkGitHubAccountPopup,
    unlinkGitHubAccount,
    forceReAuth,
    clearError
  } = useGitHub();

  const { updateWorkspaceData } = useWorkspace();

  // No need to track selectedOrg state since we're using individual buttons

  // Check GitHub status on component mount
  useEffect(() => {
    if (!githubStatus) {
      checkGitHubStatus();
    }
  }, [checkGitHubStatus, githubStatus]);

  // Fetch organizations if GitHub is linked but no organizations are loaded
  useEffect(() => {
    if (githubStatus?.linked && organizations.length === 0 && !isLoading) {
      fetchOrganizations();
    }
  }, [githubStatus?.linked, organizations.length, isLoading, fetchOrganizations]);

  // Listen for window focus to refresh GitHub status when popup closes
  useEffect(() => {
    const handleWindowFocus = async () => {
      // Small delay to ensure OAuth process is complete
      setTimeout(async () => {
        try {
          await checkGitHubStatus();
        } catch (error) {
          console.error('Failed to refresh GitHub status on window focus:', error);
        }
      }, 500);
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [checkGitHubStatus]);


  // Handle GitHub API responses with middleware redirects
  const handleGitHubAction = async (action: () => Promise<any> | void) => {
    try {
      setIsLinking(true);
      clearError();
      const result = await Promise.resolve(action());
      
      // Check if response indicates redirect action
      if (result?.action === 'redirect') {
        if (result.redirectUrl) {
          // Redirect to GitHub connection page
          window.location.href = result.redirectUrl;
        } else {
          // Show connect prompt for manual redirect
          setShowConnectPrompt(true);
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('GitHub action error:', error);
      
      // Handle specific error responses from middleware
      if (error.status === 403 && error.data?.action === 'redirect') {
        setShowConnectPrompt(true);
      } else if (error.status === 409 && error.data?.action === 'redirect') {
        // User already connected, refresh status
        window.location.reload();
      }
      
      clearError();
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkGitHub = async () => {
    try {
      setIsLinking(true);
      clearError();
      
      // Use popup-based OAuth for better UX
      await linkGitHubAccountPopup();
      
      // Multiple refresh attempts to ensure status is updated
      const refreshAttempts = [500, 1000, 2000];
      refreshAttempts.forEach(delay => {
        setTimeout(async () => {
          try {
            await checkGitHubStatus();
            console.log('GitHub status refreshed after OAuth');
          } catch (error) {
            console.error('Failed to refresh GitHub status:', error);
          }
        }, delay);
      });
      
    } catch (error: any) {
      console.error('GitHub OAuth error:', error);
      setError(error.message || 'Failed to connect GitHub account');
    } finally {
      setIsLinking(false);
    }
  };

  const handleSyncGitHub = () => {
    return handleGitHubAction(syncGitHubData);
  };

  const handleFetchOrganizations = async () => {
    try {
      await fetchOrganizations();
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const linkWorkspaceToOrg = async (orgLogin: string) => {
    if (!orgLogin) return;
    
    try {
      setIsLinking(true);
      clearError();
      const org = organizations.find(o => o.login === orgLogin);
      if (!org) {
        setError('Selected organization not found');
        return;
      }

      // Update workspace with GitHub organization using Redux action
      const githubOrgData = {
        id: org.id,
        login: org.login,
        name: org.name,
        url: org.url,
        avatar: org.avatar,
        description: org.description,
        isPrivate: org.isPrivate,
        linkedAt: new Date().toISOString()
      };

      await updateWorkspaceData(workspace._id, {
        githubOrg: githubOrgData
      });

      // Update local state
      setSelectedOrg(org.login);
      
      // The Redux state will be automatically updated, so we don't need to manually update currentWorkspace
      // The parent component will receive the updated workspace through Redux state
    } catch (error: any) {
      console.error('Error linking workspace to organization:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to link workspace to organization';
      setError(errorMessage);
    } finally {
      setIsLinking(false);
    }
  };

  const unlinkWorkspaceFromOrg = async () => {
    try {
      setIsLinking(true);
      clearError();

      // Unlink workspace from GitHub organization using Redux action
      await updateWorkspaceData(workspace._id, {
        githubOrg: null
      });

      // Update local state
      setSelectedOrg('');
      
      // The Redux state will be automatically updated, so we don't need to manually update currentWorkspace
      // The parent component will receive the updated workspace through Redux state
    } catch (error: any) {
      console.error('Error unlinking workspace from organization:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unlink workspace from organization';
      setError(errorMessage);
    } finally {
      setIsLinking(false);
    }
  };

  if (!githubStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>Connect your workspace to GitHub organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>Connect your workspace to GitHub organizations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="error">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              {error.includes('Insufficient GitHub permissions') || error.includes('Cannot access GitHub organizations') ? (
                <Button
                  size="sm"
                  onClick={() => {
                    clearError();
                    forceReAuth();
                  }}
                >
                  <Github className="h-4 w-4 mr-1" />
                  Re-authenticate
                </Button>
              ) : null}
            </div>
          </Alert>
        )}

        {/* GitHub Connect Prompt */}
        {showConnectPrompt && (
          <Alert variant="warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">GitHub Connection Required</p>
                <p className="text-sm">Please connect your GitHub account to continue</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setShowConnectPrompt(false);
                  handleLinkGitHub();
                }}
              >
                <Github className="h-4 w-4 mr-1" />
                Connect Now
              </Button>
            </div>
          </Alert>
        )}

        {/* GitHub Account Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {githubStatus.avatar && (
              <img src={githubStatus.avatar} alt="GitHub Avatar" className="w-8 h-8 rounded-full" />
            )}
            <div>
              <p className="font-medium">
                {githubStatus.linked ? `@${githubStatus.username}` : 'GitHub not connected'}
              </p>
              <p className="text-sm text-muted-foreground">
                {githubStatus.linked ? 'Account linked' : 'Connect your GitHub account'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {githubStatus.linked ? (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkGitHubStatus}
                  disabled={isLoading}
                  title="Refresh GitHub status"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unlinkGitHubAccount}
                  disabled={isLoading}
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Unlink
                </Button>
              </>
            ) : (
              <Button onClick={handleLinkGitHub} disabled={isLoading}>
                <Github className="h-4 w-4 mr-1" />
                Connect GitHub
              </Button>
            )}
          </div>
        </div>

        {/* GitHub Organization Linking */}
        {githubStatus.linked && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Link to GitHub Organization</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchOrganizations}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Load Organizations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncGitHub}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync All
                  </Button>
                </div>
              </div>

              {/* Show linked organization if exists */}
              {workspace.githubOrg && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {workspace.githubOrg.avatar && (
                      <img src={workspace.githubOrg.avatar} alt="Org Avatar" className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium">{workspace.githubOrg.name || workspace.githubOrg.login}</p>
                      <p className="text-sm text-muted-foreground">
                        Linked to {workspace.githubOrg.login}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(workspace.githubOrg?.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={unlinkWorkspaceFromOrg}
                      disabled={isLinking}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  </div>
                </div>
              )}

              {/* Always show organizations list */}
              {!workspace.githubOrg && (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading organizations...</p>
                    </div>
                  ) : organizations.length > 0 ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-3">
                        Choose a GitHub organization to link with this workspace:
                      </div>
                      <div className="space-y-2">
                        {organizations.map((org) => {
                          const isLinked = workspace.githubOrg && workspace.githubOrg.login === org.login;
                          return (
                            <div
                              key={org.id}
                              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                isLinked 
                                  ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                            <div className="flex items-center gap-3">
                              {org.avatar && (
                                <img 
                                  src={org.avatar} 
                                  alt={`${org.name || org.login} avatar`} 
                                  className="w-8 h-8 rounded-full" 
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">
                                    {org.name || org.login}
                                  </p>
                                  {isLinked && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Linked
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  @{org.login}
                                  {org.isPrivate && ' • Private'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => linkWorkspaceToOrg(org.login)}
                                disabled={isLinking || (workspace.githubOrg && workspace.githubOrg.login !== org.login)}
                                className="min-w-[80px]"
                              >
                                <Link className="h-4 w-4 mr-1" />
                                {workspace.githubOrg && workspace.githubOrg.login === org.login ? 'Linked' : 'Link'}
                              </Button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No organizations found</p>
                      <p className="text-sm">Make sure your GitHub account has access to organizations</p>
                      <p className="text-xs mt-1">If you just connected GitHub, try refreshing the list</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncGitHub}
                        disabled={isLoading}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh Organizations
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Missing Scopes Warning */}
        {githubStatus.linked && !githubStatus.hasRequiredScopes && (
          <Alert variant="warning">
            <div>
              Your GitHub account is missing required permissions. Please{' '}
              <button
                onClick={handleLinkGitHub}
                className="underline font-medium hover:no-underline"
              >
                re-authenticate
              </button>{' '}
              to grant access to organizations and repositories.
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const WorkspaceSettingsContent: React.FC<{ workspace: Workspace; onWorkspaceUpdate?: (updatedWorkspace: Workspace) => void }> = ({ workspace, onWorkspaceUpdate }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Workspace name, description, and visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure basic workspace settings</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>Invite, remove, and manage team members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage workspace membership</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Role-based access control settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure access permissions</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect with external tools and services</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage external integrations</p>
        </CardContent>
      </Card>
    </div>

    {/* GitHub Integration Card - Full Width */}
    <GitHubIntegrationCard workspace={workspace} onWorkspaceUpdate={onWorkspaceUpdate} />
  </div>
);

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ currentWorkspace, onWorkspaceUpdate }) => {
  return (
    <div className="p-6">
      <WorkspaceSettingsHeader />
      <WorkspaceSettingsContent workspace={currentWorkspace} onWorkspaceUpdate={onWorkspaceUpdate} />
    </div>
  );
};

export default SettingsLayout;