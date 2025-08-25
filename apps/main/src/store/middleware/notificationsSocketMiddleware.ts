import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { addNotification, fetchNotifications } from '../slices/notificationSlice';
import { logoutUser } from '../slices/authSlice';
import { addActivity } from '../slices/activitySlice';

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

    // Real-time activities
    socket.on('activity:new', ({ activity }) => {
      try {
        console.log('📝 [notificationsSocketMiddleware] activity:new', {
          id: activity?._id,
          action: activity?.action,
          desc: activity?.description?.slice?.(0, 80)
        });
        // Backend sends a full activity with _id/timestamps; our reducer expects a partial.
        // Dispatching as-is works because reducer will wrap, but to avoid duplication we pass the core fields.
        store.dispatch(addActivity({
          user: activity.user,
          action: activity.action,
          description: activity.description,
          entity: activity.entity,
          relatedEntities: activity.relatedEntities,
          metadata: activity.metadata,
          workspace: activity.workspace,
          project: activity.project,
          space: activity.space,
          board: activity.board,
          severity: activity.severity,
          isSuccessful: activity.isSuccessful,
        } as any));
      } catch (e) {
        console.warn('⚠️ [notificationsSocketMiddleware] failed to process activity:new', e);
      }
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
