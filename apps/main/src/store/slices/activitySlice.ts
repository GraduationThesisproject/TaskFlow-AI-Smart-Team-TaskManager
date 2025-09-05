import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axios';
import type { 
  ActivityItem, 
  ActivitySliceState, 
  FetchActivitiesParams 
} from '../../types/store.types';

const initialState: ActivitySliceState = {
  activities: [],
  loading: false,
  error: null,
  lastFetched: null,
  count: 0,
  total: 0,
};

// Async thunk to fetch recent activities
export const fetchRecentActivities = createAsyncThunk<
  { activities: ActivityItem[]; count: number; total: number },
  FetchActivitiesParams | void
>('activity/fetchRecent', async (params = {}) => {
  const { 
    limit = 10, 
    page = 1,
    workspaceId,
    projectId,
    spaceId,
    boardId,
    userId
  } = params as FetchActivitiesParams;

  const response = await axiosInstance.get('/auth/activity', {
    params: {
      limit,
      page,
      workspaceId,
      projectId,
      spaceId,
      boardId,
      userId,
    },
  });
  
  const rawActivities = response.data.data.activities || [];
  const normalized = rawActivities.map((a: any) => {
    if (a && a.user && typeof a.user === 'object' && a.user.avatar && typeof a.user.avatar === 'object') {
      // Flatten File object to URL string
      return { ...a, user: { ...a.user, avatar: a.user.avatar.url || '' } };
    }
    return a;
  });

  return {
    activities: normalized,
    count: response.data.data.count ?? normalized.length,
    total: response.data.data.total ?? normalized.length
  };
});

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Omit<ActivityItem, '_id' | 'createdAt' | 'updatedAt'>>) => {
      const newActivity = {
        ...action.payload,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.activities = [newActivity, ...state.activities].slice(0, 100); // Keep only last 100 activities
      state.count += 1;
      state.total += 1;
    },
    clearActivities: (state) => {
      state.activities = [];
      state.lastFetched = null;
      state.count = 0;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.count = action.payload.count;
        state.total = action.payload.total;
        state.lastFetched = Date.now();
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities';
      });
  },
});

export const { addActivity, clearActivities } = activitySlice.actions;

// Selectors
export const selectRecentActivities = (state: any) => state.activity.activities;
export const selectActivityLoading = (state: any) => state.activity.loading;
export const selectActivityError = (state: any) => state.activity.error;
export const selectActivityCount = (state: any) => state.activity.count;
export const selectActivityTotal = (state: any) => state.activity.total;

export default activitySlice.reducer;
