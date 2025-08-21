import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workspaceService, type InviteLinkInfo } from '../../services/workspace.service.ts';
import type { Workspace, WorkspaceMember, WorkspaceState } from '../../types/workspace.types';

// Thunks
export const fetchWorkspace = createAsyncThunk<Workspace, { id: string }>('workspace/fetchWorkspace', async ({ id }) => {
  return workspaceService.getWorkspace(id);
});

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

export interface WorkspaceUiState extends WorkspaceState {
  currentWorkspaceId: string | null;
  members: WorkspaceMember[];
  inviteLink?: InviteLinkInfo;
}

const initialState: WorkspaceUiState = {
  workspaces: [],
  currentWorkspace: null,
  currentWorkspaceId: null,
  members: [],
  inviteLink: undefined,
  isLoading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspaceId(state, action: PayloadAction<string | null>) {
      state.currentWorkspaceId = action.payload;
    },
    resetWorkspaceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkspace = action.payload;
        if (!state.workspaces.find((w) => w.id === action.payload.id)) {
          state.workspaces.push(action.payload);
        }
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load workspace';
      })
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
      });
  },
});

export const { setCurrentWorkspaceId, resetWorkspaceState } = workspaceSlice.actions;

// Selectors
// Note: accept `any` for state to avoid importing RootState and to be compatible with useSelector typing.
export const selectWorkspaceState = (state: any) => state.workspace as WorkspaceUiState;
export const selectMembers = (state: any) => (state.workspace as WorkspaceUiState).members;
export const selectWorkspaceLoading = (state: any) => (state.workspace as WorkspaceUiState).isLoading;
export const selectWorkspaceError = (state: any) => (state.workspace as WorkspaceUiState).error;

export default workspaceSlice.reducer;
