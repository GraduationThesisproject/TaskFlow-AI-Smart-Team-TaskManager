import { useEffect, useCallback, useRef } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { addNotification, updateNotificationStatus } from '../../store/slices/notificationSlice';
import { pushNotificationService } from '../../services/pushNotificationService';
import type { RootState } from '../../store';

export interface UseRealTimeNotificationsReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnect: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => void;
  getRecentNotifications: (limit?: number) => void;
}

export const useRealTimeNotifications = (): UseRealTimeNotificationsReturn => {
  const dispatch = useAppDispatch();
  const { 
    notificationSocket, 
    isConnected, 
    isConnecting,
    connectionError,
    reconnect,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    getRecentNotifications
  } = useSocketContext();
  
  const token = useAppSelector((state: RootState) => state.auth.token);
  const realTimePref = useAppSelector((state: RootState) => state.auth.user?.preferences?.notifications?.realTime as any);
  
  const realTimeEnabled = (() => {
    if (realTimePref && typeof realTimePref === 'object') {
      try { 
        return Object.values(realTimePref).some(Boolean); 
      } catch { 
        return true; 
      }
    }
    return realTimePref ?? true;
  })();

  // Track processed notifications to prevent duplicate processing
  const processedNotifications = useRef<Set<string>>(new Set());

  // Handle new notifications from socket
  const handleNewNotification = useCallback(async (data: { notification: any }) => {
    const { notification } = data;
    
    // Skip if already processed
    if (processedNotifications.current.has(notification._id)) {
      return;
    }
    
    processedNotifications.current.add(notification._id);
    
    // Add to Redux store
    dispatch(addNotification(notification));
    
    // Show push notification if app is in background
    try {
      await pushNotificationService.scheduleLocalNotification({
        title: notification.title || 'New Notification',
        body: notification.message,
        data: {
          notificationId: notification._id,
          type: notification.type,
          screen: 'notifications',
        },
      });
    } catch (error) {
      console.error('❌ Failed to schedule push notification:', error);
    }
    
    console.log('🔔 Real-time notification received:', notification);
  }, [dispatch]);

  // Handle notification updates from socket
  const handleNotificationUpdate = useCallback((data: { notification: any }) => {
    const { notification } = data;
    dispatch(updateNotificationStatus(notification));
    console.log('📝 Real-time notification updated:', notification);
  }, [dispatch]);

  // Handle unread count updates
  const handleUnreadCount = useCallback((data: { count: number }) => {
    console.log('📊 Unread count updated:', data.count);
    // You can dispatch an action to update the unread count in Redux if needed
  }, []);

  // Handle recent notifications
  const handleRecentNotifications = useCallback((data: { notifications: any[] }) => {
    const { notifications } = data;
    notifications.forEach(notification => {
      if (!processedNotifications.current.has(notification._id)) {
        dispatch(addNotification(notification));
        processedNotifications.current.add(notification._id);
      }
    });
    console.log('📋 Recent notifications loaded:', notifications.length);
  }, [dispatch]);

  // Set up socket event listeners
  useEffect(() => {
    if (!notificationSocket || !isConnected || !realTimeEnabled || !token) return;

    console.log('🔌 Setting up real-time notification listeners');

    // Register event listeners
    notificationSocket.on('notification:new', handleNewNotification);
    notificationSocket.on('notification:updated', handleNotificationUpdate);
    notificationSocket.on('notification:unread_count', handleUnreadCount);
    notificationSocket.on('notification:recent', handleRecentNotifications);

    // Request initial data
    getUnreadCount();
    getRecentNotifications(50);

    return () => {
      notificationSocket.off('notification:new');
      notificationSocket.off('notification:updated');
      notificationSocket.off('notification:unread_count');
      notificationSocket.off('notification:recent');
    };
  }, [
    notificationSocket, 
    isConnected, 
    realTimeEnabled, 
    token,
    handleNewNotification,
    handleNotificationUpdate,
    handleUnreadCount,
    handleRecentNotifications,
    getUnreadCount,
    getRecentNotifications
  ]);

  // Cleanup processed notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      processedNotifications.current.clear();
    }, 300000); // Clear every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Socket-based notification actions
  const markAsRead = useCallback((notificationId: string) => {
    if (isConnected) {
      markNotificationAsRead(notificationId);
    }
  }, [isConnected, markNotificationAsRead]);

  const markAllAsRead = useCallback(() => {
    if (isConnected) {
      markAllNotificationsAsRead();
    }
  }, [isConnected, markAllNotificationsAsRead]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    reconnect,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getRecentNotifications,
  };
};
