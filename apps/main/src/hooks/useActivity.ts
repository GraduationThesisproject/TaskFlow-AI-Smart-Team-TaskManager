import { useEffect, useCallback, useMemo } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchRecentActivities,
  addActivity,
  clearActivities,
} from '../store/slices/activitySlice';
import type { ActivityItem } from '../types/store.types';
import type { FetchActivitiesParams, UseActivityReturn } from '../types/hooks.types';

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
