import { useEffect, useCallback, useMemo } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchWorkspaces,
  fetchWorkspace, 
  fetchSpacesByWorkspace,
  fetchMembers,
  inviteMember,
  removeMember,
  generateInviteLink,
  disableInviteLink,
  createWorkspace,
  deleteWorkspace
} from '../store/slices/workspaceSlice';

interface UseWorkspacesParams {
  workspaceId?: string;
  autoFetch?: boolean;
}

interface UseWorkspacesReturn {
  workspaces: any[];
  currentWorkspace: any;
  spaces: any[];
  selectedSpace: any;
  members: any[];
  inviteLink: any;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadWorkspace: (id: string) => void;
  loadSpaces: (id: string) => void;
  loadMembers: (id: string) => void;
  inviteNewMember: (email: string, role: 'member' | 'admin') => Promise<void>;
  removeWorkspaceMember: (memberId: string) => Promise<void>;
  createInviteLink: () => Promise<void>;
  disableWorkspaceInviteLink: () => Promise<void>;
  createNewWorkspace: (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => Promise<void>;
  refetchWorkspaces: () => void;
  deleteWorkspaceById: (id: string) => Promise<void>;
}

export const useWorkspaces = (params?: UseWorkspacesParams | string): UseWorkspacesReturn => {
  const dispatch = useAppDispatch();
  
  // Handle both old string parameter and new object parameter for backward compatibility
  const { workspaceId, autoFetch = true } = useMemo(() => {
    if (typeof params === 'string') {
      return { workspaceId: params, autoFetch: true };
    }
    return params || { autoFetch: true };
  }, [params]);
  
  const {
    workspaces,
    currentWorkspace,
    spaces,
    selectedSpace,
    members,
    inviteLink,
    loading,
    isLoading,
    error
  } = useAppSelector(state => state.workspace);

  const loadWorkspace = useCallback((id: string) => {
    if (env.ENABLE_DEBUG) {
      console.log('🏢 Loading workspace:', id);
    }
    dispatch(fetchWorkspace(id) as any);
  }, [dispatch]);

  const loadSpaces = useCallback((id: string) => {
    if (env.ENABLE_DEBUG) {
      console.log('🏗️ Loading spaces for workspace:', id);
    }
    dispatch(fetchSpacesByWorkspace(id) as any);
  }, [dispatch]);

  const loadMembers = useCallback((id: string) => {
    if (env.ENABLE_DEBUG) {
      console.log('👥 Loading members for workspace:', id);
    }
    dispatch(fetchMembers({ id }) as any);
  }, [dispatch]);

  const refetchWorkspaces = useCallback(() => {
    if (env.ENABLE_DEBUG) {
      console.log('🔄 Refetching all workspaces');
    }
    dispatch(fetchWorkspaces() as any);
  }, [dispatch]);

  const inviteNewMember = useCallback(async (email: string, role: 'member' | 'admin') => {
    if (!workspaceId) throw new Error('No workspace selected');
    if (env.ENABLE_DEBUG) {
      console.log('📧 Inviting member:', email, 'as', role);
    }
    
    try {
      await dispatch(inviteMember({ id: workspaceId, email, role }) as any).unwrap();
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  const removeWorkspaceMember = useCallback(async (memberId: string) => {
    if (!workspaceId) throw new Error('No workspace selected');
    if (env.ENABLE_DEBUG) {
      console.log('🗑️ Removing member:', memberId);
    }
    
    try {
      await dispatch(removeMember({ id: workspaceId, memberId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  const createInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    if (env.ENABLE_DEBUG) {
      console.log('🔗 Creating invite link for workspace:', workspaceId);
    }
    
    try {
      await dispatch(generateInviteLink({ id: workspaceId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  const disableWorkspaceInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    if (env.ENABLE_DEBUG) {
      console.log('🚫 Disabling invite link for workspace:', workspaceId);
    }
    
    try {
      await dispatch(disableInviteLink({ id: workspaceId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to disable invite link:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  const createNewWorkspace = useCallback(async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => {
    if (env.ENABLE_DEBUG) {
      console.log('➕ Creating new workspace:', workspaceData.name);
    }
    
    try {
      await dispatch(createWorkspace(workspaceData) as any).unwrap();
      // Refetch all workspaces after creation
      dispatch(fetchWorkspaces() as any);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteWorkspaceById = useCallback(async (id: string) => {
    if (env.ENABLE_DEBUG) {
      console.log('🗑️ Deleting workspace:', id);
    }
    try {
      await dispatch(deleteWorkspace({ id }) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }, [dispatch]);

  // Auto-fetch all workspaces on mount
  useEffect(() => {
    if (autoFetch) {
      refetchWorkspaces();
    }
  }, [autoFetch, refetchWorkspaces]);

  // Load workspace data when workspaceId changes
  useEffect(() => {
    if (autoFetch && workspaceId) {
      loadWorkspace(workspaceId);
      loadSpaces(workspaceId);
      loadMembers(workspaceId);
    }
  }, [autoFetch, workspaceId, loadWorkspace, loadSpaces, loadMembers]);

  return {
    workspaces,
    currentWorkspace,
    spaces,
    selectedSpace,
    members,
    inviteLink,
    loading: loading || isLoading,
    error,

    // Actions
    loadWorkspace,
    loadSpaces,
    loadMembers,
    inviteNewMember,
    removeWorkspaceMember,
    createInviteLink,
    disableWorkspaceInviteLink,
    createNewWorkspace,
    refetchWorkspaces,
    deleteWorkspaceById,
  };
};