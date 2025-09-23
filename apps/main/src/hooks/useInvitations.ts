import { useState, useEffect, useCallback } from 'react';
import { InvitationService } from '../services/invitationService';
import { useAuth } from './useAuth';
import { useSocketContext } from '../contexts/SocketContext';
import { useToast } from './useToast';
import { env } from '../config/env';
import type { Invitation, InvitationStats, BulkInviteResult, InviteGitHubMembersRequest, BulkInviteRequest } from '../services/invitationService';

export interface UseInvitationsReturn {
  // State
  invitations: Invitation[];
  stats: InvitationStats | null;
  isLoading: boolean;
  error: string;
  
  // Actions
  fetchInvitations: (params?: { status?: string; limit?: number; skip?: number }) => Promise<void>;
  fetchInvitationById: (invitationId: string) => Promise<Invitation | null>;
  acceptInvitation: (invitationId: string) => Promise<boolean>;
  declineInvitation: (invitationId: string) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  bulkInvite: (request: BulkInviteRequest) => Promise<BulkInviteResult | null>;
  inviteGitHubMembers: (request: InviteGitHubMembersRequest) => Promise<BulkInviteResult | null>;
  fetchStats: (entityType: 'workspace' | 'space', entityId: string) => Promise<void>;
  
  // Utilities
  clearError: () => void;
}

export const useInvitations = (): UseInvitationsReturn => {
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Socket connection for real-time updates
  const { notificationSocket, isNotificationConnected } = useSocketContext();

  // Clear error state
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Fetch user invitations
  const fetchInvitations = useCallback(async (params: {
    status?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<void> => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.getUserInvitations(params);
      
      if (response.success && response.data) {
        setInvitations(response.data.invitations);
      } else {
        setError(response.message || 'Failed to fetch invitations');
        setInvitations([]);
      }
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      setError(error.message || 'Failed to fetch invitations');
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Fetch invitation by ID
  const fetchInvitationById = useCallback(async (invitationId: string): Promise<Invitation | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.getInvitationById(invitationId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch invitation');
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching invitation by ID:', error);
      setError(error.message || 'Failed to fetch invitation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Accept invitation
  const acceptInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.acceptInvitation(invitationId);
      
      if (response.success) {
        // Update local state
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: 'accepted', acceptedAt: new Date().toISOString() }
              : inv
          )
        );
        return true;
      } else {
        setError(response.message || 'Failed to accept invitation');
        return false;
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'Failed to accept invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Decline invitation
  const declineInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.declineInvitation(invitationId);
      
      if (response.success) {
        // Update local state
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: 'declined', declinedAt: new Date().toISOString() }
              : inv
          )
        );
        return true;
      } else {
        setError(response.message || 'Failed to decline invitation');
        return false;
      }
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      setError(error.message || 'Failed to decline invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.cancelInvitation(invitationId);
      
      if (response.success) {
        // Remove from local state
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        return true;
      } else {
        setError(response.message || 'Failed to cancel invitation');
        return false;
      }
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      setError(error.message || 'Failed to cancel invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Bulk invite users
  const bulkInvite = useCallback(async (request: BulkInviteRequest): Promise<BulkInviteResult | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.bulkInvite(request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to send bulk invitations');
        return null;
      }
    } catch (error: any) {
      console.error('Error bulk inviting users:', error);
      setError(error.message || 'Failed to send bulk invitations');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Invite GitHub organization members
  const inviteGitHubMembers = useCallback(async (request: InviteGitHubMembersRequest): Promise<BulkInviteResult | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.inviteGitHubMembers(request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to invite GitHub members');
        return null;
      }
    } catch (error: any) {
      console.error('Error inviting GitHub members:', error);
      setError(error.message || 'Failed to invite GitHub members');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Fetch invitation statistics
  const fetchStats = useCallback(async (entityType: 'workspace' | 'space', entityId: string): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      const response = await InvitationService.getInvitationStats(entityType, entityId);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch invitation statistics');
        setStats(null);
      }
    } catch (error: any) {
      console.error('Error fetching invitation statistics:', error);
      setError(error.message || 'Failed to fetch invitation statistics');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isAuthenticated]);

  // Monitor socket connection status
  useEffect(() => {
    console.log('🔌 useInvitations: Socket connection status changed:', {
      isNotificationConnected,
      isAuthenticated,
      hasSocket: !!notificationSocket
    });
  }, [isNotificationConnected, isAuthenticated, notificationSocket]);

  // Auto-fetch invitations on mount (only if authenticated)
  // Real-time invitation updates via Socket.IO
  useEffect(() => {
    console.log('🔌 useInvitations Socket check:', {
      socket: !!notificationSocket,
      isAuthenticated,
      isConnected: isNotificationConnected,
      socketId: notificationSocket?.id,
      readyState: notificationSocket?.readyState
    });
    
    if (!notificationSocket || !isAuthenticated) {
      console.log('🔌 useInvitations: Missing socket or not authenticated, skipping setup');
      return;
    }

    // Check if socket is connected
    if (!isNotificationConnected) {
      console.log('🔌 useInvitations: Socket not connected, waiting for connection...');
      return;
    }

    const handleInvitationReceived = (data: { invitation: Invitation }) => {
      console.log('📨 New invitation received:', data.invitation);
      console.log('📨 Current invitations before update:', invitations.length);
      
      setInvitations(prev => {
        // Check if invitation already exists to avoid duplicates
        const exists = prev.some(inv => inv.id === data.invitation.id);
        console.log('📨 Invitation already exists:', exists);
        if (exists) return prev;
        
        // Add new invitation to the beginning of the list
        const updated = [data.invitation, ...prev];
        console.log('📨 Updated invitations:', updated.length);
        return updated;
      });

      // Show toast notification
      info(
        `You've been invited to join ${data.invitation.targetEntity.name}`,
        'New Invitation'
      );
    };

    // Debug event listeners
    const debugInvitationReceived = (data: any) => {
      console.log('🔌 DEBUG: invitation:received event received:', data);
      console.log('🔌 DEBUG: Socket connection state:', {
        connected: notificationSocket?.isConnected,
        id: notificationSocket?.id,
        readyState: notificationSocket?.readyState
      });
    };
    
    const debugInvitationUpdated = (data: any) => {
      console.log('🔌 DEBUG: invitation:updated event received:', data);
    };
    
    const debugInvitationCreated = (data: any) => {
      console.log('🔌 DEBUG: invitation:created event received:', data);
    };

    const handleInvitationUpdated = (data: { invitation: Partial<Invitation> }) => {
      console.log('📝 Invitation updated:', data.invitation);
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === data.invitation.id 
            ? { ...inv, ...data.invitation }
            : inv
        )
      );
    };

    const handleInvitationCreated = (data: { invitation: Invitation }) => {
      console.log('📤 Invitation created:', data.invitation);
      // This is for invitations sent by the current user
      setInvitations(prev => {
        const exists = prev.some(inv => inv.id === data.invitation.id);
        if (exists) return prev;
        return [data.invitation, ...prev];
      });
    };

    // Handle notification:new events (for general notifications)
    const handleNotificationNew = (data: any) => {
      console.log('🔔 Notification received:', data);
      
      // Check if this is an invitation-related notification
      if (data.notification && data.notification.type === 'invitation_received') {
        console.log('📨 Invitation notification received, refreshing invitations...');
        // Refresh invitations when we receive an invitation notification
        fetchInvitations();
      }
    };

    // Register event listeners
    notificationSocket.on('invitation:received', handleInvitationReceived);
    notificationSocket.on('invitation:updated', handleInvitationUpdated);
    notificationSocket.on('invitation:created', handleInvitationCreated);
    notificationSocket.on('notification:new', handleNotificationNew);
    
    // Debug listeners
    notificationSocket.on('invitation:received', debugInvitationReceived);
    notificationSocket.on('invitation:updated', debugInvitationUpdated);
    notificationSocket.on('invitation:created', debugInvitationCreated);
    
    // Connection event listeners for debugging
    notificationSocket.on('connect', () => {
      console.log('🔌 Notification socket connected');
      console.log('🔌 Socket ID:', notificationSocket.id);
      console.log('🔌 Socket readyState:', notificationSocket.readyState);
      // Send test ping immediately when connected
      setTimeout(() => {
        if (notificationSocket.isConnected) {
          console.log('🔌 Sending test ping after connect...');
          notificationSocket.emit('test:ping', { test: 'connection test' });
        }
      }, 100);
    });
    
    notificationSocket.on('disconnect', (reason) => {
      console.log('🔌 Notification socket disconnected:', reason);
    });
    
    notificationSocket.on('connect_error', (error) => {
      console.log('🔌 Notification socket connection error:', error);
    });
    
    // Test socket connection
    notificationSocket.on('test:pong', (data) => {
      console.log('🔌 Socket test successful:', data);
    });

    // Listen for any event to test socket functionality
    notificationSocket.onAny((eventName, ...args) => {
      console.log('🔌 Socket received event:', eventName, args);
    });
    
    // Send test ping after connection (with a small delay to ensure connection is established)
    const sendTestPing = () => {
      if (notificationSocket && notificationSocket.isConnected) {
        console.log('🔌 Sending test ping...');
        notificationSocket.emit('test:ping', { test: 'connection test' });
      } else {
        console.log('🔌 Socket not connected yet, skipping test ping');
      }
    };
    
    // Wait a bit for connection to be established
    setTimeout(sendTestPing, 500);

    return () => {
      if (notificationSocket) {
        notificationSocket.off('invitation:received', handleInvitationReceived);
        notificationSocket.off('invitation:updated', handleInvitationUpdated);
        notificationSocket.off('invitation:created', handleInvitationCreated);
        notificationSocket.off('notification:new', handleNotificationNew);
        notificationSocket.off('invitation:received', debugInvitationReceived);
        notificationSocket.off('invitation:updated', debugInvitationUpdated);
        notificationSocket.off('invitation:created', debugInvitationCreated);
        notificationSocket.off('connect');
        notificationSocket.off('disconnect');
        notificationSocket.off('connect_error');
        notificationSocket.off('test:pong');
        notificationSocket.offAny();
      }
    };
  }, [notificationSocket, isAuthenticated, isNotificationConnected]);

  useEffect(() => {
    if (isAuthenticated) {
    fetchInvitations();
    }
  }, [isAuthenticated, fetchInvitations]);

  return {
    // State
    invitations,
    stats,
    isLoading,
    error,

    // Actions
    fetchInvitations,
    fetchInvitationById,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    bulkInvite,
    inviteGitHubMembers,
    fetchStats,

    // Utilities
    clearError
  };
};
