import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { AnalyticsService } from '../../services/analyticsService';
import type { 
  AnalyticsState, 
  AnalyticsData, 
  FetchAnalyticsParams, 
  ExportAnalyticsParams 
} from '../../types/analytics.types';

// Initial state
const initialState: AnalyticsState = {
  data: {
    coreMetrics: {
      totalTasks: 0,
      completionRate: 0,
      velocity: 0,
      avgTaskDuration: 0,
      overdueTasks: 0,
    },
    teamMetrics: {
      totalMembers: 0,
      activeMembers: 0,
      topPerformers: [],
      workloadDistribution: [],
    },
    timeInsights: {
      peakHours: [],
      dailyActivity: [],
      weeklyTrends: [],
    },
    projectHealth: {
      bugRate: 0,
      reworkRate: 0,
      blockedTasks: 0,
      cycleTime: 0,
    },
  },
  filters: {
    period: 'month',
    dateRange: {
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    },
    chartType: 'line',
  },
  loading: false,
  error: null,
  lastFetch: null,
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (params: FetchAnalyticsParams, { rejectWithValue }) => {
    try {
      const apiParams = {
        period: params.period,
        startDate: params.startDate,
        endDate: params.endDate,
      };

      // Fetch main analytics data
      const analyticsResponse = params.id 
        ? await AnalyticsService.getSpaceAnalytics(params.id, apiParams)
        : await AnalyticsService.getWorkspaceAnalytics(params.workspaceId!, apiParams);

      // Fetch team performance data if space ID is provided
      let teamResponse = null;
      if (params.id) {
        try {
          teamResponse = await AnalyticsService.getTeamPerformance(params.id, apiParams);
        } catch (teamError) {
          console.warn('Team performance data not available:', teamError);
        }
      }

      // Transform API response to match component interface
      console.log('🔍 [Analytics Slice] Full API Response:', analyticsResponse);
      const analytics = (analyticsResponse as any)?.analytics || (analyticsResponse as any)?.data || analyticsResponse || {};
      console.log('🔍 [Analytics Slice] Extracted analytics object:', analytics);
      
      // Generate mock time-based data (replace with actual API data when available)
      const mockDailyActivity = Array.from({ length: 30 }, (_, i) => ({
        date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'MMM dd'),
        tasks: Math.floor(Math.random() * 20) + 5,
      }));

      const mockWeeklyTrends = Array.from({ length: 12 }, (_, i) => ({
        week: `Week ${i + 1}`,
        completed: Math.floor(Math.random() * 30) + 20,
        created: Math.floor(Math.random() * 35) + 25,
      }));

      const mockPeakHours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        activity: Math.floor(Math.random() * 50) + 10,
      }));

      const transformedData: AnalyticsData = {
        coreMetrics: {
          totalTasks: analytics.totalTasks || analytics.taskMetrics?.totalTasks || 0,
          completionRate: analytics.completionRate || analytics.taskMetrics?.completionRate || 0,
          velocity: teamResponse?.analytics?.teamVelocity || 0,
          avgTaskDuration: analytics.averageCompletionTime || analytics.timeMetrics?.averageCompletionTime || 0,
          overdueTasks: analytics.overdueTasks || analytics.taskMetrics?.overdueTasks || 0,
        },
        teamMetrics: {
          totalMembers: analytics.totalMembers || (analytics as any).teamMetrics?.totalMembers || 0,
          activeMembers: analytics.activeMembers || (analytics as any).teamMetrics?.activeMembers || 0,
          topPerformers: (teamResponse?.analytics as any)?.members?.slice(0, 5) || (analytics as any).teamMetrics?.memberPerformance?.slice(0, 5) || [],
          workloadDistribution: (teamResponse?.analytics as any)?.members || (analytics as any).teamMetrics?.workloadDistribution || [],
        },
        timeInsights: {
          peakHours: mockPeakHours,
          dailyActivity: mockDailyActivity,
          weeklyTrends: mockWeeklyTrends,
        },
        projectHealth: {
          bugRate: (analytics as any)?.qualityMetrics?.bugRate || 0,
          reworkRate: (analytics as any)?.qualityMetrics?.reworkRate || 0,
          blockedTasks: (analytics as any)?.qualityMetrics?.blockedTasks || 0,
          cycleTime: (analytics as any)?.qualityMetrics?.cycleTime || 0,
        },
      };

      return transformedData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics data');
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async (params: ExportAnalyticsParams, { rejectWithValue }) => {
    try {
      await AnalyticsService.exportAnalytics(params.id, params.format, {
        period: params.period,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return params.format;
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to export data as ${params.format}`);
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPeriod: (state, action) => {
      state.filters.period = action.payload;
    },
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setChartType: (state, action) => {
      state.filters.chartType = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      state.data = initialState.data;
      state.error = null;
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Export analytics
      .addCase(exportAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAnalytics.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  setPeriod,
  setDateRange,
  setChartType,
  clearError,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
