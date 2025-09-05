import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Space, 
  SpaceState 
} from '../../types/space.types';
import { SpaceService } from '../../services/spaceService';

// Async thunks for API calls
export const fetchSpace = createAsyncThunk(
  'spaces/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    return response.data;
  }
);

export const fetchSpacesByWorkspace = createAsyncThunk(
  'spaces/fetchSpacesByWorkspace',
  async (workspaceId: string) => {
    try {
      const response = await SpaceService.getSpacesByWorkspace(workspaceId);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }
);

export const createSpace = createAsyncThunk(
  'spaces/createSpace',
  async (spaceData: any) => {
    const response = await SpaceService.createSpace(spaceData);
    return response.data;
  }
);

export const updateSpace = createAsyncThunk(
  'spaces/updateSpace',
  async ({ id, spaceData }: { id: string; spaceData: any }) => {
    const response = await SpaceService.updateSpace(id, spaceData);
    return response.data;
  }
);

export const deleteSpace = createAsyncThunk(
  'spaces/deleteSpace',
  async (spaceId: string) => {
    await SpaceService.deleteSpace(spaceId);
    return spaceId;
  }
);

export const getSpaceMembers = createAsyncThunk(
  'spaces/getSpaceMembers',
  async (spaceId: string) => {
    const response = await SpaceService.getSpaceMembers(spaceId);
    return response.data || [];
  }
);

export const addSpaceMember = createAsyncThunk(
  'spaces/addSpaceMember',
  async ({ spaceId, userId, role }: { spaceId: string; userId: string; role: string }) => {
    const response = await SpaceService.addSpaceMember(spaceId, userId, role);
    return response.data;
  }
);

export const removeSpaceMember = createAsyncThunk(
  'spaces/removeSpaceMember',
  async ({ spaceId, memberId }: { spaceId: string; memberId: string }) => {
    await SpaceService.removeSpaceMember(spaceId, memberId);
    return { spaceId, memberId };
  }
);

export const archiveSpace = createAsyncThunk(
  'spaces/archiveSpace',
  async (spaceId: string) => {
    const response = await SpaceService.updateSpace(spaceId, { isArchived: true });
    return response.data;
  }
);

export const unarchiveSpace = createAsyncThunk(
  'spaces/unarchiveSpace',
  async (spaceId: string) => {
    const response = await SpaceService.updateSpace(spaceId, { isArchived: false });
    return response.data;
  }
);

export const permanentDeleteSpace = createAsyncThunk(
  'spaces/permanentDeleteSpace',
  async (spaceId: string) => {
    const response = await SpaceService.permanentDeleteSpace(spaceId);
    return { spaceId, message: response.message };
  }
);

// Initial state
const initialState: SpaceState = {
  spaces: [],
  currentSpace: null,
  currentWorkspaceId: null,
  loading: false,
  error: null,
  socketConnected: false
};

// Space slice
const spaceSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    // Set current space
    setCurrentSpace: (state, action: PayloadAction<Space | null>) => {
      state.currentSpace = action.payload;
    },
    
    // Clear loading state
    clearLoading: (state) => {
      state.loading = false;
      state.error = null;
    },
    
    // Clear spaces data
    clearSpaces: (state) => {
      state.spaces = [];
      state.currentWorkspaceId = null;
      state.loading = false;
      state.error = null;
    },
    
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Update space in real-time (for socket events)
    updateSpaceRealTime: (state, action: PayloadAction<Space>) => {
      const index = state.spaces.findIndex(space => space._id === action.payload._id);
      if (index !== -1) {
        state.spaces[index] = action.payload;
      }
      if (state.currentSpace?._id === action.payload._id) {
        state.currentSpace = action.payload;
      }
    },
    
    // Add space in real-time (for socket events)
    addSpaceRealTime: (state, action: PayloadAction<Space>) => {
      state.spaces.push(action.payload);
    },
    
    // Remove space in real-time (for socket events)
    removeSpaceRealTime: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space._id !== action.payload);
      if (state.currentSpace?._id === action.payload) {
        state.currentSpace = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch space
    builder
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns ApiResponse<Space> with data.space property
        const responseData = action.payload as any;
        state.currentSpace = responseData?.data?.space || responseData?.space;
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch space';
      });
    
    // Fetch spaces by workspace
    builder
      .addCase(fetchSpacesByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        // Backend sendResponse structure: { success, message, timestamp, data: { spaces: [...], count: number } }
        // So we need to extract action.payload.data.spaces
        const spacesData = action.payload?.data?.spaces || action.payload?.spaces || action.payload?.data || action.payload || [];
        state.spaces = Array.isArray(spacesData) ? spacesData : [];
        // Store the workspace ID to track which workspace these spaces belong to
        state.currentWorkspaceId = action.meta.arg;
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
        // Clear current workspace ID on error to allow retry
        state.currentWorkspaceId = null;
      });
    
    // Create space
    builder
      .addCase(createSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns ApiResponse<Space> with data.space property
        const newSpace = action.payload?.data?.space || action.payload?.space;
        if (newSpace) {
          state.spaces.push(newSpace);
        }
      })
      .addCase(createSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create space';
      });
    
    // Update space
    builder
      .addCase(updateSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSpace.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns ApiResponse<Space> with data.space property
        const updatedSpace = action.payload?.data?.space || action.payload?.space;
        if (updatedSpace) {
          const index = state.spaces.findIndex(space => space._id === updatedSpace._id);
          if (index !== -1) {
            state.spaces[index] = updatedSpace;
          }
          if (state.currentSpace?._id === updatedSpace._id) {
            state.currentSpace = updatedSpace;
          }
        }
      })
      .addCase(updateSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update space';
      });
    
         // Delete space
     builder
       .addCase(deleteSpace.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(deleteSpace.fulfilled, (state, action) => {
         state.loading = false;
         state.spaces = state.spaces.filter(space => space._id !== action.payload);
         if (state.currentSpace?._id === action.payload) {
           state.currentSpace = null;
         }
       })
       .addCase(deleteSpace.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to delete space';
       });
     
     // Get space members
     builder
       .addCase(getSpaceMembers.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(getSpaceMembers.fulfilled, (state, action) => {
         state.loading = false;
         // Handle space members response
         const membersData = action.payload?.data || action.payload || [];
         // You might want to store members in a separate state property
         // For now, we'll just clear the error
       })
       .addCase(getSpaceMembers.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to fetch space members';
       });
     
     // Add space member
     builder
       .addCase(addSpaceMember.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(addSpaceMember.fulfilled, (state, action) => {
         state.loading = false;
         // Handle adding space member
         // You might want to update the space's member list
       })
       .addCase(addSpaceMember.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to add space member';
       });
     
     // Remove space member
     builder
       .addCase(removeSpaceMember.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(removeSpaceMember.fulfilled, (state, action) => {
         state.loading = false;
         // Handle removing space member
         // You might want to update the space's member list
       })
       .addCase(removeSpaceMember.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to remove space member';
       });
     
     // Archive space
     builder
       .addCase(archiveSpace.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
             .addCase(archiveSpace.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Archive space fulfilled:', { payload: action.payload, data: action.payload?.data });
        const updatedSpace = action.payload?.data?.space || action.payload?.space;
        if (updatedSpace) {
          console.log('Updating space in state:', { spaceId: updatedSpace._id, isArchived: updatedSpace.isArchived });
          const index = state.spaces.findIndex(space => space._id === updatedSpace._id);
          if (index !== -1) {
            state.spaces[index] = updatedSpace;
            console.log('Space updated in array at index:', index);
          }
          if (state.currentSpace?._id === updatedSpace._id) {
            state.currentSpace = updatedSpace;
            console.log('Current space updated');
          }
        } else {
          console.warn('No updated space data found in archive response');
        }
      })
       .addCase(archiveSpace.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to archive space';
       });
     
     // Unarchive space
     builder
       .addCase(unarchiveSpace.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
             .addCase(unarchiveSpace.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Unarchive space fulfilled:', { payload: action.payload, data: action.payload?.data });
        const updatedSpace = action.payload?.data?.space || action.payload?.space;
        if (updatedSpace) {
          console.log('Updating space in state:', { spaceId: updatedSpace._id, isArchived: updatedSpace.isArchived });
          const index = state.spaces.findIndex(space => space._id === updatedSpace._id);
          if (index !== -1) {
            state.spaces[index] = updatedSpace;
            console.log('Space updated in array at index:', index);
          }
          if (state.currentSpace?._id === updatedSpace._id) {
            state.currentSpace = updatedSpace;
            console.log('Current space updated');
          }
        } else {
          console.warn('No updated space data found in unarchive response');
        }
      })
             .addCase(unarchiveSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unarchive space';
      });
     
     // Permanent delete space
     builder
       .addCase(permanentDeleteSpace.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(permanentDeleteSpace.fulfilled, (state, action) => {
         state.loading = false;
         const { spaceId } = action.payload;
         // Remove the space from the state
         state.spaces = state.spaces.filter(space => space._id !== spaceId);
         if (state.currentSpace?._id === spaceId) {
           state.currentSpace = null;
         }
       })
       .addCase(permanentDeleteSpace.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to permanently delete space';
       });
  }
});

// Export actions
export const {
  setCurrentSpace,
  clearLoading,
  clearSpaces,
  setSocketConnected,
  updateSpaceRealTime,
  addSpaceRealTime,
  removeSpaceRealTime
} = spaceSlice.actions;

// Export reducer
export default spaceSlice.reducer;

// Selectors
export const selectSpaces = (state: { spaces: SpaceState }) => state.spaces.spaces;
export const selectCurrentSpace = (state: { spaces: SpaceState }) => state.spaces.currentSpace;
export const selectSpaceLoading = (state: { spaces: SpaceState }) => state.spaces.loading;
export const selectSpaceError = (state: { spaces: SpaceState }) => state.spaces.error;
export const selectSpaceSocketConnected = (state: { spaces: SpaceState }) => state.spaces.socketConnected;

// Computed selectors
export const selectSpacesByWorkspace = (state: { spaces: SpaceState }, workspaceId: string) => {
  return state.spaces.spaces.filter(space => space.workspace === workspaceId);
};

export const selectActiveSpaces = (state: { spaces: SpaceState }) => {
  return state.spaces.spaces.filter(space => space.isActive && !space.isArchived);
};
