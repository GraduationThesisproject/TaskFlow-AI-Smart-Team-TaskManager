import { useEffect, useCallback } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import type { RootState } from '../store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAction,
  clearReadNotifications,
  clearError,
} from '../store/slices/notificationSlice';

import type { UseNotificationsReturn } from '../types/dash.types';

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useAppDispatch();
  const { notifications, stats, loading, error } = useAppSelector((state: RootState) => state.notifications);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const realTimePref = useAppSelector((state: RootState) => state.auth.user?.preferences?.notifications?.realTime as any);
  const realTimeEnabled = (() => {
    if (realTimePref && typeof realTimePref === 'object') {
      try { return Object.values(realTimePref).some(Boolean); } catch { return true; }
    }
    return realTimePref ?? true;
  })();

  // Feature flag to disable notifications when backend is not available
  const NOTIFICATIONS_ENABLED = true;

  const fetchNotificationsHandler = useCallback((params?: any) => {
    if (!token || !NOTIFICATIONS_ENABLED || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🔔 Fetching notifications from Redux...');
    dispatch(fetchNotifications(params));
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled]);

  const markAsRead = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('✅ Marking notification as read:', notificationId);
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled]);

  const markAllAsRead = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('✅ Marking all notifications as read');
    dispatch(markAllNotificationsAsRead());
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled]);

  const deleteNotification = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🗑️ Deleting notification:', notificationId);
    dispatch(deleteNotificationAction(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled]);

  const clearReadNotificationsHandler = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing read notifications');
    dispatch(clearReadNotifications());
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled]);

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initial REST sync; socket real-time updates are handled in notificationsSocketMiddleware
  useEffect(() => {
    if (token && NOTIFICATIONS_ENABLED && realTimeEnabled) {
      fetchNotificationsHandler();
    }
  }, [token, realTimeEnabled, fetchNotificationsHandler]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications: fetchNotificationsHandler,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications: clearReadNotificationsHandler,
    clearError: clearErrorHandler,
  };
};
