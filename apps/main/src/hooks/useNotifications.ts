import { useEffect, useCallback } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAction,
  clearReadNotifications,
  clearError
} from '../store/slices/notificationSlice';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientId: string;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: (params?: any) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearReadNotifications: () => void;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useAppDispatch();
  const { notifications, stats, loading, error } = useAppSelector(state => state.notifications);
  const { token } = useAppSelector(state => state.auth);

  // Feature flag to disable notifications when backend is not available
  const NOTIFICATIONS_ENABLED = true;

  const fetchNotificationsHandler = useCallback((params?: any) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) {
      console.log('🔔 Fetching notifications from Redux...');
    }
    dispatch(fetchNotifications(params));
  }, [dispatch, token, NOTIFICATIONS_ENABLED]);

  const markAsRead = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) {
      console.log('✅ Marking notification as read:', notificationId);
    }
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED]);

  const markAllAsRead = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) {
      console.log('✅ Marking all notifications as read');
    }
    dispatch(markAllNotificationsAsRead());
  }, [dispatch, token, NOTIFICATIONS_ENABLED]);

  const deleteNotification = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) {
      console.log('🗑️ Deleting notification:', notificationId);
    }
    dispatch(deleteNotificationAction(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED]);

  const clearReadNotificationsHandler = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) {
      console.log('🧹 Clearing read notifications');
    }
    dispatch(clearReadNotifications());
  }, [dispatch, token, NOTIFICATIONS_ENABLED]);

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (token && NOTIFICATIONS_ENABLED) {
      fetchNotificationsHandler();
    }
  }, [token, fetchNotificationsHandler]);

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
