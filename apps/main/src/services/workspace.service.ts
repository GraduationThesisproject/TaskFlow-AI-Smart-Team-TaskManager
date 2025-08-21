import api from '../utils/apiClient';
import type { Workspace, WorkspaceMember } from '../types/workspace.types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export const workspaceService = {
  getWorkspace: (id: string) =>
    api.get<ApiResponse<Workspace>>(`/workspaces/${id}`).then((r) => r.data),

  getMembers: (id: string) =>
    api.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${id}/members`).then((r) => r.data),

  inviteMember: (id: string, payload: { email: string; role: 'member' | 'admin' }) =>
    api.post<ApiResponse<WorkspaceMember>>(`/workspaces/${id}/invite`, payload).then((r) => r.data),

  removeMember: (id: string, memberId: string) =>
    api.delete<ApiResponse<{ removed: boolean }>>(`/workspaces/${id}/members/${memberId}`).then((r) => r.data),

  // Stubs for invite link management (backend route not explicitly specified in README)
  generateInviteLink: async (id: string) => ({
    link: `${window.location.origin}/invite/workspace/${id}?t=dummy-token`,
    enabled: true,
  }),
  disableInviteLink: async (_id: string) => ({ enabled: false }),
};

export type InviteLinkInfo = { link?: string; enabled: boolean };
