import { useEffect, useCallback, useMemo } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchRecentActivities,
  addActivity,
  clearActivities,
  type ActivityItem
} from '../store/slices/activitySlice';

interface FetchActivitiesParams {
  limit?: number;
  page?: number;
  workspaceId?: string;
  projectId?: string;
  spaceId?: string;
  boardId?: string;
  userId?: string;
}

interface UseActivityReturn {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  count: number;
  total: number;
  lastFetched: number | null;
  fetchActivities: (params?: FetchActivitiesParams) => void;
  addActivity: (activity: Omit<ActivityItem, '_id' | 'createdAt' | 'updatedAt'>) => void;
  clearActivities: () => void;
  refetch: () => void;
}

export const useActivity = (autoFetch: boolean = true, params?: FetchActivitiesParams): UseActivityReturn => {
  const dispatch = useAppDispatch();
  const { 
    activities, 
    loading, 
    error, 
    count, 
    total, 
    lastFetched 
  } = useAppSelector(state => state.activity);
  const { token } = useAppSelector(state => state.auth);

  // Memoize params to prevent infinite loops
  const memoizedParams = useMemo(() => params, [
    params?.limit,
    params?.page,
    params?.workspaceId,
    params?.projectId,
    params?.spaceId,
    params?.boardId,
    params?.userId
  ]);

  const fetchActivities = useCallback((fetchParams?: FetchActivitiesParams) => {
    if (!token) return;
    
    const finalParams = { ...memoizedParams, ...fetchParams };
    dispatch(fetchRecentActivities(finalParams));
  }, [dispatch, token, memoizedParams]);

  const addActivityHandler = useCallback((activity: Omit<ActivityItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    dispatch(addActivity(activity));
  }, [dispatch]);

  const clearActivitiesHandler = useCallback(() => {
    if (env.ENABLE_DEBUG) {
      console.log('🧹 Clearing activities');
    }
    dispatch(clearActivities());
  }, [dispatch]);

  const refetch = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-fetch on mount if enabled and token is available
  useEffect(() => {
    if (autoFetch && token && !lastFetched) {
      fetchActivities();
    }
  }, [autoFetch, token, lastFetched, fetchActivities]);

  return {
    activities,
    loading,
    error,
    count,
    total,
    lastFetched,
    fetchActivities,
    addActivity: addActivityHandler,
    clearActivities: clearActivitiesHandler,
    refetch,
  };
};
