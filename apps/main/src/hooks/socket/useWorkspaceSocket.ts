import { useEffect, useCallback } from 'react';
import { useWorkspaceSocket } from '../../contexts/SocketContext';

interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  permissions: string[];
}

interface WorkspaceUpdate {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
}

export const useWorkspaceSocketOperations = () => {
  const { socket, isConnected, emit, on, off } = useWorkspaceSocket();

  // Join workspace
  const joinWorkspace = useCallback((workspaceId: string) => {
    if (isConnected) {
      emit('workspace:join', { workspaceId });
    }
  }, [isConnected, emit]);

  // Leave workspace
  const leaveWorkspace = useCallback((workspaceId: string) => {
    if (isConnected) {
      emit('workspace:leave', { workspaceId });
    }
  }, [isConnected, emit]);

  // Update workspace settings
  const updateWorkspace = useCallback((workspaceId: string, updates: WorkspaceUpdate) => {
    if (isConnected) {
      emit('workspace:update', { workspaceId, updates });
    }
  }, [isConnected, emit]);

  // Add member to workspace
  const addMember = useCallback((workspaceId: string, memberData: { userId: string; role: string; permissions?: string[] }) => {
    if (isConnected) {
      emit('workspace:add-member', { workspaceId, ...memberData });
    }
  }, [isConnected, emit]);

  // Remove member from workspace
  const removeMember = useCallback((workspaceId: string, userId: string) => {
    if (isConnected) {
      emit('workspace:remove-member', { workspaceId, userId });
    }
  }, [isConnected, emit]);

  // Update member role
  const updateMemberRole = useCallback((workspaceId: string, userId: string, newRole: string) => {
    if (isConnected) {
      emit('workspace:update-member-role', { workspaceId, userId, newRole });
    }
  }, [isConnected, emit]);

  // Get workspace members
  const getMembers = useCallback((workspaceId: string) => {
    if (isConnected) {
      emit('workspace:get-members', { workspaceId });
    }
  }, [isConnected, emit]);

  // Get workspace activity
  const getActivity = useCallback((workspaceId: string, limit: number = 50) => {
    if (isConnected) {
      emit('workspace:get-activity', { workspaceId, limit });
    }
  }, [isConnected, emit]);

  // Subscribe to workspace events
  const subscribeToWorkspace = useCallback((workspaceId: string, eventTypes: string[] = ['members', 'activity', 'updates']) => {
    if (isConnected) {
      emit('workspace:subscribe', { workspaceId, eventTypes });
    }
  }, [isConnected, emit]);

  // Unsubscribe from workspace events
  const unsubscribeFromWorkspace = useCallback((workspaceId: string) => {
    if (isConnected) {
      emit('workspace:unsubscribe', { workspaceId });
    }
  }, [isConnected, emit]);

  return {
    // Connection status
    isConnected,
    
    // Workspace operations
    joinWorkspace,
    leaveWorkspace,
    updateWorkspace,
    addMember,
    removeMember,
    updateMemberRole,
    getMembers,
    getActivity,
    subscribeToWorkspace,
    unsubscribeFromWorkspace,
  };
};
