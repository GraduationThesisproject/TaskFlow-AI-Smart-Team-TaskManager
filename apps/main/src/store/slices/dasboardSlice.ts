// store/slices/dashboardSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';  // Import the configured axios instance

interface DashboardState {
  workspaces: any[];
  highPriorityTasks: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  workspaces: [],
  highPriorityTasks: [],
  status: 'idle',
  error: null
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/dashboard/home/:id'); 
      // Use the configured axios instance
      return response.data;
    } catch (error: any) {
        throw error
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch dashboard data'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: () => initialState,
    // Add other synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.workspaces = action.payload.workspaces || [];
        state.highPriorityTasks = action.payload.highPriorityTasks || [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { resetDashboard } = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state: { dashboard: DashboardState }) => state.dashboard;
export const selectWorkspaces = (state: { dashboard: DashboardState }) => 
  state.dashboard.workspaces;
export const selectHighPriorityTasks = (state: { dashboard: DashboardState }) => 
  state.dashboard.highPriorityTasks;
export const selectDashboardStatus = (state: { dashboard: DashboardState }) => 
  state.dashboard.status;
export const selectDashboardError = (state: { dashboard: DashboardState }) => 
  state.dashboard.error;

export default dashboardSlice.reducer;