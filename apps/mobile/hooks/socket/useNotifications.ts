// hooks/useNotifications.ts

import { useEffect, useState } from 'react';
import { useNotificationSocket } from '../../contexts/SocketContext';
import type { Notification } from '../../types/dash.types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use the centralized notification socket from SocketContext
  const notificationSocket = useNotificationSocket();
  const socket = notificationSocket;
  const isConnected = socket?.connected || false;
  const emit = (event: string, data?: any) => socket?.emit(event, data);
  const on = (event: string, callback: (data?: any) => void) => socket?.on(event, callback);
  const off = (event: string) => socket?.off(event);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // On connection
    console.log('Connected to notification socket:', socket.id);

    // Fetch initial unread count
    emit('notifications:getUnreadCount', {});
    // Fetch recent notifications
    emit('notifications:getRecent', { limit: 10 });
  }, [socket, isConnected, emit]);

  // Listen to unread count
  useEffect(() => {
    if (!socket) return;

    const handleUnreadCount = ({ count }: { count: number }) => {
      setUnreadCount(count);
    };

    const handleRecentNotifications = ({ notifications: recents }: { notifications: Notification[] }) => {
      setNotifications(recents);
    };

    const handleNewNotification = ({ notification }: { notification: Notification }) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Register event listeners
    on('notifications:unreadCount', handleUnreadCount);
    on('notifications:recent', handleRecentNotifications);
    on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      off('notifications:unreadCount');
      off('notifications:recent');
      off('notification:new');
    };
  }, [socket, on, off]);

  const markAsRead = (id: string) => {
    if (socket && isConnected) {
      emit('notifications:markRead', { notificationId: id });
    }
  };

  return { notifications, unreadCount, markAsRead };
};
