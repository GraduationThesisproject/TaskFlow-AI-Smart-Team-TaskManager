// hooks/useNotifications.ts

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '../../types/dash.types';
import { env } from '../../config/env';

export const useNotifications = (token: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Close any existing socket first
    if (socketRef.current) {
      try { socketRef.current.disconnect(); } catch {}
      socketRef.current = null;
    }

    // Connect to the notifications namespace; server applies auth middleware there
    const socket: Socket = io(`${env.SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // On connection
    socket.on('connect', () => {
      console.log('Connected to notification socket:', socket.id);
      // Fetch initial unread count and recent notifications
      socket.emit('notifications:getUnreadCount');
      socket.emit('notifications:getRecent', { limit: 10 });
    });

    // Listen to unread count
    socket.on('notifications:unreadCount', (payload: any) => {
      // backend may send { count } or a number; support both
      const count = typeof payload === 'number' ? payload : payload?.count;
      if (typeof count === 'number') setUnreadCount(count);
    });

    // Listen to recent notifications
    socket.on('notifications:recent', ({ notifications: recents }) => {
      setNotifications(recents || []);
    });

    // Listen to new notifications
    socket.on('notification:new', ({ notification }) => {
      if (!notification) return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[useNotifications] socket disconnected', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[useNotifications] connect_error', err?.message || err);
    });

    return () => {
      try { socket.off(); } catch {}
      try { socket.disconnect(); } catch {}
      socketRef.current = null;
    };
  }, [token]);

  const markAsRead = (id: string) => {
    const s = socketRef.current;
    if (!s) return;
    try {
      s.emit('notifications:markRead', { notificationId: id });
    } catch {}
  };

  return { notifications, unreadCount, markAsRead };
};
