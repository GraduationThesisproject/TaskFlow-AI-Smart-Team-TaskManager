import { useEffect, useCallback, useRef } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import type { RootState } from '../store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAction,
  clearReadNotifications,
  clearAllNotifications as clearAllNotificationsAction,
  clearError,
  addNotification,
  updateNotificationStatus,
} from '../store/slices/notificationSlice';
import { useSocketContext } from '../contexts/SocketContext';
import { useToast } from '../components/common/ToastProvider';

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

  // Socket integration
  const { 
    notificationSocket, 
    isConnected, 
    markNotificationAsRead: socketMarkAsRead,
    markAllNotificationsAsRead: socketMarkAllAsRead,
    getUnreadCount,
    getRecentNotifications
  } = useSocketContext();
  
  // Toast integration
  const toast = useToast();
  
  // Track processed notifications to prevent infinite loops
  const processedNotifications = useRef<Set<string>>(new Set());

  // Cleanup processed notifications periodically to prevent memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      processedNotifications.current.clear();
    }, 60000); // Clear every minute

    return () => clearInterval(interval);
  }, []);

  // Show toast notifications for new notifications
  useEffect(() => {
    if (!notifications.length) return;

    const latestNotification = notifications[0];
    if (!latestNotification || processedNotifications.current.has(latestNotification._id)) return;

    processedNotifications.current.add(latestNotification._id);

    // Show toast notification based on type
    switch (latestNotification.type) {
      case 'error':
        toast.error(latestNotification.message);
        break;
      case 'warning':
        toast.warning(latestNotification.message);
        break;
      case 'success':
        toast.success(latestNotification.message);
        break;
      default:
        toast.info(latestNotification.message);
    }
  }, [notifications, toast]);

  // Initialize socket-based notifications when connected
  useEffect(() => {
    if (!isConnected || !realTimeEnabled) return;

    console.log('🔌 Socket connected, initializing notification data');
    
    // Fetch initial data via socket
    getUnreadCount();
    getRecentNotifications(50);
  }, [isConnected, realTimeEnabled, getUnreadCount, getRecentNotifications]);

  const fetchNotificationsHandler = useCallback((params?: any) => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🔔 Fetching notifications from Redux...');
    dispatch(fetchNotifications(params));
  }, [dispatch, token, realTimeEnabled]);

  const markAsRead = useCallback((notificationId: string) => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('✅ Marking notification as read:', notificationId);
    
    // Use socket if connected, otherwise fall back to Redux action
    if (isConnected) {
      socketMarkAsRead(notificationId);
    } else {
      dispatch(markNotificationAsRead(notificationId));
    }
  }, [dispatch, token, realTimeEnabled, isConnected, socketMarkAsRead]);

  const markAllAsRead = useCallback(() => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('✅ Marking all notifications as read');
    
    // Use socket if connected, otherwise fall back to Redux action
    if (isConnected) {
      socketMarkAllAsRead();
    } else {
      dispatch(markAllNotificationsAsRead());
    }
  }, [dispatch, token, realTimeEnabled, isConnected, socketMarkAllAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🗑️ Deleting notification:', notificationId);
    dispatch(deleteNotificationAction(notificationId));
  }, [dispatch, token, realTimeEnabled]);

  const clearReadNotificationsHandler = useCallback(() => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing read notifications');
    dispatch(clearReadNotifications());
  }, [dispatch, token, realTimeEnabled]);

  const clearAllNotificationsHandler = useCallback(() => {
    if (!token || !realTimeEnabled) return;
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing all notifications');
    dispatch(clearAllNotificationsAction());
  }, [dispatch, token, realTimeEnabled]);

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initial REST sync; socket real-time updates are handled in notificationsSocketMiddleware
  useEffect(() => {
    if (token && realTimeEnabled) {
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
    clearAllNotifications: clearAllNotificationsHandler,
    clearError: clearErrorHandler,
  };
};
