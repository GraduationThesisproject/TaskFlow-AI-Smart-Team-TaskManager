import type { Workspace, WorkspaceMember } from '../types/workspace.types';
import axios from '../config/axios';
import type { ApiResponse } from '../types/api.types';

export const workspaceService = {
  getWorkspace: (id: string) =>
    axios
      .get<ApiResponse<{ workspace: Workspace; userRole?: string; userPermissions?: any }>>(`/workspaces/${id}`)
      .then((r) => r.data.data.workspace),

  getMembers: (id: string, opts?: { q?: string }) =>
    axios
      .get<ApiResponse<{ members: any[]; total: number; limits: any }>>(`/workspaces/${id}/members`, {
        params: opts?.q ? { q: opts.q } : undefined,
      })
      .then((r) =>
        (r.data.data.members || []).map((m: any): WorkspaceMember => ({
          id: m._id || m.id || m.userId || m.user?._id,
          userId: m.userId || m.user?._id || m.id || m._id,
          user:
            m.user && typeof m.user === 'object'
              ? {
                  _id: m.user._id,
                  email: m.user.email,
                  name: m.user.name,
                  avatar: m.user.avatar,
                  emailVerified: !!m.user.emailVerified,
                  isActive: !!m.user.isActive,
                  lastLogin: m.user.lastLogin,
                  createdAt: m.user.createdAt,
                  updatedAt: m.user.updatedAt,
                }
              : undefined,
          role: m.role === 'owner' || m.role === 'admin' || m.role === 'member' ? m.role : 'member',
          status: m.status || 'active',
          lastActive: m.lastActive ? new Date(m.lastActive) : undefined,
          joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
          addedBy: typeof m.addedBy === 'string' ? m.addedBy : m.addedBy?._id,
          permissions: m.permissions || [],
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
