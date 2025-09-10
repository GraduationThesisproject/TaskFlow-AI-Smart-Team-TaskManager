import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Space } from '../../types/space.types';
import { WorkspaceService, type InviteLinkInfo } from "../../services/D_workspaceService";
import { SpaceService } from '../../services/spaceService';

import type { Workspace, WorkspaceMember, WorkspaceState as BaseWorkspaceState } from '../../types/workspace.types';

// Async thunks - combining both implementations
export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (workspaceId: string) => {
    const response = await WorkspaceService.getWorkspace(workspaceId);
    // Backend returns data: { workspace: {...}, userRole: '...', userPermissions: {...} }
    const ws: any = response as any;
    return {
      ...ws,
      _id: ws?._id ?? ws?.id,
      id: ws?.id ?? (typeof ws?._id === 'object' ? String(ws._id) : ws?._id),
    };
  }
)


export const fetchWorkspaces = createAsyncThunk<Workspace[]>(
  'workspace/fetchWorkspaces',
  async () => {
    const response = await WorkspaceService.getWorkspaces({ status: 'all' });
    // The response is an object with a workspaces array
    const list = Array.isArray((response as any)?.workspaces)
      ? (response as any).workspaces
      : Array.isArray(response)
      ? (response as any)
      : [];
    return list.map((ws: any) => ({
      ...ws,
      _id: ws?._id ?? ws?.id,
      id: ws?.id ?? (typeof ws?._id === 'object' ? String(ws._id) : ws?._id),
    }));
  }
);

export const generateInviteLink = createAsyncThunk<InviteLinkInfo, { id: string }>(
  'workspace/generateInviteLink',
  async ({ id }) => {
    const response = await WorkspaceService.generateInviteLink(id);
    return response
  }
);



// Admin: fetch all global workspaces
export const fetchWorkspacesGlobal = createAsyncThunk<Workspace[]>(
  'workspace/fetchWorkspacesGlobal',
  async () => {
    const response = await WorkspaceService.getWorkspaces({ status: 'all' });
    console.log('[fetchWorkspacesGlobal] raw response:', response);
    const raw: any = response as any;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.workspaces)
      ? raw.workspaces
      : Array.isArray(raw?.data?.workspaces)
      ? raw.data.workspaces
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    console.log('[fetchWorkspacesGlobal] extracted workspaces length:', list.length);
    return list;
  }
);

export const fetchSpacesByWorkspace = createAsyncThunk(
  'workspace/fetchSpacesByWorkspace',
  async (workspaceId: string) => {
    const response = await SpaceService.getSpacesByWorkspace(workspaceId);
    // Backend returns { success, message, data: { spaces: [...], count } }
    const raw: any = response as any;
    const list = Array.isArray(raw?.data?.spaces)
      ? raw.data.spaces
      : Array.isArray(raw?.spaces)
      ? raw.spaces
      : Array.isArray(raw)
      ? raw
      : [];
    return list;
  }
);

export const fetchSpace = createAsyncThunk(
  'workspace/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    // Backend returns { space: {...}, userRole: '...', userPermissions: {...} }
    return (response as any).space;
  }
);

// New thunks from the newer implementation
export const inviteMember = createAsyncThunk<WorkspaceMember, { id: string; email: string; role: 'member' | 'admin' }>(
  'workspace/inviteMember',
  async ({ id, email, role }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.inviteMember(id, { email, role });
      return response;
    } catch (error) {
      return rejectWithValue(error|| 'Failed to invite member');
    }
  }
);

// Fetch workspace members
export const fetchMembers = createAsyncThunk<WorkspaceMember[], { id: string }>(
  'workspace/fetchMembers',
  async ({ id }, { rejectWithValue }) => {
    try {
      const members = await WorkspaceService.getWorkspaceMembers(id);
      return members as unknown as WorkspaceMember[];
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch members');
    }
  }
);

// Remove a member from workspace
export const removeMember = createAsyncThunk<{ memberId: string; members?: WorkspaceMember[] }, { workspaceId: string; memberId: string }>(
  'workspace/removeMember',
  async ({ workspaceId, memberId }, { rejectWithValue }) => {
    try {
      const resp: any = await WorkspaceService.removeMember(workspaceId, memberId);
      // If backend returns updated members list, pass it through
      const members = Array.isArray(resp?.members) ? resp.members : undefined;
      return { memberId, members };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to remove member');
    }
  }
);

// Update workspace settings
export const updateWorkspaceSettings = createAsyncThunk(
  'workspace/updateSettings',
  async ({ id, section, updates }: { 
    id: string; 
    section: string; 
    updates: any 
  }, { rejectWithValue }) => {
    try {
      // Build payload shape based on section
      let payload: any = updates;
      if (section === 'settings') {
        payload = { settings: updates };
      } else if (section === 'visibility') {
        // visibility toggles like isPublic should be top-level
        payload = { isPublic: updates?.isPublic };
      } else if (section === 'general') {
        // name/description already at top-level
        payload = updates;
      }

      const response = await WorkspaceService.updateWorkspace(id, payload);
       
      // The service returns the workspace directly, not wrapped in response.data
      if (!response) {
        throw new Error('Invalid response from server');
      }
      
      return response as Workspace;
    } catch (error: any) {
      console.error('Error updating workspace settings:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update workspace settings');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData: {
    name: string;
    description?: string;
    visibility?: 'private' | 'public';
    isPublic?: boolean;
  }) => {
    const response = await WorkspaceService.createWorkspace({
      name: workspaceData.name,
      description: workspaceData.description,
      plan: 'free',
      isPublic: workspaceData.isPublic ?? (workspaceData.visibility === 'public'),
    });
    const ws: any = (response as any)?.workspace ?? response;
    return {
      ...ws,
      _id: ws?._id ?? ws?.id,
      id: ws?.id ?? (typeof ws?._id === 'object' ? String(ws._id) : ws?._id),
    };
  }
);

export const deleteWorkspace = createAsyncThunk<{ id: string; message: string; workspace?: Workspace }, { id: string }>(
  'workspace/deleteWorkspace',
  async ({ id }) => {
    const response = await WorkspaceService.deleteWorkspace(id);
    const message = (response as any)?.message || (response as any)?.data?.message || 'Workspace archived';
    const ws = (response as any)?.workspace;
    return { id, message, workspace: ws };
  }
);

// Permanently delete an archived workspace
export const permanentDeleteWorkspace = createAsyncThunk<{ id: string; message: string }, { id: string }>(
  'workspace/permanentDeleteWorkspace',
  async ({ id }) => {
    const response = await WorkspaceService.permanentDeleteWorkspace(id);
    const message = (response as any)?.message || (response as any)?.data?.message || 'Workspace permanently deleted';
    return { id, message };
  }
);

// Restore a soft-deleted workspace
export const restoreWorkspace = createAsyncThunk<Workspace, { id: string }>(
  'workspace/restoreWorkspace',
  async ({ id }, { rejectWithValue }) => {
    try {
      const ws = await WorkspaceService.restoreWorkspace(id);
      return ws as Workspace;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to restore workspace');
    }
  }
);

// Dev-only: force current user as owner for a workspace (repairs old data)

export const forceOwnerDev = createAsyncThunk<{ id: string; message: string }, { id: string }>(
  'workspace/forceOwnerDev',
  async ({ id }) => {
    const response = await WorkspaceService.forceOwnerDev(id);
    const message = (response as any)?.message || (response as any)?.data?.message || 'Ownership updated (dev)';
    return { id, message };
  }
);

// Combined state interface
interface WorkspaceState extends BaseWorkspaceState {
  workspaces: Workspace[];
  spaces: Space[];
  selectedSpace: Space | null;
  currentWorkspaceId: string | null;
  members: WorkspaceMember[];
  pendingInvitations: any[];
  loading: boolean;
}



const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  currentWorkspaceId:null,
  members: [],
  pendingInvitations: [],
  loading: false,
  isLoading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedSpace: (state, action: PayloadAction<Space | null>) => {
      state.selectedSpace = action.payload;
    },
    clearWorkspaceData: (state) => {
      state.currentWorkspace = null;
      state.spaces = [];
      state.selectedSpace = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkspaceId(state, action: PayloadAction<string | null>) {
      state.currentWorkspaceId = action.payload;
      
    },
    setCurrentWorkspace(state, action: PayloadAction<Workspace | null>) {
      state.currentWorkspace = action.payload;
    },
    removeWorkspaceById(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.workspaces = (state.workspaces || []).filter((w) => (w as any)._id !== id && (w as any).id !== id);
      if (state.currentWorkspace && ((state.currentWorkspace as any)._id === id || (state.currentWorkspace as any).id === id)) {
        state.currentWorkspace = null;
      }
      if (state.currentWorkspaceId === id) {
        state.currentWorkspaceId = null;
      }
    },
    upsertWorkspaceStatus(state, action: PayloadAction<{ id: string; status: 'active' | 'archived'; archivedAt?: string | null; archiveExpiresAt?: string | null }>) {
      const { id, status, archivedAt = null, archiveExpiresAt = null } = action.payload;
      const idx = (state.workspaces || []).findIndex((w: any) => (w?._id === id || w?.id === id));
      if (idx >= 0) {
        const prev = state.workspaces[idx] as any;
        state.workspaces[idx] = {
          ...prev,
          status,
          archivedAt,
          archiveExpiresAt,
        } as any;
      }
      // If currentWorkspace matches, keep it in sync too
      if (state.currentWorkspace && (((state.currentWorkspace as any)._id === id) || ((state.currentWorkspace as any).id === id))) {
        state.currentWorkspace = {
          ...(state.currentWorkspace as any),
          status,
          archivedAt,
          archiveExpiresAt,
        } as any;
      }
    },
    // Update a member's presence (online/offline or lastActive)
    upsertMemberPresence(state, action: PayloadAction<{ memberId: string; isOnline?: boolean; lastActive?: string | number | Date }>) {
      const { memberId, isOnline, lastActive } = action.payload;
      const idx = (state.members || []).findIndex((m: any) => {
        const ids = [m?._id, m?.id, m?.userId, m?.user?._id, m?.user?.id];
        return ids.includes(memberId);
      });
      if (idx >= 0) {
        const prev = (state.members as any)[idx] || {};
        (state.members as any)[idx] = {
          ...prev,
          ...(typeof isOnline === 'boolean' ? { isOnline } : {}),
          ...(lastActive ? { lastActive: typeof lastActive === 'string' ? lastActive : new Date(lastActive).toISOString() } : {}),
          user: {
            ...(prev as any).user,
            ...(typeof isOnline === 'boolean' ? { isOnline } : {}),
            ...(lastActive ? { lastActive: typeof lastActive === 'string' ? lastActive : new Date(lastActive).toISOString() } : {}),
          },
        } as any;
      }
    },
    // Clear all pending invitations (client-side list)
    clearPendingInvitations(state) {
      state.pendingInvitations = [];
    },
    // Remove a single pending invitation by email (case-insensitive)
    removePendingInvitationByEmail(state, action: PayloadAction<string>) {
      const email = (action.payload || '').toLowerCase();
      state.pendingInvitations = (state.pendingInvitations || []).filter((inv: any) => {
        const e = (inv?.invitedUser?.email || inv?.email || '').toLowerCase();
        return e !== email;
      });
    },
    resetWorkspaceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
      })
      //invite memebrs
      .addCase(inviteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        // Do NOT add to members here. The invite API returns invitation info,
        // not an accepted membership. Members should only appear after acceptance
        // and a subsequent fetchMembers call.
       // Store a normalized pending entry using the invite args for reliable pruning later
        try {
            const { id, email, role } = (action as any)?.meta?.arg || {};
            if (email && id) {
              const pending = {
                email,
                role: role || 'member',
                workspaceId: id,
                // Optional fields for display
                invitedUser: { email },
              };
              state.pendingInvitations = [
                ...(state.pendingInvitations || []),
                pending,
              ];
            }
          } catch {
            // ignore
          }
        state.error = null;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action as any)?.payload || action.error.message || 'Failed to invite member';
      })
      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
                state.members = Array.isArray(action.payload) ? action.payload : [];
                // Prune pending invitations that have now become members.
                try {
                  const membersList = Array.isArray(state.members) ? state.members : [];
                  const memberEmails = new Set(
                    membersList
                      .map((m: any) => m?.user?.email || m?.email)
                      .filter(Boolean)
                  );
                  const memberIds = new Set(
                    membersList
                      .map((m: any) => m?.user?._id || m?.user?.id || m?._id || m?.id)
                      .filter(Boolean)
                      .map(String)
                  );
                  if (Array.isArray(state.pendingInvitations) && state.pendingInvitations.length > 0) {
                    state.pendingInvitations = state.pendingInvitations.filter((inv: any) => {
                      const invitedEmail = inv?.invitedUser?.email || inv?.email || null;
                      const invitedUserId = inv?.invitedUser?.userId ? String(inv.invitedUser.userId) : null;
                      if (invitedUserId && memberIds.has(invitedUserId)) return false;
                      if (invitedEmail && memberEmails.has(invitedEmail)) return false;
                      return true;
                    });
                  }
                } catch {
                  
                }        state.error = null;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch members';
      })
      // Fetch single workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workspace';
      })
  
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.workspaces = Array.isArray(state.workspaces)
            ? [...state.workspaces, action.payload]
            : [action.payload];
        }
        state.error = null;
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create workspace';
      })

      // Update workspace settings
      .addCase(updateWorkspaceSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkspaceSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        // Optionally keep workspaces list in sync
        const idx = state.workspaces.findIndex((w) => w._id === action.payload._id);
        if (idx >= 0) state.workspaces[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateWorkspaceSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update workspace settings';
      })
      // Delete workspace
      .addCase(deleteWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id;
        const archived = action.payload?.workspace as any;
        if (id) {
          const idx = (state.workspaces || []).findIndex((w: any) => (w?._id === id || w?.id === id));
          if (idx >= 0) {
            // Update existing workspace to archived state if backend sent it
            if (archived) {
              state.workspaces[idx] = {
                ...state.workspaces[idx],
                ...archived,
              } as any;
            } else {
              // Fallback: mark status archived locally
              const prev = state.workspaces[idx] as any;
              state.workspaces[idx] = {
                ...prev,
                status: 'archived',
                archivedAt: (prev as any)?.archivedAt ?? new Date().toISOString(),
              } as any;
            }
          }
          // If current workspace is the one archived, keep it but update status
          if (state.currentWorkspace && (((state.currentWorkspace as any)._id === id) || ((state.currentWorkspace as any).id === id))) {
            state.currentWorkspace = {
              ...(state.currentWorkspace as any),
              ...(archived || {}),
              status: archived?.status || 'archived',
            } as any;
          }
        }
        state.error = null;
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete workspace';
      })
      // Permanent delete workspace
      .addCase(permanentDeleteWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id;
        if (id) {
          state.workspaces = (state.workspaces || []).filter((w: any) => (w?._id !== id && w?.id !== id));
          if (state.currentWorkspace && ((state.currentWorkspace as any)._id === id || (state.currentWorkspace as any).id === id)) {
            state.currentWorkspace = null as any;
          }
          if (state.currentWorkspaceId === id) {
            state.currentWorkspaceId = null;
          }
        }
        state.error = null;
      })
      .addCase(permanentDeleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to permanently delete workspace';
      })
      // Fetch spaces by workspace
      .addCase(fetchSpacesByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = (action as any)?.payload || action.error.message || 'Failed to fetch spaces';
        state.spaces = [];
      })
      // Restore workspace
      .addCase(restoreWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        const restored = action.payload as Workspace;
        if (restored) {
          const idx = state.workspaces.findIndex((w) => (w._id === restored._id || (w as any).id === (restored as any)._id));
          if (idx >= 0) {
            state.workspaces[idx] = { ...(state.workspaces[idx] as any), ...restored } as any;
          } else {
            state.workspaces = [restored, ...(state.workspaces || [])];
          }
          if (state.currentWorkspace && (((state.currentWorkspace as any)._id === (restored as any)._id) || ((state.currentWorkspace as any).id === (restored as any)._id))) {
            state.currentWorkspace = { ...(state.currentWorkspace as any), ...restored } as any;
          }
        }
        state.error = null;
      })
      .addCase(restoreWorkspace.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to restore workspace';
      })
      // Remove member
      .addCase(removeMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const memberId = action.payload.memberId;
        // Prefer backend-provided members list if available
        if (Array.isArray((action.payload as any)?.members)) {
          state.members = (action.payload as any).members as any;
          state.error = null;
          return;
        }
        state.members = (state.members || []).filter((m: any) => {
          const ids = [
            m?._id,
            m?.id,
            (m as any)?.userId,
            (m as any)?.user?._id,
            (m as any)?.user?.id,
          ];
          return !ids.includes(memberId);
        });
        state.error = null;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action as any)?.payload || action.error.message || 'Failed to remove member';
      })
       
       }})
    
    // You can add other thunks (spaces, members, invite links) here similarly...
  



export const {
  setSelectedSpace,
  clearWorkspaceData,
  setLoading,
  clearError,
  setCurrentWorkspaceId,
  removeWorkspaceById,
  upsertWorkspaceStatus,
  upsertMemberPresence,
  clearPendingInvitations,
  removePendingInvitationByEmail,
  resetWorkspaceState,
} = workspaceSlice.actions;

// Selectors
// Note: accept `any` for state to avoid importing RootState and to be compatible with useSelector typing.
export const selectWorkspaceState = (state: any) => state.workspace as WorkspaceState;
export const selectMembers = (state: any) => (state.workspace as WorkspaceState).members;
export const selectWorkspaceLoading = (state: any) => (state.workspace as WorkspaceState).isLoading;
export const selectWorkspaceError = (state: any) => (state.workspace as WorkspaceState).error;

export default workspaceSlice.reducer;