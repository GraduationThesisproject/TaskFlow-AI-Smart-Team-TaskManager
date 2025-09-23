import { useState, useEffect, useCallback } from 'react';
import { InvitationService } from '../services/invitationService';
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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
  }, [clearError]);

  // Fetch invitation by ID
  const fetchInvitationById = useCallback(async (invitationId: string): Promise<Invitation | null> => {
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
  }, [clearError]);

  // Accept invitation
  const acceptInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
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
  }, [clearError]);

  // Decline invitation
  const declineInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
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
  }, [clearError]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
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
  }, [clearError]);

  // Bulk invite users
  const bulkInvite = useCallback(async (request: BulkInviteRequest): Promise<BulkInviteResult | null> => {
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
  }, [clearError]);

  // Invite GitHub organization members
  const inviteGitHubMembers = useCallback(async (request: InviteGitHubMembersRequest): Promise<BulkInviteResult | null> => {
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
  }, [clearError]);

  // Fetch invitation statistics
  const fetchStats = useCallback(async (entityType: 'workspace' | 'space', entityId: string): Promise<void> => {
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
  }, [clearError]);

  // Auto-fetch invitations on mount
  useEffect(() => {
    fetchInvitations();
  }, []); // Remove fetchInvitations dependency to prevent infinite loop

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
