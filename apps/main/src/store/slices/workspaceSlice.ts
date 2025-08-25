import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Space } from '../../types/task.types';
import { WorkspaceService } from "../../services/D_workspaceService.ts";
import { SpaceService } from '../../services/spaceService';
import { workspaceService, type InviteLinkInfo } from '../../services/workspace.service.ts';
import type { Workspace, WorkspaceMember, WorkspaceState as BaseWorkspaceState } from '../../types/workspace.types';

// Async thunks - combining both implementations
export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (workspaceId: string) => {
    const response = await WorkspaceService.getWorkspace(workspaceId);
    // Backend returns { workspace: {...}, userRole: '...', userPermissions: {...} }
    return (response.data as any).workspace;
  }
);

export const fetchWorkspaces = createAsyncThunk<Workspace[]>(
  'workspace/fetchWorkspaces',
  async () => {
    const response = await WorkspaceService.getWorkspaces();
    // The response is an object with a workspaces array
    return Array.isArray((response.data as any)?.workspaces) 
      ? (response.data as any).workspaces 
      : [];
  }
);


export const fetchSpacesByWorkspace = createAsyncThunk(
  'workspace/fetchSpacesByWorkspace',
  async (workspaceId: string) => {
    const response = await SpaceService.getSpacesByWorkspace(workspaceId);
    // Backend returns { spaces: [...], count: number }
    return (response.data as any).spaces;
  }
);

export const fetchSpace = createAsyncThunk(
  'workspace/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    // Backend returns { space: {...}, userRole: '...', userPermissions: {...} }
    return (response.data as any).space;
  }
);

// New thunks from the newer implementation
export const fetchMembers = createAsyncThunk<WorkspaceMember[], { id: string; q?: string }>('workspace/fetchMembers', async ({ id, q }) => {
  return workspaceService.getMembers(id, q ? { q } : undefined);
});

export const inviteMember = createAsyncThunk<WorkspaceMember, { id: string; email: string; role: 'member' | 'admin' }>(
  'workspace/inviteMember',
  async ({ id, email, role }) => {
    return workspaceService.inviteMember(id, { email, role });
  }
);

export const removeMember = createAsyncThunk<{ memberId: string }, { id: string; memberId: string }>(
  'workspace/removeMember',
  async ({ id, memberId }) => {
    await workspaceService.removeMember(id, memberId);
    return { memberId };
  }
);

export const generateInviteLink = createAsyncThunk<InviteLinkInfo, { id: string }>(
  'workspace/generateInviteLink',
  async ({ id }) => workspaceService.generateInviteLink(id)
);

export const disableInviteLink = createAsyncThunk<InviteLinkInfo, { id: string }>(
  'workspace/disableInviteLink',
  async ({ id }) => workspaceService.disableInviteLink(id)
);

// Update workspace settings
export const updateWorkspaceSettings = createAsyncThunk<
  Workspace,
  { id: string; section: string; updates: Record<string, any> }
>(
  'workspace/updateWorkspaceSettings',
  async ({ id, section, updates }) => {
    const response = await WorkspaceService.updateWorkspace(id, {
      // Backend expects { settings: { [section]: updates } }
      settings: { [section]: updates } as any,
    } as any);
    // API returns wrapper with { workspace }
    return (response.data as any).workspace as Workspace;
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => {
    const response = await WorkspaceService.createWorkspace({
      name: workspaceData.name,
      description: workspaceData.description,
      plan: 'free' // Default to free plan
    });
    return response.data;
  }
);

export const deleteWorkspace = createAsyncThunk<{ id: string; message: string }, { id: string }>(
  'workspace/deleteWorkspace',
  async ({ id }) => {
    const response = await WorkspaceService.deleteWorkspace(id);
    const message = (response as any)?.message || (response as any)?.data?.message || 'Workspace deleted';
    return { id, message };
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
  inviteLink?: InviteLinkInfo;
  loading: boolean;
}

const getPersistedWorkspaceId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentWorkspaceId');
  }
  return null;
};

const setPersistedWorkspaceId = (id: string | null): void => {
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem('currentWorkspaceId', id);
    } else {
      localStorage.removeItem('currentWorkspaceId');
    }
  }
};

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  currentWorkspaceId: getPersistedWorkspaceId(),
  members: [],
  inviteLink: undefined,
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
      setPersistedWorkspaceId(action.payload);
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
  
      // Fetch single workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        if (!state.workspaces.find((w) => w._id === action.payload._id)) {
          state.workspaces = [...state.workspaces, action.payload];
        }
        // Ensure members table has data even if fetchMembers hasn't run or failed
        if (Array.isArray((action.payload as any).members)) {
          state.members = (action.payload as any).members as unknown as WorkspaceMember[];
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

      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = Array.isArray(action.payload) ? action.payload : [];
        console.log('✅ fetchMembers.fulfilled - Members updated:', state.members);
        state.error = null;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        console.error('❌ fetchMembers.rejected:', action.error.message);
        state.error = action.error.message || 'Failed to fetch members';
      })

      // Invite member
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
      .addCase(inviteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to invite member';
      })

      // Remove member
      .addCase(removeMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(m => m.id !== action.payload.memberId);
        state.error = null;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove member';
      })

      // Generate invite link
      .addCase(generateInviteLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInviteLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inviteLink = action.payload;
        state.error = null;
      })
      .addCase(generateInviteLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate invite link';
      })

      // Disable invite link
      .addCase(disableInviteLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableInviteLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inviteLink = action.payload;
        state.error = null;
      })
      .addCase(disableInviteLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to disable invite link';
      })
      
      }})
  
      // Delete workspace
    
    // You can add other thunks (spaces, members, invite links) here similarly...
  



export const {
  setSelectedSpace,
  clearWorkspaceData,
  setLoading,
  clearError,
  setCurrentWorkspaceId,
  resetWorkspaceState,
} = workspaceSlice.actions;

// Selectors
// Note: accept `any` for state to avoid importing RootState and to be compatible with useSelector typing.
export const selectWorkspaceState = (state: any) => state.workspace as WorkspaceState;
export const selectMembers = (state: any) => (state.workspace as WorkspaceState).members;
export const selectWorkspaceLoading = (state: any) => (state.workspace as WorkspaceState).isLoading;
export const selectWorkspaceError = (state: any) => (state.workspace as WorkspaceState).error;

export default workspaceSlice.reducer;