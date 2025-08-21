import React, { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useSocket } from '../hooks/socket/useSocket';
import { env } from '../config/env';
import { 
  NotificationState,
  addNotification,
  setNotifications,
  setUnreadCount,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  removeNotification as removeNotificationAction,
  setError
} from '../store/slices/notificationSlice';
import { NotificationSocketEvents } from '../types/notification.types';
import { useAppDispatch, useAppSelector } from '../store';

interface NotificationContextType extends NotificationState {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  refreshNotifications: () => void;
  subscribeToTypes: (types: string[]) => void;
  unsubscribeFromTypes: (types: string[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  authToken: string;
}

export function NotificationProvider({ children, authToken }: NotificationProviderProps) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((rootState) => rootState.notifications);
  
  // Memoize socket options to prevent infinite re-renders
  const socketOptions = useMemo(() => ({
    url: env.SOCKET_URL,
    auth: { token: authToken },
    autoConnect: !!authToken,
  }), [authToken]);
  
  const { isConnected, emit, on, off } = useSocket(socketOptions);

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new notifications
    on('notification:new', (data: NotificationSocketEvents['notification:new']) => {
      dispatch(addNotification(data.notification));
    });

    // Listen for unread count updates
    on('notifications:unreadCount', (data: NotificationSocketEvents['notifications:unreadCount']) => {
      dispatch(setUnreadCount(data.count));
    });

    // Listen for marked as read updates
    on('notifications:marked-read', (data: NotificationSocketEvents['notifications:marked-read']) => {
      dispatch(markAsReadAction(data.notificationId));
    });

    // Listen for all marked as read
    on('notifications:all-marked-read', () => {
      dispatch(markAllAsReadAction());
    });

    // Listen for recent notifications
    on('notifications:recent', (data: NotificationSocketEvents['notifications:recent']) => {
      dispatch(setNotifications(data.notifications));
    });

    // Listen for errors
    on('error', (data: NotificationSocketEvents['error']) => {
      dispatch(setError(data.message));
    });

    // Get initial data
    emit('notifications:getUnreadCount', {});
    emit('notifications:getRecent', { limit: 50 });

    return () => {
      off('notification:new');
      off('notifications:unreadCount');
      off('notifications:marked-read');
      off('notifications:all-marked-read');
      off('notifications:recent');
      off('error');
    };
  }, [isConnected, emit, on, off]);

  const markAsRead = (notificationId: string) => {
    emit('notifications:markRead', { notificationId });
  };

  const markAllAsRead = () => {
    emit('notifications:markAllRead', {});
  };

  const deleteNotification = (notificationId: string) => {
    dispatch(removeNotificationAction(notificationId));
  };

  const refreshNotifications = () => {
    emit('notifications:getRecent', { limit: 50 });
  };

  const subscribeToTypes = (types: string[]) => {
    emit('notifications:subscribe', { types });
  };

  const unsubscribeFromTypes = (types: string[]) => {
    emit('notifications:unsubscribe', { types });
  };

  const value: NotificationContextType = {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    subscribeToTypes,
    unsubscribeFromTypes,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
