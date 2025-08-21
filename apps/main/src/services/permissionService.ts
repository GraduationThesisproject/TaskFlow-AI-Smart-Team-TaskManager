import { apiClient } from '../utils/apiClient';
import { WorkspaceRole } from '../types/workspace.types';

export interface PermissionResponse {
  role: WorkspaceRole;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canManageMembers: boolean;
    canManageSettings: boolean;
  };
}

export class PermissionService {
  static async getUserPermissions(workspaceId: string): Promise<PermissionResponse> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/permissions`);
    return response.data;
  }

  static async updateUserRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void> {
    await apiClient.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
  }

  static async checkPermission(workspaceId: string, action: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/permissions/check`, {
        params: { action }
      });
      return response.data.hasPermission;
    } catch (error) {
      return false;
    }
  }
}
