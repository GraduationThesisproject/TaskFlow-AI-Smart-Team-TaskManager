import type { Workspace, WorkspaceMember } from '../types/workspace.types';
import axios from '../config/axios';
import type { ApiResponse } from '../types/api.types';

export const workspaceService = {
  getWorkspace: (id: string) =>
    axios
      .get<ApiResponse<{ workspace: Workspace; userRole?: string; userPermissions?: any }>>(`/workspaces/${id}`)
      .then((r) => r.data.data.workspace),

  getMembers: (id: string) =>
    axios
      .get<ApiResponse<{ members: any[]; total: number; limits: any }>>(`/workspaces/${id}/members`)
      .then((r) =>
        (r.data.data.members || []).map((m: any): WorkspaceMember => ({
          id: m.user?._id || m.userId || m.id, // use user id as member id
          userId: m.user?._id || m.userId || m.id,
          user: m.user || undefined,
          role: (m.role === 'owner' || m.role === 'admin' || m.role === 'member') ? m.role : 'member',
          status: 'active',
          lastActive: m.user?.lastLogin || m.lastActive || undefined,
          joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
        }))
      ),

  inviteMember: (id: string, payload: { email: string; role: 'member' | 'admin' }) =>
    axios.post<ApiResponse<any>>(`/workspaces/${id}/invite`, payload).then((r) => r.data.data),

  removeMember: (id: string, memberId: string) =>
    axios.delete<ApiResponse<{ removed: boolean }>>(`/workspaces/${id}/members/${memberId}`).then((r) => r.data.data),

  // Stubs for invite link management (backend route not explicitly specified in README)
  generateInviteLink: async (id: string) => ({
    link: `${window.location.origin}/invite/workspace/${id}?t=dummy-token`,
    enabled: true,
  }),
  disableInviteLink: async (_id: string) => ({ enabled: false }),
};

export type InviteLinkInfo = { link?: string; enabled: boolean };
