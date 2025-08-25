import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  activeProjects: number;
  completionRate: number;
  projectCreationTrends: Array<{
    month: string;
    projects: number;
  }>;
  taskCompletionData: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  userGrowthData: Array<{
    month: string;
    signups: number;
  }>;
  topTeams: Array<{
    id: string;
    name: string;
    members: number;
    projects: number;
    activityScore: number;
  }>;
  systemPerformance: {
    serverUptime: number;
    apiResponseTime: number;
    databaseHealth: number;
  };
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  timeRange: string;
  lastUpdated: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
  timeRange: '6-months',
  lastUpdated: null
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch analytics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'analytics/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch system health');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async ({ timeRange, format }: { timeRange: string; format: 'csv' | 'pdf' | 'excel' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to export analytics');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<string>) => {
      state.timeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSystemPerformance: (state, action: PayloadAction<Partial<AnalyticsData['systemPerformance']>>) => {
      if (state.data) {
        state.data.systemPerformance = { ...state.data.systemPerformance, ...action.payload };
      }
    },
    refreshData: (state) => {
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch System Health
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        if (state.data) {
          state.data.systemPerformance = action.payload.systemPerformance;
        }
      })
      
      // Export Analytics
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setTimeRange,
  clearError,
  updateSystemPerformance,
  refreshData
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
