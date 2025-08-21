import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceRole } from '../../types/workspace.types';

export interface PermissionState {
  currentUserRole: WorkspaceRole | null;
  workspacePermissions: Record<string, WorkspaceRole>;
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  currentUserRole: null,
  workspacePermissions: {},
  isLoading: false,
  error: null,
};

// Async thunk to fetch user permissions for a workspace
export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      // This would typically call an API to get user permissions
      // For now, we'll return a mock response
      const response = await fetch(`/api/workspaces/${workspaceId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch permissions');
    }
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setCurrentUserRole: (state, action: PayloadAction<WorkspaceRole | null>) => {
      state.currentUserRole = action.payload;
    },
    setWorkspacePermission: (state, action: PayloadAction<{ workspaceId: string; role: WorkspaceRole }>) => {
      state.workspacePermissions[action.payload.workspaceId] = action.payload.role;
    },
    clearPermissions: (state) => {
      state.currentUserRole = null;
      state.workspacePermissions = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUserRole = action.payload.role;
        state.workspacePermissions[action.payload.workspaceId] = action.payload.role;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentUserRole,
  setWorkspacePermission,
  clearPermissions,
  clearError,
} = permissionSlice.actions;

export default permissionSlice.reducer;
