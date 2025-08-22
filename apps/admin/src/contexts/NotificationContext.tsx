import { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
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

export interface NotificationContextType {
  notifications: NotificationState['notifications'];
  unreadCount: NotificationState['unreadCount'];
  isLoading: NotificationState['isLoading'];
  error: NotificationState['error'];
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
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

    on('notification:new', (data: NotificationSocketEvents['notification:new']) => {
      dispatch(addNotification(data.notification));
    });

    on('notifications:list', (data: NotificationSocketEvents['notifications:list']) => {
      dispatch(setNotifications(data.notifications));
      dispatch(setUnreadCount(data.unreadCount));
    });

    on('notifications:unreadCount', (data: NotificationSocketEvents['notifications:unreadCount']) => {
      dispatch(setUnreadCount(data.count));
    });

    on('notifications:markRead', (data: NotificationSocketEvents['notifications:markRead']) => {
      dispatch(markAsReadAction(data.notificationId));
    });

    on('notifications:markAllRead', () => {
      dispatch(markAllAsReadAction());
    });

    on('notifications:delete', (data: NotificationSocketEvents['notifications:delete']) => {
      dispatch(removeNotificationAction(data.notificationId));
    });

    on('error', (data: NotificationSocketEvents['error']) => {
      dispatch(setError(data.message));
    });

    // Emit initial data request
    emit('notifications:getList', {});
    emit('notifications:getUnreadCount', {});

    return () => {
      off('notification:new');
      off('notifications:list');
      off('notifications:unreadCount');
      off('notifications:markRead');
      off('notifications:markAllRead');
      off('notifications:delete');
      off('error');
    };
  }, [isConnected, emit, on, off, dispatch]);

  const markAsRead = (notificationId: string) => {
    emit('notifications:markRead', { notificationId });
  };

  const markAllAsRead = () => {
    emit('notifications:markAllRead', {});
  };

  const deleteNotification = (notificationId: string) => {
    dispatch(removeNotificationAction(notificationId));
  };

  const clearError = () => {
    dispatch(setError(null));
  };

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
