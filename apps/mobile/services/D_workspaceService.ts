// src/services/workspace.service.ts
import axiosInstance from '../config/axios';
import type { Workspace, CreateWorkspaceData, UpdateWorkspaceData, InviteMemberData } from '../types/workspace.types';
import { env } from '../config/env';

export class WorkspaceService {
  // Fetch all workspaces for the current user
  static async getWorkspaces(options?: { status?: 'active' | 'archived' | 'all'; includeArchived?: boolean }): Promise<Workspace[]> {
    try {
      const response = await axiosInstance.get('/workspaces', {
        params: {
          ...(options?.status ? { status: options.status } : {}),
          ...(options?.includeArchived ? { includeArchived: 'true' } : {}),
        },
      });
      return response.data.data?.workspaces || [];
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Fetch single workspace
  static async getWorkspace(id: string): Promise<Workspace> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}`);
      return response.data.data?.workspace;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  }

  // Create a new workspace
  static async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    try {
      if (env.ENABLE_DEBUG) {
        console.debug('[WorkspaceService.createWorkspace] payload:', data);
      }
      const config = env.ENABLE_DEBUG ? { headers: { 'X-Debug': 'true' } } : undefined;
      const response = await axiosInstance.post('/workspaces', data, config);
      if (env.ENABLE_DEBUG) {
        console.debug('[WorkspaceService.createWorkspace] response:', response.data);
      }
      return response.data.data?.workspace || response.data.workspace;
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to create workspace';
      throw new Error(message);
    }
  }

  // Update workspace
  static async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
    try {
      const response = await axiosInstance.put(`/workspaces/${id}`, data);
      // Be resilient to various backend shapes
      const ws =
        response?.data?.data?.workspace ??
        response?.data?.workspace ??
        response?.data?.data ??
        response?.data;
      if (!ws) {
        throw new Error('Invalid response from server');
      }
      return ws as Workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  }

  // Delete workspace
  static async deleteWorkspace(id: string): Promise<{ message: string; workspace?: Workspace }> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${id}`);
      return { 
        message: response.data.message,
        workspace: response.data?.data?.workspace
      };
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete workspace');
    }
  }

  // Permanently delete an archived workspace
  static async permanentDeleteWorkspace(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${id}/permanent`);
      return { message: response.data.message };
    } catch (error: any) {
      console.error('Error permanently deleting workspace:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to permanently delete workspace');
    }
  }

  // Restore soft-deleted workspace
  static async restoreWorkspace(id: string): Promise<Workspace> {
    try {
      const response = await axiosInstance.post(`/workspaces/${id}/restore`);
      return response.data.data?.workspace;
    } catch (error: any) {
      console.error('Error restoring workspace:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to restore workspace');
    }
  }

  // Workspace Rules APIs
  static async getWorkspaceRules(id: string): Promise<{ content: string; version?: number; updatedAt?: string } | null> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/rules`);
      // backend shape: { success, message, data: { rules } }
      return response.data?.data?.rules || null;
    } catch (error: any) {
      console.error('Error fetching workspace rules:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch workspace rules');
    }
  }

  static async updateWorkspaceRules(id: string, data: { content: string }): Promise<{ content: string; version?: number; updatedAt?: string }> {
    try {
      const response = await axiosInstance.put(`/workspaces/${id}/rules`, { content: data.content });
      return response.data?.data?.rules || { content: data.content };
    } catch (error: any) {
      console.error('Error updating workspace rules:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update workspace rules');
    }
  }

  static async deleteWorkspaceRules(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${id}/rules`);
      return { message: response.data?.message || 'Rules deleted' };
    } catch (error: any) {
      console.error('Error deleting workspace rules:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete workspace rules');
    }
  }

  static async uploadWorkspaceRules(id: string, file: any): Promise<{ content: string; version?: number; updatedAt?: string }> {
    try {
      const formData = new FormData();
      formData.append('rulesFile', file);
      const response = await axiosInstance.post(`/workspaces/${id}/rules/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data?.rules || null;
    } catch (error: any) {
      console.error('Error uploading workspace rules:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload workspace rules');
    }
  }

  // Members
  static async getWorkspaceMembers(id: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/members`);
      return response.data.data?.members || [];
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }

  static async inviteMember(workspaceId: string, data: InviteMemberData): Promise<any> {
    try {
      const response = await axiosInstance.post(`/workspaces/${workspaceId}/invite`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error inviting member:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to invite member';
      throw new Error(message);
    }
  }

  static async removeMember(workspaceId: string, memberId: string): Promise<any> {
    try {
      const wid = encodeURIComponent(workspaceId);
      const mid = encodeURIComponent(memberId);
      const response = await axiosInstance.delete(`/workspaces/${wid}/members/${mid}`);
      return response.data.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to remove member';
      console.error('Error removing member:', message);
      throw new Error(message);
    }
  }

  // Analytics
  static async getWorkspaceAnalytics(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      throw error;
    }
  }

  // Invite link
  static async generateInviteLink(id: string): Promise<{ link?: string; enabled: boolean }> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/invite-link`);
      return response.data.data;
    } catch (error) {
      console.error('Error generating invite link:', error);
      throw error;
    }
  }

  static async disableInviteLink(id: string): Promise<{ link?: string; enabled: boolean }> {
    try {
      const response = await axiosInstance.post(`/workspaces/${id}/disable-invite-link`);
      return response.data.data;
    } catch (error) {
      console.error('Error disabling invite link:', error);
      throw error;
    }
  }

  // Pending invitations
  static async getWorkspaceInvitations(id: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/invitations/entity/workspace/${id}?status=pending`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching workspace invitations:', error);
      throw error;
    }
  }

  // Dev-only: force owner
  static async forceOwnerDev(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(`/workspaces/${id}/dev/force-owner`);
      return { message: response.data.message };
    } catch (error: any) {
      console.error('Error forcing owner (dev):', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to force owner');
    }
  }
}

export type InviteLinkInfo = { link?: string; enabled: boolean };
