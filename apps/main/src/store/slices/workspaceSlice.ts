import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Workspace, Space } from '../../types/task.types';
import { WorkspaceService } from '../../services/workspaceService';
import { SpaceService } from '../../services/spaceService';

// Async thunks
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

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  spaces: Space[];
  selectedSpace: Space | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  loading: false,
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch workspace
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
      // Fetch spaces by workspace
      .addCase(fetchSpacesByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces = action.payload;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
      })
      // Fetch space
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSpace = action.payload;
        state.error = null;
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch space';
      });
  },
});

export const {
  setSelectedSpace,
  clearWorkspaceData,
  setLoading,
  clearError,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
