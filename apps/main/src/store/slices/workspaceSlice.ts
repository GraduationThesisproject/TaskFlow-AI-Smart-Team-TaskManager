import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Space } from '../../types/space.types';
import { WorkspaceService, type InviteLinkInfo } from "../../services/D_workspaceService";
import { SpaceService } from '../../services/spaceService';
import { workspaceRulesService } from '../../services/workspaceRulesService';
import type { WorkspaceSliceState } from '../../types/store.types';

import type { Workspace, WorkspaceMember} from '../../types/workspace.types';
import type { UpdateWorkspaceRulesData } from '../../types/workspaceRules.types';

// Async thunks - combining both implementations
export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (workspaceId: string) => {
    const response = await WorkspaceService.getWorkspace(workspaceId);
    const ws: any = response as any;
    
    // Also fetch workspace rules
    let rules = null;
    try {
      const rulesResponse = await workspaceRulesService.getWorkspaceRules(workspaceId);
      console.log('fetchWorkspace - rules response:', rulesResponse);
      rules = rulesResponse;
    } catch (error) {
      console.log('Failed to fetch workspace rules:', error);
      // Don't throw error, just continue without rules
    }
    
    return {
      ...ws,
      _id: ws?._id ?? ws?.id,
      id: ws?.id ?? (typeof ws?._id === 'object' ? String(ws._id) : ws?._id),
      rules: rules, // Include rules in the workspace object
    };
  }
)


export const fetchWorkspaces = createAsyncThunk<Workspace[]>(
  'workspace/fetchWorkspaces',
  async () => {
    const response = await WorkspaceService.getWorkspaces({ status: 'all' });
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
    // Backend returns { spaces: [...], count: number }
    return (response as any).spaces;
  }
);

export const fetchWorkspaceMembers = createAsyncThunk(
  'workspace/fetchWorkspaceMembers',
  async (workspaceId: string) => {
    const response = await WorkspaceService.getWorkspaceMembers(workspaceId);
    return response;
  }
);

// Workspace Rules async thunks
export const fetchWorkspaceRules = createAsyncThunk(
  'workspace/fetchWorkspaceRules',
  async (workspaceId: string) => {
    const response = await workspaceRulesService.getWorkspaceRules(workspaceId);
    return response;
  }
);

export const updateWorkspaceRules = createAsyncThunk(
  'workspace/updateWorkspaceRules',
  async ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceRulesData }) => {
    const response = await workspaceRulesService.updateWorkspaceRules(workspaceId, data);
    return response;
  }
);

export const deleteWorkspaceRules = createAsyncThunk(
  'workspace/deleteWorkspaceRules',
  async (workspaceId: string) => {
    await workspaceRulesService.deleteWorkspaceRules(workspaceId);
    return workspaceId;
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

export const createSpace = createAsyncThunk(
  'workspace/createSpace',
  async (spaceData: { name: string; description?: string; workspaceId: string }, { rejectWithValue }) => {
    try {
      const response = await SpaceService.createSpace(spaceData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to create space');
      }
    } catch (error: any) {
      console.error('Error creating space:', error);
      return rejectWithValue(error.message || 'Failed to create space');
    }
  }
);

// New thunks from the newer implementation
export const inviteMember = createAsyncThunk<WorkspaceMember, { id: string; email: string; role: 'member' | 'admin' }>(
  'workspace/inviteMember',
  async ({ id, email, role }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.inviteMember(id, { email, role });
      return response;
    } catch (error: any) {
      console.error('Error inviting member:', error);
      // Extract the proper error message from the backend response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to invite member';
      return rejectWithValue(errorMessage);
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
             const response = await WorkspaceService.updateWorkspace(id, {
         settings: { [section]: updates } as any
       });
      
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

// Update basic workspace fields (name, description)
export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async ({ id, data }: { 
    id: string; 
    data: { 
      name?: string; 
      description?: string; 
      settings?: any;
      githubOrg?: {
        id: number;
        login: string;
        name: string;
        url: string;
        avatar: string;
        description: string;
        isPrivate: boolean;
        linkedAt: string;
      } | null;
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.updateWorkspace(id, data);
      
      if (!response) {
        throw new Error('Invalid response from server');
      }
      
      return response as Workspace;
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update workspace');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
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

// Upload workspace avatar
export const uploadWorkspaceAvatar = createAsyncThunk<{ workspace: Workspace; avatar: { url: string; filename: string; size: number } }, { id: string; file: File }>(
  'workspace/uploadAvatar',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.uploadAvatar(id, file);
      return response;
    } catch (error: any) {
      console.error('Error uploading workspace avatar:', error);
      return rejectWithValue(error.message || 'Failed to upload workspace avatar');
    }
  }
);

// Remove workspace avatar
export const removeWorkspaceAvatar = createAsyncThunk<{ workspace: Workspace }, { id: string }>(
  'workspace/removeAvatar',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.removeAvatar(id);
      return response;
    } catch (error: any) {
      console.error('Error removing workspace avatar:', error);
      return rejectWithValue(error.message || 'Failed to remove workspace avatar');
    }
  }
);

// Update member role
export const updateMemberRole = createAsyncThunk<{ member: any }, { workspaceId: string; memberId: string; role: string }>(
  'workspace/updateMemberRole',
  async ({ workspaceId, memberId, role }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.updateMemberRole(workspaceId, memberId, role);
      return response;
    } catch (error: any) {
      console.error('Error updating member role:', error);
      return rejectWithValue(error.message || 'Failed to update member role');
    }
  }
);

// Transfer workspace ownership
export const transferOwnership = createAsyncThunk<{ workspace: Workspace }, { workspaceId: string; newOwnerId: string }>(
  'workspace/transferOwnership',
  async ({ workspaceId, newOwnerId }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.transferOwnership(workspaceId, newOwnerId);
      return response;
    } catch (error: any) {
      console.error('Error transferring ownership:', error);
      return rejectWithValue(error.message || 'Failed to transfer ownership');
    }
  }
);

// Remove workspace member
export const removeMember = createAsyncThunk<{ message: string }, { workspaceId: string; memberId: string }>(
  'workspace/removeMember',
  async ({ workspaceId, memberId }, { rejectWithValue }) => {
    try {
      const response = await WorkspaceService.removeMember(workspaceId, memberId);
      return response;
    } catch (error: any) {
      console.error('Error removing member:', error);
      return rejectWithValue(error.message || 'Failed to remove member');
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

// Combined state interface - using imported type from store.types.ts



const initialState: WorkspaceSliceState = {
  workspaces: [],
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  members: [],
  rules: null,
  loading: false,
  isLoading: false,
  rulesLoading: false,
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
      // Remove currentWorkspaceId from state since it's redundant
      // When setting a workspace ID, we should find and set the actual workspace
      if (action.payload) {
        const workspace = state.workspaces.find(w => w._id === action.payload || w.id === action.payload);
        if (workspace) {
          // Include rules from the separate rules state if they exist
          state.currentWorkspace = {
            ...workspace,
            rules: state.rules
          };
        }
      } else {
        state.currentWorkspace = null;
      }
    },
    setCurrentWorkspace(state, action: PayloadAction<Workspace | null>) {
      state.currentWorkspace = action.payload;
    },
    // Real-time role change update
    updateMemberRoleRealTime(state, action: PayloadAction<{ memberId: string; newRole: string; workspaceId: string }>) {
      const { memberId, newRole, workspaceId } = action.payload;
      
      console.log('🔄 Redux updateMemberRoleRealTime called with:', { memberId, newRole, workspaceId });
      console.log('🔄 Current workspace ID:', state.currentWorkspace?._id);
      console.log('🔄 Workspace match:', state.currentWorkspace?._id === workspaceId);
      
      // Update in currentWorkspace if it matches
      if (state.currentWorkspace && state.currentWorkspace._id === workspaceId) {
        console.log('🔄 Updating currentWorkspace members');
        const memberIndex = state.currentWorkspace.members.findIndex(member => 
          member.user?._id?.toString() === memberId ||
          member.user?.toString() === memberId
        );
        console.log('🔄 Member index found:', memberIndex);
        if (memberIndex !== -1) {
          console.log('🔄 Old role:', state.currentWorkspace.members[memberIndex].role);
          state.currentWorkspace.members[memberIndex].role = newRole;
          console.log('🔄 New role:', state.currentWorkspace.members[memberIndex].role);
        }
      }
      
      // Update in workspaces list
      const workspaceIndex = state.workspaces.findIndex(w => w._id === workspaceId);
      console.log('🔄 Workspace index in list:', workspaceIndex);
      if (workspaceIndex !== -1) {
        const memberIndex = state.workspaces[workspaceIndex].members.findIndex(member => 
          member.user?._id?.toString() === memberId ||
          member.user?.toString() === memberId
        );
        console.log('🔄 Member index in workspaces list:', memberIndex);
        if (memberIndex !== -1) {
          console.log('🔄 Old role in workspaces list:', state.workspaces[workspaceIndex].members[memberIndex].role);
          state.workspaces[workspaceIndex].members[memberIndex].role = newRole;
          console.log('🔄 New role in workspaces list:', state.workspaces[workspaceIndex].members[memberIndex].role);
        }
      }
    },
    removeWorkspaceById(state, action: PayloadAction<string>) {
      const id = action.payload;
      // Remove from workspaces list
      state.workspaces = state.workspaces.filter(w => w._id !== id && w.id !== id);
      // If current workspace is the one removed, clear it
      if (state.currentWorkspace && (state.currentWorkspace._id === id || state.currentWorkspace.id === id)) {
        state.currentWorkspace = null;
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
        if (action.payload) {
          state.members = [...state.members, action.payload];
        }
        state.error = null;
      })
      .addCase(inviteMember.rejected, (state, _action) => {
        state.isLoading = false;
        // Don't set the main workspace error for invitation failures
        // These should be handled by the UI as toast messages
        // state.error = (action.payload as string) || action.error?.message || 'Failed to invite member';
      })
      // Fetch single workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        // Also set the rules in the separate rules state if they exist
        if (action.payload.rules) {
          state.rules = action.payload.rules;
        }
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
      // Update basic workspace fields
      .addCase(updateWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        // Optionally keep workspaces list in sync
        const idx = state.workspaces.findIndex((w) => w._id === action.payload._id);
        if (idx >= 0) state.workspaces[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update workspace';
      })
      // Update member role
      .addCase(updateMemberRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update the member in the members array
        const memberIndex = state.members.findIndex(member => 
          member.user?._id?.toString() === action.payload.member.id ||
          member.user?.toString() === action.payload.member.id
        );
        if (memberIndex !== -1) {
          state.members[memberIndex].role = action.payload.member.role;
        }
        // Also update in currentWorkspace if it exists
        if (state.currentWorkspace) {
          const workspaceMemberIndex = state.currentWorkspace.members.findIndex(member => 
            member.user?._id?.toString() === action.payload.member.id ||
            member.user?.toString() === action.payload.member.id
          );
          if (workspaceMemberIndex !== -1) {
            state.currentWorkspace.members[workspaceMemberIndex].role = action.payload.member.role;
          }
        }
        state.error = null;
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update member role';
      })
      // Transfer ownership
      .addCase(transferOwnership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferOwnership.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload.workspace;
        // Update the workspaces list
        const idx = state.workspaces.findIndex((w) => w._id === action.payload.workspace._id);
        if (idx >= 0) state.workspaces[idx] = action.payload.workspace;
        state.error = null;
      })
      .addCase(transferOwnership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to transfer ownership';
      })
      // Remove member
      .addCase(removeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the member from the members array
        state.members = state.members.filter(member => 
          member.user?._id?.toString() !== action.meta.arg.memberId &&
          member.user?.toString() !== action.meta.arg.memberId
        );
        // Also remove from currentWorkspace if it exists
        if (state.currentWorkspace) {
          state.currentWorkspace.members = state.currentWorkspace.members.filter(member => 
            member.user?._id?.toString() !== action.meta.arg.memberId &&
            member.user?.toString() !== action.meta.arg.memberId
          );
        }
        state.error = null;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove member';
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
          if (state.currentWorkspace && ((state.currentWorkspace as any)._id === id || (state.currentWorkspace as any).id === id)) {
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
          // If current workspace is the one permanently deleted, clear it
          if (state.currentWorkspace && (state.currentWorkspace._id === id || state.currentWorkspace.id === id)) {
            state.currentWorkspace = null as any;
          }
        }
        state.error = null;
      })
      .addCase(permanentDeleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to permanently delete workspace';
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
        state.error = action.error.message || 'Failed to fetch spaces';
      })
      
      // Create space
      .addCase(createSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.spaces = Array.isArray(state.spaces)
            ? [...state.spaces, action.payload]
            : [action.payload];
        }
        state.error = null;
      })
      .addCase(createSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create space';
      })
      
      // Fetch workspace members
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch members';
      })
      
      // Upload workspace avatar
      .addCase(uploadWorkspaceAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadWorkspaceAvatar.fulfilled, (state, action) => {
        state.loading = false;
        const { workspace } = action.payload;
        state.currentWorkspace = workspace;
        // Update workspace in list
        const idx = state.workspaces.findIndex((w) => w._id === workspace._id);
        if (idx >= 0) state.workspaces[idx] = workspace;
        state.error = null;
      })
      .addCase(uploadWorkspaceAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to upload workspace avatar';
      })
      
      // Remove workspace avatar
      .addCase(removeWorkspaceAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWorkspaceAvatar.fulfilled, (state, action) => {
        state.loading = false;
        const { workspace } = action.payload;
        state.currentWorkspace = workspace;
        // Update workspace in list
        const idx = state.workspaces.findIndex((w) => w._id === workspace._id);
        if (idx >= 0) state.workspaces[idx] = workspace;
        state.error = null;
      })
      .addCase(removeWorkspaceAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to remove workspace avatar';
      })
      
      // Fetch workspace rules
      .addCase(fetchWorkspaceRules.pending, (state) => {
        state.rulesLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceRules.fulfilled, (state, action) => {
        state.rulesLoading = false;
        state.rules = action.payload;
        // Also update the current workspace with rules
        if (state.currentWorkspace) {
          state.currentWorkspace.rules = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchWorkspaceRules.rejected, (state, action) => {
        state.rulesLoading = false;
        state.error = action.error.message || 'Failed to fetch workspace rules';
      })
      
      // Update workspace rules
      .addCase(updateWorkspaceRules.pending, (state) => {
        state.rulesLoading = true;
        state.error = null;
      })
      .addCase(updateWorkspaceRules.fulfilled, (state, action) => {
        state.rulesLoading = false;
        state.rules = action.payload;
        // Also update the current workspace with rules
        if (state.currentWorkspace) {
          state.currentWorkspace.rules = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWorkspaceRules.rejected, (state, action) => {
        state.rulesLoading = false;
        state.error = action.error.message || 'Failed to update workspace rules';
      })
      
      // Delete workspace rules
      .addCase(deleteWorkspaceRules.pending, (state) => {
        state.rulesLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkspaceRules.fulfilled, (state) => {
        state.rulesLoading = false;
        state.rules = null;
        // Also clear rules from current workspace
        if (state.currentWorkspace) {
          state.currentWorkspace.rules = undefined;
        }
        state.error = null;
      })
      .addCase(deleteWorkspaceRules.rejected, (state, action) => {
        state.rulesLoading = false;
        state.error = action.error.message || 'Failed to delete workspace rules';
      });
  }
});

export const {
  setSelectedSpace,
  clearWorkspaceData,
  setLoading,
  clearError,
  setCurrentWorkspaceId,
  setCurrentWorkspace,
  updateMemberRoleRealTime,
  removeWorkspaceById,
  upsertWorkspaceStatus,
  resetWorkspaceState,
} = workspaceSlice.actions;

// Selectors
// Note: accept `any` for state to avoid importing RootState and to be compatible with useSelector typing.
export const selectWorkspaceState = (state: any) => state.workspace as WorkspaceSliceState;
export const selectMembers = (state: any) => (state.workspace as WorkspaceSliceState).members;
export const selectWorkspaceLoading = (state: any) => (state.workspace as WorkspaceSliceState).isLoading;
export const selectWorkspaceError = (state: any) => (state.workspace as WorkspaceSliceState).error;

export default workspaceSlice.reducer;