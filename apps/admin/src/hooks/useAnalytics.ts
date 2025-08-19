import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { Analytics, DateRange } from '../types';

export const useAnalytics = () => {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector((state) => state.analytics);

  const fetchOverview = useCallback(async (dateRange?: DateRange) => {
    // Implement fetch overview logic
    console.log('Fetch overview with date range:', dateRange);
  }, [dispatch]);

  const fetchUserStats = useCallback(async (dateRange?: DateRange) => {
    // Implement fetch user stats logic
    console.log('Fetch user stats with date range:', dateRange);
  }, [dispatch]);

  const fetchWorkspaceStats = useCallback(async (dateRange?: DateRange) => {
    // Implement fetch workspace stats logic
    console.log('Fetch workspace stats with date range:', dateRange);
  }, [dispatch]);

  const fetchTaskStats = useCallback(async (dateRange?: DateRange) => {
    // Implement fetch task stats logic
    console.log('Fetch task stats with date range:', dateRange);
  }, [dispatch]);

  return {
    ...analytics,
    fetchOverview,
    fetchUserStats,
    fetchWorkspaceStats,
    fetchTaskStats,
  };
};
