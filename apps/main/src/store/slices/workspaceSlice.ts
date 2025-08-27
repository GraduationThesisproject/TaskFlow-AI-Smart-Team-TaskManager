import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Space } from '../../types/task.types';
import { WorkspaceService, type InviteLinkInfo } from "../../services/D_workspaceService.ts";
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
    const response = await WorkspaceService.getWorkspaces();
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
    const response = await WorkspaceService.getWorkspaces();
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
    // API returns data with { workspace }
    return (response as any).workspace as Workspace;
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
      plan: 'free',
    });
    const ws: any = (response as any)?.workspace ?? response;
    return {
      ...ws,
      _id: ws?._id ?? ws?.id,
      id: ws?.id ?? (typeof ws?._id === 'object' ? String(ws._id) : ws?._id),
    };
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
  loading: boolean;
}



const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  spaces: [],
  selectedSpace: null,
  currentWorkspaceId:null,
  members: [],
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
      .addCase(inviteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to invite member';
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
        if (id) {
          state.workspaces = (state.workspaces || []).filter((w) => (w as any)._id !== id && (w as any).id !== id);
          if (state.currentWorkspace && ((state.currentWorkspace as any)._id === id || (state.currentWorkspace as any).id === id)) {
            state.currentWorkspace = null;
          }
          if (state.currentWorkspaceId === id) {
            state.currentWorkspaceId = null;
          }
        }
        state.error = null;
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete workspace';
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
  resetWorkspaceState,
} = workspaceSlice.actions;

// Selectors
// Note: accept `any` for state to avoid importing RootState and to be compatible with useSelector typing.
export const selectWorkspaceState = (state: any) => state.workspace as WorkspaceState;
export const selectMembers = (state: any) => (state.workspace as WorkspaceState).members;
export const selectWorkspaceLoading = (state: any) => (state.workspace as WorkspaceState).isLoading;
export const selectWorkspaceError = (state: any) => (state.workspace as WorkspaceState).error;

export default workspaceSlice.reducer;