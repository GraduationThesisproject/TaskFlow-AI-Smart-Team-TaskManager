import { useEffect, useCallback } from 'react';
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
    error
  } = useAppSelector(state => state.workspace);

  // ✅ Fetch all workspaces only if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || workspaces?.length) return;
    dispatch(fetchWorkspaces());
  }, [dispatch, workspaces]);

  // ✅ Load workspace-specific data safely
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !workspaceId) return;

    dispatch(fetchWorkspace(workspaceId));
    dispatch(fetchSpacesByWorkspace(workspaceId));
    dispatch(fetchMembers({ id: workspaceId }));
  }, [workspaceId, dispatch]);

  // Actions
  const loadWorkspace = useCallback((id: string) => dispatch(fetchWorkspace(id)), [dispatch]);
  const loadSpaces = useCallback((id: string) => dispatch(fetchSpacesByWorkspace(id)), [dispatch]);
  const loadMembers = useCallback((id: string) => dispatch(fetchMembers({ id })), [dispatch]);

  const inviteNewMember = useCallback(async (email: string, role: 'member' | 'admin') => {
    if (!workspaceId) throw new Error('No workspace selected');
    await dispatch(inviteMember({ id: workspaceId, email, role })).unwrap();
  }, [dispatch, workspaceId]);

  const removeWorkspaceMember = useCallback(async (memberId: string) => {
    if (!workspaceId) throw new Error('No workspace selected');
    await dispatch(removeMember({ id: workspaceId, memberId })).unwrap();
  }, [dispatch, workspaceId]);

  const createInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    await dispatch(generateInviteLink({ id: workspaceId })).unwrap();
  }, [dispatch, workspaceId]);

  const disableWorkspaceInviteLink = useCallback(async () => {
    if (!workspaceId) throw new Error('No workspace selected');
    await dispatch(disableInviteLink({ id: workspaceId })).unwrap();
  }, [dispatch, workspaceId]);

  const createNewWorkspace = useCallback(async (workspaceData: { name: string; description?: string; visibility: 'private' | 'public' }) => {
    await dispatch(createWorkspace(workspaceData)).unwrap();
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  return {
    workspaces,
    currentWorkspace,
    spaces,
    selectedSpace,
    members,
    inviteLink,
    loading,
    error,
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
