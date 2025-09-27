/*🔗 InvitationService.ts - Invitation Management Service*/

import axiosInstance from '../config/axios';

export interface Invitation {
  id: string;
  type: 'workspace' | 'space';
  invitedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  invitedUser: {
    email: string;
    name?: string;
    userId?: string;
  };
  targetEntity: {
    type: 'Workspace' | 'Space';
    id: string;
    name: string;
  };
  role: 'viewer' | 'member' | 'contributor' | 'admin';
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  cancelledAt?: string;
  source?: 'github_org';
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
  cancelled: number;
}

export interface BulkInviteResult {
  successful: Array<{ email: string; invitationId?: string }>;
  failed: Array<{ email: string; error: string }>;
  alreadyMembers: Array<{ email: string; reason: string }>;
  alreadyInvited: Array<{ email: string; reason: string }>;
}

export interface InviteGitHubMembersRequest {
  workspaceId: string;
  memberEmails: string[];
  role?: 'viewer' | 'member' | 'contributor' | 'admin';
  message?: string;
}

export interface BulkInviteRequest {
  emails: string[];
  entityType: 'workspace' | 'space';
  entityId: string;
  role?: 'viewer' | 'member' | 'contributor' | 'admin';
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class InvitationService {
  
  // Get user's invitations
  static async getUserInvitations(params: {
    status?: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
    limit?: number;
    skip?: number;
  } = {}): Promise<ApiResponse<{ invitations: Invitation[]; total: number; hasMore: boolean }>> {
    try {
      const response = await axiosInstance.get('/invitations', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user invitations:', error);
      throw this.handleError(error);
    }
  }

  // Get invitation by ID
  static async getInvitationById(invitationId: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await axiosInstance.get(`/invitations/${invitationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation by ID:', error);
      throw this.handleError(error);
    }
  }

  // Get invitation by token
  static async getByToken(token: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await axiosInstance.get(`/invitations/token/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting invitation by token:', error);
      throw this.handleError(error);
    }
  }

  // Accept invitation by token
  static async accept(token: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await axiosInstance.post(`/invitations/token/${token}/accept`);
      return response.data;
    } catch (error: any) {
      console.error('Error accepting invitation by token:', error);
      throw this.handleError(error);
    }
  }

  // Decline invitation by token
  static async decline(token: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await axiosInstance.post(`/invitations/token/${token}/decline`);
      return response.data;
    } catch (error: any) {
      console.error('Error declining invitation by token:', error);
      throw this.handleError(error);
    }
  }

  // Decline invitation
  static async declineInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await axiosInstance.post(`/invitations/${invitationId}/decline`);
      return response.data;
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      throw this.handleError(error);
    }
  }

  // Cancel invitation
  static async cancelInvitation(invitationId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.delete(`/invitations/${invitationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      throw this.handleError(error);
    }
  }

  // Bulk invite users
  static async bulkInvite(request: BulkInviteRequest): Promise<ApiResponse<BulkInviteResult>> {
    try {
      const response = await axiosInstance.post('/invitations/bulk-invite', request);
      return response.data;
    } catch (error: any) {
      console.error('Error bulk inviting users:', error);
      throw this.handleError(error);
    }
  }

  // Invite GitHub organization members
  static async inviteGitHubMembers(request: InviteGitHubMembersRequest): Promise<ApiResponse<BulkInviteResult>> {
    try {
      const response = await axiosInstance.post('/invitations/github-members', request);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting GitHub members:', error);
      throw this.handleError(error);
    }
  }

  // Get invitation statistics
  static async getInvitationStats(entityType: 'workspace' | 'space', entityId: string): Promise<ApiResponse<InvitationStats>> {
    try {
      const response = await axiosInstance.get(`/invitations/stats/${entityType}/${entityId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invitation statistics:', error);
      throw this.handleError(error);
    }
  }

  // Handle API errors and convert to standardized format
  private static handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}