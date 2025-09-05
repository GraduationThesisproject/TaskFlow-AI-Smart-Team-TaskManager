import axiosInstance from '../config/axios';
import type { 
  WorkspaceRules, 
  UpdateWorkspaceRulesData, 
  WorkspaceRulesResponse
} from '../types/workspaceRules.types';

class WorkspaceRulesService {
  /**
   * Get workspace rules
   */
  async getWorkspaceRules(workspaceId: string): Promise<WorkspaceRules> {
    try {
      const response = await axiosInstance.get<WorkspaceRulesResponse>(`/workspaces/${workspaceId}/rules`);
      
      console.log('Workspace rules service response:', {
        success: response.data.success,
        rules: response.data.rules,
        hasContent: !!response.data.rules?.content,
        contentLength: response.data.rules?.content?.length || 0
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch workspace rules');
      }
      
      return response.data.rules;
    } catch (error: any) {
      console.error('Error fetching workspace rules:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to fetch workspace rules');
    }
  }

  /**
   * Update workspace rules
   */
  async updateWorkspaceRules(
    workspaceId: string, 
    data: UpdateWorkspaceRulesData
  ): Promise<WorkspaceRules> {
    try {
      const response = await axiosInstance.put<WorkspaceRulesResponse>(`/workspaces/${workspaceId}/rules`, data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update workspace rules');
      }
      
      return response.data.rules;
    } catch (error: any) {
      console.error('Error updating workspace rules:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ');
        throw new Error(errorMessages);
      }
      
      throw new Error('Failed to update workspace rules');
    }
  }

  /**
   * Upload workspace rules as PDF file
   */
  async uploadWorkspaceRules(workspaceId: string, file: File): Promise<WorkspaceRules> {
    try {
      const formData = new FormData();
      formData.append('rulesFile', file);
      
      const response = await axiosInstance.post<WorkspaceRulesResponse>(`/workspaces/${workspaceId}/rules/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload workspace rules');
      }
      
      return response.data.rules;
    } catch (error: any) {
      console.error('Error uploading workspace rules:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ');
        throw new Error(errorMessages);
      }
      
      throw new Error('Failed to upload workspace rules');
    }
  }

  /**
   * Delete workspace rules (reset to default)
   */
  async deleteWorkspaceRules(workspaceId: string): Promise<void> {
    try {
      const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/workspaces/${workspaceId}/rules`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete workspace rules');
      }
    } catch (error: any) {
      console.error('Error deleting workspace rules:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to delete workspace rules');
    }
  }
}

export const workspaceRulesService = new WorkspaceRulesService();
export default workspaceRulesService;
