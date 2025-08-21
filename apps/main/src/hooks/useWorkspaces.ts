import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchWorkspace, 
  fetchSpacesByWorkspace,
  fetchMembers,
  inviteMember,
  removeMember,
  generateInviteLink,
  disableInviteLink,
  createWorkspace
} from '../store/slices/workspaceSlice';

export const useWorkspaces = (workspaceId?: string) => {
  const dispatch = useAppDispatch();
  
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

  // Load workspace data when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspace(workspaceId) as any);
      dispatch(fetchSpacesByWorkspace(workspaceId) as any);
      dispatch(fetchMembers({ id: workspaceId }) as any);
    }
  }, [workspaceId, dispatch]);

  const loadWorkspace = (id: string) => {
    dispatch(fetchWorkspace(id) as any);
  };

  const loadSpaces = (id: string) => {
    dispatch(fetchSpacesByWorkspace(id) as any);
  };

  const loadMembers = (id: string) => {
    dispatch(fetchMembers({ id }) as any);
  };

  const inviteNewMember = async (email: string, role: 'member' | 'admin') => {
    if (!workspaceId) throw new Error('No workspace selected');
    try {
      await dispatch(inviteMember({ id: workspaceId, email, role }) as any).unwrap();
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  };

  const removeWorkspaceMember = async (memberId: string) => {
    if (!workspaceId) throw new Error('No workspace selected');
    try {
      await dispatch(removeMember({ id: workspaceId, memberId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const createInviteLink = async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    try {
      await dispatch(generateInviteLink({ id: workspaceId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      throw error;
    }
  };

  const disableWorkspaceInviteLink = async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    try {
      await dispatch(disableInviteLink({ id: workspaceId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to disable invite link:', error);
      throw error;
    }
  };

  const createNewWorkspace = async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => {
    try {
      await dispatch(createWorkspace(workspaceData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  };

  return {
    // State
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
  };
};
