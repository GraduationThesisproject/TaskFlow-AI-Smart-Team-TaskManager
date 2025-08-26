// src/services/workspace.service.ts
import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/task.types';
import type { Workspace, CreateWorkspaceData, UpdateWorkspaceData, InviteMemberData } from '../types/workspace.types';

export class WorkspaceService {
  static async getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    try {
      const response = await axiosInstance.get('/workspaces');
      // Backend sendResponse shape: { success, message, data: { workspaces, count } }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  static async getWorkspace(id: string): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}`);
      // { success, message, data: { workspace, userRole, userPermissions } }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  }

  static async createWorkspace(data: CreateWorkspaceData): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.post('/workspaces', data);
      // { success, message, data: { workspace, userRole } }
      return response.data.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  static async deleteWorkspace(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${id}`);
      // { success, message, data: { id } } – controller sends message alongside
      return { message: response.data.message } as any;
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete workspace');
    }
  }

  static async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.put(`/workspaces/${id}`, data);
      // { success, message, data: { workspace } }
      return response.data.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  }

  static async getWorkspaceMembers(id: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/members`);
      // { success, message, data: { members, total, limits } }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }

  static async inviteMember(workspaceId: string, data: InviteMemberData): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/workspaces/${workspaceId}/invite`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  static async removeMember(workspaceId: string, memberId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  static async getWorkspaceAnalytics(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      throw error;
    }
  }

  static async generateInviteLink(id: string): Promise<ApiResponse<{ link: string; enabled: boolean }>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/invite-link`);
      return response.data;
    } catch (error) {
      console.error('Error generating invite link:', error);
      throw error;
    }
  }

  static async disableInviteLink(id: string): Promise<ApiResponse<{ link: string; enabled: boolean }>> {
    try {
      const response = await axiosInstance.post(`/workspaces/${id}/disable-invite-link`);
      return response.data;
    } catch (error) {
      console.error('Error disabling invite link:', error);
      throw error;
    }
  }

  static async getWorkspaceInvitations(id: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get(`/invitations/entity/workspace/${id}?status=pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace invitations:', error);
      throw error;
    }
  }
  // Dev-only: force current authenticated user as owner for a workspace
  static async forceOwnerDev(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post(`/workspaces/${id}/dev/force-owner`);
      return { message: response.data.message } as any;
    } catch (error: any) {
      console.error('Error forcing owner (dev):', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to force owner');
    }
  }
    // Public: get all public workspaces (accessible to any authenticated user)
    static async getPublicWorkspaces(): Promise<ApiResponse<Workspace[]>> {
      try {
        const response = await axiosInstance.get('/workspaces/public');
        console.log('[WorkspaceService.getPublicWorkspaces] response.data:', response.data);
        console.log('[WorkspaceService.getPublicWorkspaces] response.data.data:', response.data.data);
        // Backend sendResponse shape: { success, message, data: { workspaces, count } }
        const payload = response.data?.data;
        const arr = Array.isArray(payload?.workspaces) ? payload.workspaces : Array.isArray(payload) ? payload : [];
        return arr as any;
      } catch (error) {
        console.error('Error fetching public workspaces:', error);
        throw error;
      }
    }
  }

export type InviteLinkInfo = { link?: string; enabled: boolean };



