import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchWorkspaces,
  fetchWorkspace, 
  fetchSpacesByWorkspace,
  inviteMember,
  generateInviteLink,
  createWorkspace,
  deleteWorkspace
} from '../store/slices/workspaceSlice';

interface UseWorkspacesParams {
  workspaceId?: string;
  autoFetch?: boolean;
  global?: boolean;
  public?: boolean;
}

interface UseWorkspacesReturn {
  workspaces: any[];
  currentWorkspace: any;
  spaces: any[];
  selectedSpace: any;
  members: any[];
  // Optional because invite link state/handler may not be wired in all contexts yet
  inviteLink?: any;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadWorkspace: (id: string) => void;
  loadSpaces: (id: string) => void;
  // Optional: not implemented in this hook currently
  loadMembers?: (id: string) => void;
  inviteNewMember: (email: string, role: 'member' | 'admin') => Promise<void>;
  // Optional: not implemented in this hook currently
  removeWorkspaceMember?: (memberId: string) => Promise<void>;
  createInviteLink: () => Promise<void>;
  // Optional: not implemented in this hook currently
  disableWorkspaceInviteLink?: () => Promise<void>;
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
  const { workspaceId, autoFetch = true} = useMemo(() => {
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
    loading,
    isLoading,
    error
  } = useAppSelector(state => state.workspace);

  const loadWorkspace = useCallback((id: string) => {
    
    dispatch(fetchWorkspace(id) as any);
  }, [dispatch]);

  const loadSpaces = useCallback((id: string) => {

    dispatch(fetchSpacesByWorkspace(id) as any);
  }, [dispatch]);



  const refetchWorkspaces = useCallback(() => {
  
    dispatch(fetchWorkspaces() as any);
  }, [dispatch]);

  const inviteNewMember = useCallback(async (email: string, role: 'member' | 'admin') => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      await dispatch(inviteMember({ id: workspaceId, email, role }) as any).unwrap();
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

 

  const createInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    
    try {
      await dispatch(generateInviteLink({ id: workspaceId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);



  const createNewWorkspace = useCallback(async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => {
    
    
    try {
      await dispatch(createWorkspace(workspaceData) as any).unwrap();
      // Refetch all workspaces after creation
      refetchWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }, [dispatch, refetchWorkspaces]);

  const deleteWorkspaceById = useCallback(async (id: string) => {
    
    try {
      await dispatch(deleteWorkspace({ id }) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }, [dispatch]);

  // Auto-fetch all workspaces on mount ONLY when no specific workspaceId is provided
  useEffect(() => {
    if (autoFetch && !workspaceId) {
      refetchWorkspaces();
    }
  }, [autoFetch, workspaceId, refetchWorkspaces]);

  // Load workspace data when workspaceId changes
  useEffect(() => {
    if (autoFetch && workspaceId) {
      loadWorkspace(workspaceId);
      loadSpaces(workspaceId);
    }
  }, [autoFetch, workspaceId, loadWorkspace, loadSpaces]);

  return {
    workspaces,
    currentWorkspace,
    spaces,
    selectedSpace,
    members,
    loading: loading || isLoading,
    error,

    // Actions
    loadWorkspace,
    loadSpaces,
    inviteNewMember,
    createInviteLink,
    createNewWorkspace,
    refetchWorkspaces,
    deleteWorkspaceById,
  };
};