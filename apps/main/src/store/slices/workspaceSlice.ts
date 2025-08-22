import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Space } from '../../types/task.types';
import { WorkspaceService } from '../../services/workspaceService';
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
export const fetchMembers = createAsyncThunk<WorkspaceMember[], { id: string }>('workspace/fetchMembers', async ({ id }) => {
  return workspaceService.getMembers(id);
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

// Combined state interface
interface WorkspaceState extends BaseWorkspaceState {
  spaces: Space[];
  selectedSpace: Space | null;
  currentWorkspaceId: string | null;
  members: WorkspaceMember[];
  inviteLink?: InviteLinkInfo;
  loading: boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  currentWorkspaceId: null,
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
    },
    resetWorkspaceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.currentWorkspace = action.payload;
        if (!state.workspaces.find((w) => w.id === action.payload.id)) {
          state.workspaces.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch workspace';
      })
      // Fetch spaces by workspace
      .addCase(fetchSpacesByWorkspace.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.spaces = action.payload;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
      })
      // Fetch space
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.selectedSpace = action.payload;
        state.error = null;
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch space';
      })
      // New member-related cases
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load members';
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload.memberId);
      })
      .addCase(generateInviteLink.fulfilled, (state, action) => {
        state.inviteLink = action.payload;
      })
      .addCase(disableInviteLink.fulfilled, (state, action) => {
        state.inviteLink = action.payload;
      })
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.workspaces.push(action.payload as any);
        state.error = null;
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create workspace';
      });
  },
});

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
