import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useSpaces } from '../../hooks/useSpaces';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, Badge } from '@taskflow/ui';
import SpaceTable from '../../components/workspace/main_page/SpaceTable';
import type { Workspace } from '../../types/workspace.types';

interface SpacesLayoutProps {
  currentWorkspace: Workspace;
}

const SpacesLayout: React.FC<SpacesLayoutProps> = React.memo(({ currentWorkspace }) => {
  const workspaceId = currentWorkspace?._id;
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { success, error: showError } = useToast();

  // Workspace data
  const {
    members,
    loading,
    error: apiError
  } = useWorkspace({
    autoFetch: true,
    workspaceId
  });

  // Spaces data
  const {
    loading: spacesLoading,
    error: spacesError,
    loadSpacesByWorkspace,
    addSpace,
    archiveSpaceById,
    unarchiveSpaceById,
    permanentDeleteSpaceById,
    getActiveSpacesByWorkspace,
    getArchivedSpacesByWorkspace,
    clearSpacesData,
    retryLoadSpaces
  } = useSpaces();

  // Space manager for handling space selection
  const { selectSpace } = useSpaceManager();

  // Local UI state
  const [search, setSearch] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isCreatingSpaceLoading, setIsCreatingSpaceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'list-detail'>('cards');
  const [spaceDetails, setSpaceDetails] = useState<{[key: string]: any}>({});

  // Get current user's role in this workspace from Redux state
  const currentUserRole = useMemo(() => {
    return (currentWorkspace as any)?.userRole || null;
  }, [currentWorkspace?._id, (currentWorkspace as any)?.userRole]);

  // Check if user can edit workspace (owner or admin)
  const canEditWorkspace = useMemo(() => {
    return currentUserRole === 'owner' || currentUserRole === 'admin';
  }, [currentUserRole]);

  // Get spaces based on current tab and workspace
  const currentSpaces = useMemo(() => {
    if (!workspaceId) return [];
    if (activeTab === 'active') {
      return getActiveSpacesByWorkspace(workspaceId);
    } else {
      return getArchivedSpacesByWorkspace(workspaceId);
    }
  }, [workspaceId, activeTab, getActiveSpacesByWorkspace, getArchivedSpacesByWorkspace]);

  const filteredSpaces = useMemo(() => {
    if (!currentSpaces || !Array.isArray(currentSpaces)) return [];
    return currentSpaces.filter(space =>
      space.name && space.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentSpaces, search]);

  // Handlers
  const handleCreateSpace = useCallback(async () => {
    if (!newSpaceName.trim() || !workspaceId) return;
    
    setIsCreatingSpaceLoading(true);
    try {
      await addSpace({
        name: newSpaceName.trim(),
        workspaceId: workspaceId
      });
      // Clear spaces data and reload to ensure fresh data
      clearSpacesData();
      loadSpacesByWorkspace(workspaceId);
      setNewSpaceName('');
      setIsCreatingSpace(false);
      success(`Space "${newSpaceName.trim()}" created successfully!`);
    } catch (error) {
      console.error('Failed to create space:', error);
      showError(`Failed to create space: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingSpaceLoading(false);
    }
  }, [newSpaceName, workspaceId, addSpace, loadSpacesByWorkspace, success, showError]);

  const handleCancelCreateSpace = useCallback(() => {
    setNewSpaceName('');
    setIsCreatingSpace(false);
  }, []);

  const handleArchiveSpace = useCallback(async (spaceId: string) => {
    try {
      await archiveSpaceById(spaceId);
      // Refresh spaces after archiving
      if (workspaceId) {
        loadSpacesByWorkspace(workspaceId);
      }
    } catch (error) {
      console.error('Failed to archive space:', error);
      throw error;
    }
  }, [archiveSpaceById, workspaceId, loadSpacesByWorkspace]);

  const handleUnarchiveSpace = useCallback(async (spaceId: string) => {
    try {
      await unarchiveSpaceById(spaceId);
      // Refresh spaces after unarchiving
      if (workspaceId) {
        loadSpacesByWorkspace(workspaceId);
      }
    } catch (error) {
      console.error('Failed to unarchive space:', error);
      throw error;
    }
  }, [unarchiveSpaceById, workspaceId, loadSpacesByWorkspace]);

  const handleSpaceClick = useCallback((space: any) => {
    // Set the current space in Redux state
    selectSpace(space);
    // Navigate to the space page
    navigate('/space');
  }, [selectSpace, navigate]);

  // Clear spaces data when workspace changes
  React.useEffect(() => {
    if (workspaceId) {
      // Clear any previous spaces data to prevent conflicts
      clearSpacesData();
    }
  }, [workspaceId, clearSpacesData]);

  // Load spaces when workspace changes
  React.useEffect(() => {
    if (workspaceId) {
      loadSpacesByWorkspace(workspaceId);
    }
  }, [workspaceId, loadSpacesByWorkspace]);

  // Authentication check
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Authentication Required</div>
          <p className="text-muted-foreground mb-4">Please log in to access this workspace.</p>
          <Button
            onClick={() => window.location.href = '/login'}
            variant="default"
            size="sm"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || spacesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading spaces...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError || spacesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Spaces</div>
          <p className="text-muted-foreground mb-4">{apiError || spacesError}</p>
          <Button
            onClick={() => {
              if (workspaceId) {
                if (spacesError) {
                  retryLoadSpaces(workspaceId);
                } else {
                  window.location.reload();
                }
              }
            }}
            variant="default"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-muted-foreground text-xl mb-2">No workspace selected</div>
          <p className="text-muted-foreground">Please select a workspace to continue</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-muted-foreground text-xl mb-2">No workspace found</div>
          <p className="text-muted-foreground">Workspace with ID "{workspaceId}" not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-muted/50 to-muted">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Workspace Spaces</h1>
                <p className="text-muted-foreground">Manage and organize your workspace spaces</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                      viewMode === 'cards' 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'list-detail' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list-detail')}
                    className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                      viewMode === 'list-detail' 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Detail
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentWorkspace.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Search and Create */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search spaces..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {canEditWorkspace && activeTab === 'active' && !isCreatingSpace && (
              <Button 
                onClick={() => setIsCreatingSpace(true)}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Space
              </Button>
            )}

            {isCreatingSpace && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter space name..."
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSpace();
                    if (e.key === 'Escape') handleCancelCreateSpace();
                  }}
                  disabled={isCreatingSpaceLoading}
                  className="h-8 w-48 text-sm border border-slate-200 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateSpace}
                  disabled={!newSpaceName.trim() || isCreatingSpaceLoading}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                  title="Create space"
                >
                  {isCreatingSpaceLoading ? (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelCreateSpace}
                  disabled={isCreatingSpaceLoading}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            )}
          </div>

          {/* Spaces Tabs */}
          <div className="w-full">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === 'active'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background hover:text-foreground'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Active Spaces
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                  {getActiveSpacesByWorkspace(workspaceId).length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === 'archived'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background hover:text-foreground'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3" />
                </svg>
                Archived Spaces
                <span className="ml-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {getArchivedSpacesByWorkspace(workspaceId).length}
                </span>
              </button>
            </div>

            {activeTab === 'active' && (
              <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <SpaceTable
                  filteredSpaces={filteredSpaces}
                  isLoading={spacesLoading}
                  error={spacesError}
                  onRemove={() => {}}
                  onAddSpace={() => setIsCreatingSpace(true)}
                  onArchive={handleArchiveSpace}
                  onUnarchive={handleUnarchiveSpace}
                  onPermanentDelete={permanentDeleteSpaceById}
                  showArchiveActions={canEditWorkspace}
                  onSpaceClick={handleSpaceClick}
                  viewMode={viewMode}
                />
              </div>
            )}

            {activeTab === 'archived' && (
              <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <SpaceTable
                  filteredSpaces={filteredSpaces}
                  isLoading={spacesLoading}
                  error={spacesError}
                  onRemove={() => {}}
                  onArchive={handleArchiveSpace}
                  onUnarchive={handleUnarchiveSpace}
                  onPermanentDelete={permanentDeleteSpaceById}
                  showArchiveActions={canEditWorkspace}
                  onSpaceClick={handleSpaceClick}
                  viewMode={viewMode}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SpacesLayout;
