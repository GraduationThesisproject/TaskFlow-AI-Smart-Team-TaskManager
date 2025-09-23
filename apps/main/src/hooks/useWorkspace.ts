import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchWorkspaces,
  fetchWorkspace, 
  fetchWorkspacesGlobal,
  inviteMember,
  generateInviteLink,
  createWorkspace,
  deleteWorkspace,
  permanentDeleteWorkspace,
  restoreWorkspace,
  updateWorkspaceSettings,
  uploadWorkspaceAvatar,
  removeWorkspaceAvatar,
  forceOwnerDev,
  setCurrentWorkspaceId,
  clearError,
  fetchWorkspaceMembers,
  updateWorkspace
} from '../store/slices/workspaceSlice';

import type { 
  Workspace, 
  CreateWorkspaceData, 
  UpdateWorkspaceData, 
  WorkspaceMember,
  WorkspaceRole 
} from '../types/workspace.types';

interface UseWorkspaceParams {
  workspaceId?: string;
  autoFetch?: boolean;
  global?: boolean;
  public?: boolean;
  includeArchived?: boolean;
}

interface UseWorkspaceReturn {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  members: WorkspaceMember[];
  loading: boolean;
  error: string | null;
  
  // Computed values
  activeWorkspaces: Workspace[];
  archivedWorkspaces: Workspace[];
  publicWorkspaces: Workspace[];
  privateWorkspaces: Workspace[];
  sortedWorkspaces: Workspace[];
  workspaceCount: number;
  
  // Actions
  // Workspace management
  loadWorkspace: (id: string) => void;
  loadWorkspaces: () => void;
  loadGlobalWorkspaces: () => void;
  loadWorkspaceMembers: (id: string) => void;
  setWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceId: (id: string | null) => void;
  
  // CRUD operations
  createNewWorkspace: (workspaceData: CreateWorkspaceData) => Promise<void>;
  updateWorkspaceData: (id: string, data: UpdateWorkspaceData) => Promise<void>;
  deleteWorkspaceById: (id: string) => Promise<void>;
  permanentDeleteWorkspaceById: (id: string) => Promise<void>;
  restoreWorkspaceById: (id: string) => Promise<void>;
  
  // Member management
  inviteNewMember: (email: string, role: WorkspaceRole) => Promise<{ success: boolean; error?: unknown }>;
  removeWorkspaceMember: (memberId: string) => Promise<void>;
  getWorkspaceMembers: (id: string) => Promise<void>;
  
  // Invite link management
  createInviteLink: () => Promise<{ link?: string; enabled: boolean }>;
  disableInviteLink: () => Promise<void>;
  
  // Settings and configuration
  updateSettings: (section: string, updates: any) => Promise<void>;
  
  // Avatar management
  uploadWorkspaceAvatar: (id: string, file: File) => Promise<void>;
  removeWorkspaceAvatar: (id: string) => Promise<void>;
  
  // Utility functions
  refetchWorkspaces: () => void;
  clearWorkspaceError: () => void;
  clearWorkspaceData: () => void;
  
  // Dev functions
  forceOwner: (id: string) => Promise<void>;
  
  // Navigation helpers
  navigateToWorkspace: (id: string) => void;
  
  // Search and filtering
  searchWorkspaces: (query: string) => Workspace[];
  filterWorkspacesByStatus: (status: 'active' | 'archived' | 'all') => Workspace[];
  filterWorkspacesByVisibility: (visibility: 'public' | 'private') => Workspace[];
  
  // Permission helpers
  canEditWorkspace: (workspace: Workspace) => boolean;
  canDeleteWorkspace: (workspace: Workspace) => boolean;
  canInviteMembers: (workspace: Workspace) => boolean;
  getUserRole: (workspace: Workspace) => WorkspaceRole | null;
}

export const useWorkspace = (params?: UseWorkspaceParams | string): UseWorkspaceReturn => {
  const dispatch = useAppDispatch();
  
  // Handle both old string parameter and new object parameter for backward compatibility
  const { workspaceId, autoFetch = true, global = false, includeArchived = true } = useMemo(() => {
    if (typeof params === 'string') {
      return { workspaceId: params, autoFetch: true, global: false, includeArchived: true };
    }
    return params || { autoFetch: true, global: false, includeArchived: true };
  }, [params]);

  // Track if fetch has been initiated to prevent multiple simultaneous fetches
  const fetchInitiated = useRef(false);
  
  const {
    workspaces,
    currentWorkspace,
    members,
    loading,
    isLoading,
    error
  } = useAppSelector(state => state.workspace);

  // Local state for additional functionality
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Computed values
  const activeWorkspaces = useMemo(() => 
    workspaces.filter(w => w.status === 'active' || w.isActive !== false), 
    [workspaces]
  );
  
  const archivedWorkspaces = useMemo(() => 
    workspaces.filter(w => w.status === 'archived' || w.isActive === false), 
    [workspaces]
  );
  
  const publicWorkspaces = useMemo(() => 
    workspaces.filter(w => w.isPublic === true), 
    [workspaces]
  );
  
  const privateWorkspaces = useMemo(() => 
    workspaces.filter(w => w.isPublic !== true), 
    [workspaces]
  );
  
  const sortedWorkspaces = useMemo(() => 
    [...workspaces].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    ), 
    [workspaces]
  );

  // Filter sorted workspaces based on includeArchived parameter
  const filteredSortedWorkspaces = useMemo(() => {
    if (includeArchived) {
      return sortedWorkspaces;
    }
    return sortedWorkspaces.filter(w => w.status !== 'archived' && w.isActive !== false);
  }, [sortedWorkspaces, includeArchived]);
  
  const workspaceCount = useMemo(() => workspaces.length, [workspaces]);

  // Compute members from currentWorkspace data instead of separate state
  const computedMembers = useMemo(() => {
    return currentWorkspace?.members || [];
  }, [currentWorkspace?.members]);

  // Core actions
  const loadWorkspace = useCallback((id: string) => {
    dispatch(fetchWorkspace(id) as any);
  }, [dispatch]);

  const loadWorkspaces = useCallback(() => {
    dispatch(fetchWorkspaces() as any);
  }, [dispatch]);

  const loadGlobalWorkspaces = useCallback(() => {
    dispatch(fetchWorkspacesGlobal() as any);
  }, [dispatch]);



  const loadWorkspaceMembers = useCallback((id: string) => {
    dispatch(fetchWorkspaceMembers(id) as any);
  }, [dispatch]);

  const setWorkspace = useCallback((workspace: Workspace | null) => {
    if (workspace) {
      dispatch(setCurrentWorkspaceId(workspace._id));
    } else {
      dispatch(setCurrentWorkspaceId(null));
    }
  }, [dispatch]);

  const setWorkspaceId = useCallback((id: string | null) => {
    dispatch(setCurrentWorkspaceId(id));
  }, [dispatch]);



  // CRUD operations
  const createNewWorkspace = useCallback(async (workspaceData: CreateWorkspaceData) => {
    try {
      // Ensure visibility is provided if not in workspaceData
      const data = {
        ...workspaceData,
        visibility: workspaceData.visibility || 'private'
      };
      await dispatch(createWorkspace(data) as any).unwrap();
      loadWorkspaces(); // Refetch after creation
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }, [dispatch, loadWorkspaces]);

  const updateWorkspaceData = useCallback(async (id: string, data: UpdateWorkspaceData) => {
    try {
      // For basic workspace updates (name, description, githubOrg), use updateWorkspace thunk
      // For settings updates, use updateWorkspaceSettings thunk
      if (data.name !== undefined || data.description !== undefined || data.githubOrg !== undefined) {
        // Send name, description, and githubOrg at root level, not in settings
        const updateData = {
          name: data.name,
          description: data.description,
          githubOrg: data.githubOrg
        };
        await dispatch(updateWorkspace({ id, data: updateData }) as any).unwrap();
      } else if (data.settings) {
        // If only settings are being updated, use the settings thunk
        await dispatch(updateWorkspaceSettings({ id, section: 'general', updates: data.settings }) as any).unwrap();
      }
      
      // The Redux slice will automatically update currentWorkspace and workspaces list
      // No need to manually refresh - the state is already updated
    } catch (error) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteWorkspaceById = useCallback(async (id: string) => {
    try {
      await dispatch(deleteWorkspace({ id }) as any).unwrap();
      loadWorkspaces(); // Refresh list
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }, [dispatch, loadWorkspaces]);

  const permanentDeleteWorkspaceById = useCallback(async (id: string) => {
    try {
      await dispatch(permanentDeleteWorkspace({ id }) as any).unwrap();
      loadWorkspaces(); // Refresh list
    } catch (error) {
      console.error('Failed to permanently delete workspace:', error);
      throw error;
    }
  }, [dispatch, loadWorkspaces]);

  const restoreWorkspaceById = useCallback(async (id: string) => {
    try {
      await dispatch(restoreWorkspace({ id }) as any).unwrap();
      loadWorkspaces(); // Refresh list
    } catch (error) {
      console.error('Failed to restore workspace:', error);
      throw error;
    }
  }, [dispatch, loadWorkspaces]);

  // Avatar management
  const uploadWorkspaceAvatarHandler = useCallback(async (id: string, file: File) => {
    try {
      await dispatch(uploadWorkspaceAvatar({ id, file }) as any).unwrap();
      // The Redux slice will automatically update currentWorkspace and workspaces list
    } catch (error) {
      console.error('Failed to upload workspace avatar:', error);
      throw error;
    }
  }, [dispatch]);

  const removeWorkspaceAvatarHandler = useCallback(async (id: string) => {
    try {
      await dispatch(removeWorkspaceAvatar({ id }) as any).unwrap();
      // The Redux slice will automatically update currentWorkspace and workspaces list
    } catch (error) {
      console.error('Failed to remove workspace avatar:', error);
      throw error;
    }
  }, [dispatch]);

  // Member management
  const inviteNewMember = useCallback(async (email: string, role: WorkspaceRole): Promise<{ success: boolean; error?: unknown }> => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      // Filter out 'owner' role as it's not allowed for invites
      const validRole = role === 'owner' ? 'admin' : role;
      await dispatch(inviteMember({ id: workspaceId, email, role: validRole }) as any).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to invite member:', error);
      // Don't re-throw the error - let the component handle it
      // This prevents the error from propagating up and causing page errors
      return { success: false, error };
    }
  }, [dispatch, workspaceId]);

  const removeWorkspaceMember = useCallback(async (memberId: string) => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      // This would need to be implemented in the service/slice
      console.warn('removeWorkspaceMember not yet implemented');
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }, [workspaceId]);

  const getWorkspaceMembers = useCallback(async (id: string) => {
    try {
      // This would need to be implemented in the service/slice
      console.warn('getWorkspaceMembers not yet implemented');
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Failed to get workspace members:', error);
      throw error;
    }
  }, []);

  // Invite link management
  const createInviteLink = useCallback(async (): Promise<{ link?: string; enabled: boolean }> => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      const result = await dispatch(generateInviteLink({ id: workspaceId }) as any).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  const disableInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      // This would need to be implemented in the service/slice
      console.warn('disableInviteLink not yet implemented');
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Failed to disable invite link:', error);
      throw error;
    }
  }, [workspaceId]);

  // Settings and configuration
  const updateSettings = useCallback(async (section: string, updates: any) => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      await dispatch(updateWorkspaceSettings({ id: workspaceId, section, updates }) as any).unwrap();
      if (currentWorkspace?._id === workspaceId) {
        loadWorkspace(workspaceId); // Refresh current workspace
      }
    } catch (error) {
      console.error('Failed to update workspace settings:', error);
      throw error;
    }
  }, [dispatch, workspaceId, currentWorkspace?._id, loadWorkspace]);

  // Utility functions
  const refetchWorkspaces = useCallback(() => {
    if (global) {
      loadGlobalWorkspaces();
    } else {
      loadWorkspaces();
    }
  }, [global, loadGlobalWorkspaces, loadWorkspaces]);

  const clearWorkspaceError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearWorkspaceData = useCallback(() => {
    dispatch(clearWorkspaceData() as any);
  }, [dispatch]);

  // Dev functions
  const forceOwner = useCallback(async (id: string) => {
    try {
      await dispatch(forceOwnerDev({ id }) as any).unwrap();
      loadWorkspaces(); // Refresh list
    } catch (error) {
      console.error('Failed to force owner:', error);
      throw error;
    }
  }, [dispatch, loadWorkspaces]);

  // Navigation helpers
  const navigateToWorkspace = useCallback((id: string) => {
    // Find the workspace in the current list and set it as current
    const workspace = workspaces.find(w => w._id === id || w.id === id);
    if (workspace) {
      setWorkspace(workspace);
    } else {
      // If not found in current list, load it from API
      setWorkspaceId(id);
      loadWorkspace(id);
    }
  }, [workspaces, setWorkspace, setWorkspaceId, loadWorkspace]);

  // Search and filtering
  const searchWorkspaces = useCallback((query: string): Workspace[] => {
    setSearchQuery(query);
    if (!query.trim()) return workspaces;
    
    const lowerQuery = query.toLowerCase();
    return workspaces.filter(workspace => 
      workspace.name.toLowerCase().includes(lowerQuery) ||
      workspace.description?.toLowerCase().includes(lowerQuery) ||
      workspace.owner.toLowerCase().includes(lowerQuery)
    );
  }, [workspaces]);

  const filterWorkspacesByStatus = useCallback((status: 'active' | 'archived' | 'all'): Workspace[] => {
    switch (status) {
      case 'active':
        return activeWorkspaces;
      case 'archived':
        return archivedWorkspaces;
      default:
        return workspaces;
    }
  }, [activeWorkspaces, archivedWorkspaces, workspaces]);

  const filterWorkspacesByVisibility = useCallback((visibility: 'public' | 'private'): Workspace[] => {
    switch (visibility) {
      case 'public':
        return publicWorkspaces;
      case 'private':
        return privateWorkspaces;
      default:
        return workspaces;
    }
  }, [publicWorkspaces, privateWorkspaces, workspaces]);

  // Permission helpers
  const canEditWorkspace = useCallback((workspace: Workspace): boolean => {
    // This would need user context and permission logic
    return true; // Placeholder
  }, []);

  const canDeleteWorkspace = useCallback((workspace: Workspace): boolean => {
    // This would need user context and permission logic
    return true; // Placeholder
  }, []);

  const canInviteMembers = useCallback((workspace: Workspace): boolean => {
    // This would need user context and permission logic
    return true; // Placeholder
  }, []);

  const getUserRole = useCallback((workspace: Workspace): WorkspaceRole | null => {
    // This would need user context and permission logic
    return 'member'; // Placeholder
  }, []);

  // Auto-fetch on mount - only run once
  useEffect(() => {
    // Only fetch if we haven't fetched yet and no fetch is in progress
    if (autoFetch && workspaces.length === 0 && !loading && !isLoading && !fetchInitiated.current) {
      console.log('🔄 useWorkspace: Fetching workspaces', { global, workspacesLength: workspaces.length, loading, isLoading });
      fetchInitiated.current = true;
      if (global) {
        loadGlobalWorkspaces();
      } else {
        loadWorkspaces();
      }
    }
  }, [autoFetch, workspaces.length, loading, isLoading, global]); // Remove function dependencies to prevent infinite loop

  // Reset fetch initiated flag when workspaces are loaded
  useEffect(() => {
    if (workspaces.length > 0) {
      fetchInitiated.current = false;
    }
  }, [workspaces.length]);

  // Load workspace data when workspaceId changes - only if we have a workspaceId
  useEffect(() => {
    if (autoFetch && workspaceId && !currentWorkspace && !loading && !isLoading) {
      loadWorkspace(workspaceId);
      // Remove loadWorkspaceMembers call since members are already included in workspace data
    }
  }, [autoFetch, workspaceId, currentWorkspace?._id, loading, isLoading]); // Remove function dependencies to prevent infinite loop

  return {
    // State
    workspaces,
    currentWorkspace,
    members: computedMembers, // Use computed members from workspace data
    loading: loading || isLoading,
    error,
    
    // Computed values
    activeWorkspaces,
    archivedWorkspaces,
    publicWorkspaces,
    privateWorkspaces,
    sortedWorkspaces: filteredSortedWorkspaces,
    workspaceCount,
    
    // Actions
    loadWorkspace,
    loadWorkspaces,
    loadGlobalWorkspaces,
    loadWorkspaceMembers,
    setWorkspace,
    setWorkspaceId,
    
      // CRUD operations
  createNewWorkspace,

  updateWorkspaceData,
  deleteWorkspaceById,
  permanentDeleteWorkspaceById,
  restoreWorkspaceById,
    
    // Member management
    inviteNewMember,
    removeWorkspaceMember,
    getWorkspaceMembers,
    
    // Invite link management
    createInviteLink,
    disableInviteLink,
    
    // Settings and configuration
    updateSettings,
    
    // Avatar management
    uploadWorkspaceAvatar: uploadWorkspaceAvatarHandler,
    removeWorkspaceAvatar: removeWorkspaceAvatarHandler,
    
    // Utility functions
    refetchWorkspaces,
    clearWorkspaceError,
    clearWorkspaceData,
    
    // Dev functions
    forceOwner,
    
    // Navigation helpers
    navigateToWorkspace,
    
    // Search and filtering
    searchWorkspaces,
    filterWorkspacesByStatus,
    filterWorkspacesByVisibility,
    
    // Permission helpers
    canEditWorkspace,
    canDeleteWorkspace,
    canInviteMembers,
    getUserRole,
  };
};
