import axiosInstance from '../config/axios';
import type { Space } from '../types/space.types';
import type { ApiResponse } from '../types/task.types';

export interface CreateSpaceData {
  name: string;
  description?: string;
  workspaceId: string;
  // Some backend versions accept `workspace` instead of `workspaceId`.
  // We'll normalize in the request body to support both.
  workspace?: string;
  settings?: any;
}

export interface UpdateSpaceData {
  name?: string;
  description?: string;
  settings?: any;
}

export class SpaceService {
  // Get spaces by workspace
  static async getSpacesByWorkspace(workspaceId: string): Promise<ApiResponse<Space[]>> {
    try {
      const response = await axiosInstance.get(`/spaces?workspace=${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching spaces:', error);
      throw error;
    }
  }

  // Get space by ID
  static async getSpace(id: string): Promise<ApiResponse<Space>> {
    try {
      const response = await axiosInstance.get(`/spaces/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching space:', error);
      throw error;
    }
  }

  // Create new space
  static async createSpace(data: CreateSpaceData): Promise<ApiResponse<Space>> {
    try {
      // Normalize payload to support backends expecting either `workspaceId` or `workspace`
      const body: any = {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        workspace: data.workspace || data.workspaceId,
      };
      const response = await axiosInstance.post('/spaces', body);
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        console.error('Error creating space:', error.response.status, error.response.data);
      } else {
        console.error('Error creating space:', error?.message || error);
      }
      throw error;
    }
  }

  // Update space (try PATCH first for partial updates; fallback to PUT)
  static async updateSpace(id: string, data: UpdateSpaceData): Promise<ApiResponse<Space>> {
    try {
      const response = await axiosInstance.patch(`/spaces/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 405 || error?.response?.status === 404) {
        const response = await axiosInstance.put(`/spaces/${id}`, data);
        return response.data;
      }
      console.error('Error updating space:', error);
      throw error;
    }
  }

  // Delete space
  static async deleteSpace(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/spaces/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  }

  // Get space members
  static async getSpaceMembers(id: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get(`/spaces/${id}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching space members:', error);
      throw error;
    }
  }

  // Get boards for a space
  static async getSpaceBoards(id: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get(`/spaces/${id}/boards`);
      return response.data;
    } catch (error) {
      console.error('Error fetching space boards:', error);
      throw error;
    }
  }

  // Add member to space
  static async addSpaceMember(spaceId: string, userId: string, role: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/spaces/${spaceId}/members`, { userId, role });
      return response.data;
    } catch (error) {
      console.error('Error adding space member:', error);
      throw error;
    }
  }

  // Remove member from space
  static async removeSpaceMember(spaceId: string, memberId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/spaces/${spaceId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing space member:', error);
      throw error;
    }
  }

  // Archive space
  static async archiveSpace(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/spaces/${id}/archive`, {});
      return response.data;
    } catch (error) {
      console.error('Error archiving space:', error);
      throw error;
    }
  }

  // Unarchive space
  static async unarchiveSpace(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/spaces/${id}/archive`, { unarchive: true });
      return response.data;
    } catch (error) {
      console.error('Error unarchiving space:', error);
      throw error;
    }
  }
}
