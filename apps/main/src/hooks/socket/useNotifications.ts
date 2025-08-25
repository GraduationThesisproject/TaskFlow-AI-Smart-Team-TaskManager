// hooks/useNotifications.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '../../types/dash.types';


export const useNotifications = (token: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io('http://localhost:3001', {
      auth: { token },
    });

    // On connection
    socket.on('connect', () => {
      console.log('Connected to notification socket:', socket.id);

      // Fetch initial unread count
      socket.emit('notifications:getUnreadCount');
      // Fetch recent notifications
      socket.emit('notifications:getRecent', { limit: 10 });
    });

    // Listen to unread count
    socket.on('notifications:unreadCount', ({ count }) => {
      setUnreadCount(count);
    });

    // Listen to recent notifications
    socket.on('notifications:recent', ({ notifications: recents }) => {
      setNotifications(recents);
    });

    // Listen to new notifications
    socket.on('notification:new', ({ notification }) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const markAsRead = (id: string) => {
    const socket: any = io('http://localhost:3001', { auth: { token } });
    socket.emit('notifications:markRead', { notificationId: id });
  };

  return { notifications, unreadCount, markAsRead };
};
