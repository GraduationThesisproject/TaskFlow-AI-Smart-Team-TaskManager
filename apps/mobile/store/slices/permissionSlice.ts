import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WorkspaceRole } from '../../types/workspace.types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Use axiosInstance which has the proper base URL configured
      const response = await axiosInstance.get(`/workspaces/${workspaceId}/permissions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to fetch permissions');
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
