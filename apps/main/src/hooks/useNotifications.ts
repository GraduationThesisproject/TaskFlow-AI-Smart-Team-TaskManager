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
  clearAllNotifications,
  clearError,
  addNotification,
  updateNotificationStatus,
} from '../store/slices/notificationSlice';
import { useSocketContext } from '../contexts/SocketContext';
import { useToast } from './useToast';
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
  const { notificationSocket, isConnected, on, off, emit } = useSocketContext();
  
  // Toast integration
  const toast = useToast();

  // Track processed notifications to prevent infinite loops
  const processedNotifications = useRef<Set<string>>(new Set());

  // Cleanup processed notifications periodically to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedNotifications.current.size > 100) {
        // Keep only the last 50 processed notifications
        const notificationsArray = Array.from(processedNotifications.current);
        processedNotifications.current = new Set(notificationsArray.slice(-50));
      }
    }, 30000); // Clean up every 30 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  // Feature flag to disable notifications when backend is not available
  const NOTIFICATIONS_ENABLED = true;

  // Watch for new notifications in Redux and show toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Skip if already processed
      if (processedNotifications.current.has(latestNotification._id)) {
        return;
      }
      
      // Check if this is a new notification (created in the last few seconds)
      const isRecent = new Date(latestNotification.createdAt).getTime() > Date.now() - 10000; // 10 seconds
      
      if (isRecent && !latestNotification.isRead) {
        // Mark as processed
        processedNotifications.current.add(latestNotification._id);
        
        // Show toast for new notification based on type
        switch (latestNotification.type) {
          case 'error':
            toast.error(latestNotification.message, latestNotification.title);
            break;
          case 'warning':
            toast.warning(latestNotification.message, latestNotification.title);
            break;
          case 'success':
            toast.success(latestNotification.message, latestNotification.title);
            break;
          default:
            toast.info(latestNotification.message, latestNotification.title);
        }
      }
    }
  }, [notifications, toast]);

  // Socket event handlers
  useEffect(() => {
    if (!notificationSocket || !isConnected || !realTimeEnabled) return;

    console.log('🔌 Connected to notification socket:', notificationSocket.id);

    // Fetch initial data via socket
    emit('notifications:getUnreadCount', {});
    emit('notifications:getRecent', { limit: 50 });

    const handleRecentNotifications = ({ notifications: recents }: { notifications: any[] }) => {
      // Update Redux store with socket data
      recents.forEach(notification => {
        dispatch(addNotification(notification));
      });
    };

    const handleNewNotification = ({ notification }: { notification: any }) => {
      // Add to Redux store
      dispatch(addNotification(notification));
      
      // Show toast notification based on type
      switch (notification.type) {
        case 'error':
          toast.error(notification.message, notification.title);
          break;
        case 'warning':
          toast.warning(notification.message, notification.title);
          break;
        case 'success':
          toast.success(notification.message, notification.title);
          break;
        default:
          toast.info(notification.message, notification.title);
      }
    };

    const handleNotificationUpdate = ({ notification }: { notification: any }) => {
      dispatch(updateNotificationStatus(notification));
    };

    const handleWorkspaceCreated = ({ workspace }: { workspace: any }) => {
      // Show toast for workspace creation
      toast.success(`Successfully created workspace "${workspace.name}"`, 'Workspace Created');
    };

    // Register socket event listeners
    on('notifications:recent', handleRecentNotifications);
    on('notification:new', handleNewNotification);
    on('notification:updated', handleNotificationUpdate);
    on('workspace:created', handleWorkspaceCreated);

    return () => {
      off('notifications:recent');
      off('notification:new');
      off('notification:updated');
      off('workspace:created');
    };
  }, [notificationSocket, isConnected, realTimeEnabled, on, off, emit, dispatch, toast]);

  const fetchNotificationsHandler = useCallback((params?: any) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (realTimeEnabled && notificationSocket && isConnected) {
      // Use socket for real-time data
      emit('notifications:getRecent', { limit: params?.limit || 50 });
    } else {
      // Fallback to HTTP
      if (env.ENABLE_DEBUG) console.log('🔔 Fetching notifications via HTTP...');
      dispatch(fetchNotifications(params));
    }
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const markAsRead = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) console.log('✅ Marking notification as read:', notificationId);
    
    // Update via both socket and HTTP for redundancy
    if (realTimeEnabled && notificationSocket && isConnected) {
      emit('notifications:markRead', { notificationId });
    }
    
    // Always update Redux store
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const markAllAsRead = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) console.log('✅ Marking all notifications as read');
    
    // Update via both socket and HTTP for redundancy
    if (realTimeEnabled && notificationSocket && isConnected) {
      emit('notifications:markAllRead', {});
    }
    
    dispatch(markAllNotificationsAsRead());
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const deleteNotification = useCallback((notificationId: string) => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) console.log('🗑️ Deleting notification:', notificationId);
    
    // Update via both socket and HTTP for redundancy
    if (realTimeEnabled && notificationSocket && isConnected) {
      emit('notifications:delete', { notificationId });
    }
    
    dispatch(deleteNotificationAction(notificationId));
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const clearReadNotificationsHandler = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing read notifications');
    
    // Update via both socket and HTTP for redundancy
    if (realTimeEnabled && notificationSocket && isConnected) {
      emit('notifications:clearRead', {});
    }
    
    dispatch(clearReadNotifications());
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const clearAllNotificationsHandler = useCallback(() => {
    if (!token || !NOTIFICATIONS_ENABLED) return;
    
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing all notifications');
    
    // Update via both socket and HTTP for redundancy
    if (realTimeEnabled && notificationSocket && isConnected) {
      emit('notifications:clearAll', {});
    }
    
    dispatch(clearAllNotifications());
  }, [dispatch, token, NOTIFICATIONS_ENABLED, realTimeEnabled, notificationSocket, isConnected, emit]);

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initial sync - prefer socket if available, fallback to HTTP
  useEffect(() => {
    if (token && NOTIFICATIONS_ENABLED) {
      if (realTimeEnabled && notificationSocket && isConnected) {
        // Socket will handle initial data fetch
        console.log('🔌 Using socket for initial notification sync');
      } else {
        // Fallback to HTTP
        console.log('🌐 Using HTTP for initial notification sync');
        fetchNotificationsHandler();
      }
    }
  }, [token, realTimeEnabled, notificationSocket, isConnected]); // Remove fetchNotificationsHandler dependency

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
