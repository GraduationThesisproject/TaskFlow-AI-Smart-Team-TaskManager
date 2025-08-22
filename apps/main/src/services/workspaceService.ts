import axiosInstance from '../config/axios';
import type { ApiResponse, PaginatedResponse } from '../types/task.types';
import type { 
  Workspace, 
  CreateWorkspaceData, 
  UpdateWorkspaceData, 
  InviteMemberData 
} from '../types/workspace.types';

export class WorkspaceService {
  // Get all workspaces
  static async getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    try {
      const response = await axiosInstance.get('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Get workspace by ID
  static async getWorkspace(id: string): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  }

  // Create new workspace
  static async createWorkspace(data: CreateWorkspaceData): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.post('/workspaces', data);
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  // Update workspace
  static async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<ApiResponse<Workspace>> {
    try {
      const response = await axiosInstance.put(`/workspaces/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  }

  // Get workspace members
  static async getWorkspaceMembers(id: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }

  // Invite member to workspace
  static async inviteMember(workspaceId: string, data: InviteMemberData): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/workspaces/${workspaceId}/invite`, data);
      return response.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  // Remove member from workspace
  static async removeMember(workspaceId: string, memberId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Get workspace analytics
  static async getWorkspaceAnalytics(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      throw error;
    }
  }
}
