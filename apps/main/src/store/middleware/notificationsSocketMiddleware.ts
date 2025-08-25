import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { addNotification, fetchNotifications } from '../slices/notificationSlice';
import { logoutUser } from '../slices/authSlice';

export const notificationsSocketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let prevToken: string | null | undefined;

  const connect = (token: string) => {
    if (socket) return;
    if (!token) return;

    if (env.ENABLE_DEBUG) {
      console.log('🔌 [notificationsSocketMiddleware] connecting to socket', env.SOCKET_URL);
    }

    socket = io(env.SOCKET_URL, { auth: { token } });

    socket.on('connect', () => {
      console.log('🔌 [notificationsSocketMiddleware] socket connected', { id: socket?.id });
      store.dispatch(fetchNotifications() as any);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [notificationsSocketMiddleware] connect_error', err?.message || err);
    });

    socket.on('error', (err) => {
      console.error('❗ [notificationsSocketMiddleware] socket error', err);
    });

    socket.on('notification:new', ({ notification }) => {
      console.log('📩 [notificationsSocketMiddleware] notification:new', {
        id: notification?._id,
        type: notification?.type,
        title: notification?.title,
      });
      store.dispatch(addNotification(notification));
    });

    socket.on('notifications:unreadCount', () => {
      console.log('🔄 [notificationsSocketMiddleware] notifications:unreadCount received -> refetch');
      store.dispatch(fetchNotifications() as any);
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ [notificationsSocketMiddleware] socket disconnected', { reason });
    });
  };

  const disconnect = () => {
    if (socket) {
      console.log('🧹 [notificationsSocketMiddleware] disconnecting socket');
      socket.disconnect();
      socket = null;
    }
  };

  return (next) => (action) => {
    const result = next(action);

    const state = store.getState() as { auth: { token: string | null } };
    const token = state?.auth?.token;

    // Start socket when token becomes available
    if (token && token !== prevToken) {
      connect(token);
    }

    // Disconnect on logout or token removal
    if ((!token && prevToken) || action.type === logoutUser.fulfilled.type) {
      disconnect();
    }

    prevToken = token;
    return result;
  };
};
