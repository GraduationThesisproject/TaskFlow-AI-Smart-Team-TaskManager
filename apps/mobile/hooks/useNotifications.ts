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
  clearWorkspaceNotifications,
  clearError,
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

  // Auto-clear old workspace creation notifications on app startup
  useEffect(() => {
    if (!notifications.length) return;

    // Find and auto-mark ALL workspace creation notifications as read (not just old ones)
    const workspaceCreationNotifications = notifications.filter(notification => 
      notification.title === 'Workspace Created' || 
      notification.message?.includes('Successfully created workspace') ||
      notification.message?.includes('was created successfully')
    );

    // Mark ALL workspace creation notifications as read immediately
    workspaceCreationNotifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
    });
  }, [notifications, markAsRead]);

  // Auto-clear old workspace status notifications (archived/restored) on app startup
  useEffect(() => {
    if (!notifications.length) return;

    // Find workspace status notifications that are older than 1 hour
    const workspaceStatusNotifications = notifications.filter(notification => {
      const isWorkspaceStatus = 
        notification.title === 'Workspace restored' || 
        notification.title === 'Workspace archived' ||
        notification.type === 'workspace_restored' ||
        notification.type === 'workspace_archived';
      
      if (!isWorkspaceStatus) return false;
      
      // Check if notification is older than 1 hour
      const notificationTime = new Date(notification.createdAt).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return notificationTime < oneHourAgo;
    });

    // Clear old workspace status notifications
    if (workspaceStatusNotifications.length > 0) {
      console.log('🧹 Clearing old workspace status notifications:', workspaceStatusNotifications.length);
      dispatch(clearWorkspaceNotifications());
    }
  }, [notifications, dispatch]);

  // Show toast notifications for new notifications (excluding workspace creation notifications)
  useEffect(() => {
    if (!notifications.length) return;

    const latestNotification = notifications[0];
    if (!latestNotification || processedNotifications.current.has(latestNotification._id)) return;

    // Skip workspace creation notifications to prevent duplicate success messages
    const isWorkspaceCreationNotification = 
      latestNotification.title === 'Workspace Created' || 
      latestNotification.title === 'Workspace created' ||
      latestNotification.message?.includes('Successfully created workspace') ||
      latestNotification.message?.includes('was created successfully') ||
      latestNotification.message?.includes('workspace') && latestNotification.message?.includes('created') ||
      latestNotification.type === 'workspace_created' ||
      latestNotification.message?.toLowerCase().includes('workspace') && latestNotification.message?.toLowerCase().includes('created');
    
    if (isWorkspaceCreationNotification) {
      processedNotifications.current.add(latestNotification._id);
      // Auto-mark workspace creation notifications as read to prevent them from showing again
      markAsRead(latestNotification._id);
      return;
    }

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
      
      // Clear any existing workspace creation notifications to prevent them from showing on app start
      setTimeout(() => {
        const state = store.getState() as any;
        const notifications = state.notifications.notifications || [];
        const workspaceCreationNotifications = notifications.filter((n: any) => {
          const isWorkspaceCreation = 
            n.title === 'Workspace Created' || 
            n.title === 'Workspace created' ||
            n.message?.includes('Successfully created workspace') ||
            n.message?.includes('was created successfully') ||
            n.message?.includes('workspace') && n.message?.includes('created') ||
            n.type === 'workspace_created' ||
            n.message?.toLowerCase().includes('workspace') && n.message?.toLowerCase().includes('created');
          return isWorkspaceCreation;
        });
        
        if (workspaceCreationNotifications.length > 0) {
          console.log('🗑️ Clearing workspace creation notifications on app start:', workspaceCreationNotifications.length);
          workspaceCreationNotifications.forEach((notification: any) => {
            dispatch(deleteNotificationAction(notification._id));
          });
        }
      }, 1000); // Small delay to ensure notifications are loaded
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