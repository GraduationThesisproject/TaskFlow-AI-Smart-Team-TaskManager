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
    const response = await SpaceService.getSpacesByWorkspace(workspaceId);
    return response.data || [];
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
    const response = await SpaceService.archiveSpace(spaceId);
    return response.data;
  }
);

export const unarchiveSpace = createAsyncThunk(
  'spaces/unarchiveSpace',
  async (spaceId: string) => {
    const response = await SpaceService.unarchiveSpace(spaceId);
    return response.data;
  }
);

// Initial state
const initialState: SpaceState = {
  spaces: [],
  currentSpace: null,
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
        // The response might have a space property or be the space directly
        const responseData = action.payload as any;
        state.currentSpace = responseData.space || responseData;
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
        state.spaces = action.payload;
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
      });
    
    // Create space
    builder
      .addCase(createSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces.push(action.payload);
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
        const index = state.spaces.findIndex(space => space._id === action.payload._id);
        if (index !== -1) {
          state.spaces[index] = action.payload;
        }
        if (state.currentSpace?._id === action.payload._id) {
          state.currentSpace = action.payload;
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
    
    // Archive space
    builder
      .addCase(archiveSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveSpace.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.spaces.findIndex(space => space._id === action.payload._id);
        if (index !== -1) {
          state.spaces[index] = { ...state.spaces[index], ...action.payload };
        }
        if (state.currentSpace?._id === action.payload._id) {
          state.currentSpace = { ...state.currentSpace, ...action.payload } as any;
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
        const index = state.spaces.findIndex(space => space._id === action.payload._id);
        if (index !== -1) {
          state.spaces[index] = { ...state.spaces[index], ...action.payload };
        }
        if (state.currentSpace?._id === action.payload._id) {
          state.currentSpace = { ...state.currentSpace, ...action.payload } as any;
        }
      })
      .addCase(unarchiveSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unarchive space';
      });
    
    // Members: get list
    builder
      .addCase(getSpaceMembers.pending, (state) => {
        state.error = null;
      })
      .addCase(getSpaceMembers.fulfilled, (state, action) => {
        const payload: any = action.payload;
        console.log('=== GET SPACE MEMBERS REDUCER ===');
        console.log('Full action:', action);
        console.log('Payload:', payload);
        console.log('Payload data:', payload?.data);
        console.log('Payload members:', payload?.members);
        
        const members = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.members)
          ? payload.members
          : [];
        
        console.log('Extracted members:', members);
        console.log('Members count:', members.length);
        
        if (state.currentSpace) {
          (state.currentSpace as any).members = members;
          console.log('Updated currentSpace.members');
        }
        console.log('=== END GET SPACE MEMBERS REDUCER ===');
      })
      .addCase(getSpaceMembers.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load space members';
      });
    
    // Members: add one
    builder
      .addCase(addSpaceMember.pending, (state) => {
        state.error = null;
      })
      .addCase(addSpaceMember.fulfilled, (state, action) => {
        const payload: any = action.payload;
        console.log('=== ADD SPACE MEMBER REDUCER ===');
        console.log('Payload:', payload);
        console.log('Payload data:', payload?.data);
        console.log('Payload member:', payload?.member);
        
        // The backend only returns success message, not the member data
        // We need to refresh the space members to get the updated list
        console.log('Backend only returns success message, will refresh members');
        console.log('=== END ADD SPACE MEMBER REDUCER ===');
      })
      .addCase(addSpaceMember.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add space member';
      });
    
    // Members: remove one
    builder
      .addCase(removeSpaceMember.pending, (state) => {
        state.error = null;
      })
      .addCase(removeSpaceMember.fulfilled, (state, action) => {
        const { memberId } = action.payload as any;
        console.log('=== REMOVE SPACE MEMBER REDUCER ===');
        console.log('Member ID to remove (user ID):', memberId);
        if (!memberId) {
          console.log('No member ID provided');
          return;
        }
        if (state.currentSpace && Array.isArray((state.currentSpace as any).members)) {
          const membersBefore = (state.currentSpace as any).members.length;
          console.log('Members count before removal:', membersBefore);
          (state.currentSpace as any).members = (state.currentSpace as any).members.filter(
            (m: any) => {
              // Remove by user ID, not space membership record ID
              const userId = String(m?.user?._id || m?.user?.id || '');
              const shouldKeep = userId !== String(memberId);
              console.log(`Member ${userId} (${m?.user?.name || m?.name}): ${shouldKeep ? 'KEEP' : 'REMOVE'}`);
              return shouldKeep;
            }
          );
          const membersAfter = (state.currentSpace as any).members.length;
          console.log('Members count after removal:', membersAfter);
        }
        console.log('=== END REMOVE SPACE MEMBER REDUCER ===');
      })
      .addCase(removeSpaceMember.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove space member';
      });
  }
});

// Export actions
export const {
  setCurrentSpace,
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

export const selectArchivedSpaces = (state: { spaces: SpaceState }) => {
  return state.spaces.spaces.filter(space => space.isArchived);
};

export const selectSpacesByWorkspaceAndStatus = (state: { spaces: SpaceState }, workspaceId: string, status: 'active' | 'archived') => {
  return state.spaces.spaces.filter(space => 
    space.workspace === workspaceId && 
    (status === 'active' ? !space.isArchived : space.isArchived)
  );
};
