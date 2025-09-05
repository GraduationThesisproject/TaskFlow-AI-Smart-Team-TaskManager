import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '../../services/apiService';

// Types
interface TestData {
  user?: any;
  workspaces?: any[];
  tasks?: any[];
  timestamp?: string;
}

interface TestState {
  data: TestData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: TestState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchMockData = createAsyncThunk(
  'test/fetchMockData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getMockData();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch data');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'test/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getUserProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const fetchWorkspaces = createAsyncThunk(
  'test/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getWorkspaces();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch workspaces');
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'test/fetchTasks',
  async (workspaceId?: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.getTasks(workspaceId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

// Slice
const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    clearData: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMockData
    builder
      .addCase(fetchMockData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMockData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchMockData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchUserProfile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = { ...state.data, user: action.payload };
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchWorkspaces
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = { ...state.data, workspaces: action.payload };
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchTasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = { ...state.data, tasks: action.payload };
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearData, setError, clearError } = testSlice.actions;
export default testSlice.reducer;
