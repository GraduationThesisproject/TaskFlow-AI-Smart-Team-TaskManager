// src/services/workspace.service.ts
import axiosInstance from '../config/axios';
import type { Workspace, CreateWorkspaceData, UpdateWorkspaceData, InviteMemberData } from '../types/workspace.types';
import type { ApiResponse } from '../types/task.types';

export class WorkspaceService {
  // Fetch all workspaces for the current user
  static async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await axiosInstance.get('/workspaces');
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
      const response = await axiosInstance.post('/workspaces', data);
      return response.data.data?.workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  // Update workspace
  static async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
    try {
      const response = await axiosInstance.put(`/workspaces/${id}`, data);
      return response.data.data?.workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  }

  // Delete workspace
  static async deleteWorkspace(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${id}`);
      return { message: response.data.message };
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete workspace');
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
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  static async removeMember(workspaceId: string, memberId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
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
