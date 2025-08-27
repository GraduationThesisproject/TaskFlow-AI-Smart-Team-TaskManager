import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { addNotification, fetchNotifications } from '../slices/notificationSlice';
import { removeWorkspaceById } from '../slices/workspaceSlice';
import { logoutUser } from '../slices/authSlice';
import { addActivity } from '../slices/activitySlice';

import type { RootState } from "../../store"

export const notificationsSocketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let prevToken: string | null | undefined;
  let isConnecting = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = (token: string) => {
    // Don't reconnect if already connected or connecting
    if (socket?.connected || isConnecting) return;
    if (!token) return;

    isConnecting = true;
    
    if (env.ENABLE_DEBUG) {
      console.log('🔌 [notificationsSocketMiddleware] connecting to socket', env.SOCKET_URL);
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(env.SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socket.on('connect', () => {
      isConnecting = false;
      reconnectAttempts = 0; // Reset counter on successful connection
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

    // Real-time workspace delete
    socket.on('workspace:deleted', ({ id }) => {
      try {
        console.log('🗑️ [notificationsSocketMiddleware] workspace:deleted', { id });
        store.dispatch(removeWorkspaceById(id));
      } catch (e) {
        console.warn('⚠️ Failed to process workspace:deleted', e);
      }
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

        // Frontend stopgap: also surface key activities as notifications so the bell updates
        // until the backend emits `notification:new`.
        if (activity?.action) {
          const titleMap: Record<string, string> = {
            workspace_create: 'Workspace created',
            workspace_update: 'Workspace updated',
            workspace_delete: 'Workspace deleted',
          };

          const title = titleMap[activity.action] || 'Activity';
          const now = new Date().toISOString();
          const relatedEntity = activity.workspace
            ? { type: 'workspace', id: activity.workspace, name: activity?.metadata?.workspaceName }
            : activity.project
            ? { type: 'project', id: activity.project, name: activity?.metadata?.projectName }
            : undefined;

          store.dispatch(addNotification({
            _id: activity._id || activity.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            message: activity.description || '',
            type: activity.isSuccessful === false ? 'warning' : 'success',
            recipientId: activity.user?._id || activity.user?.id || '',
            relatedEntity: relatedEntity as any,
            priority: 'low',
            isRead: false,
            createdAt: now,
            updatedAt: now,
          } as any));
        }
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
      isConnecting = false;
      
      // Only try to reconnect if we didn't explicitly disconnect
      if (reason !== 'io client disconnect' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
        console.log(`⏳ [notificationsSocketMiddleware] will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connect(token), delay);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [notificationsSocketMiddleware] connection error:', error.message);
      isConnecting = false;
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`⏳ [notificationsSocketMiddleware] will retry connection in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connect(token), delay);
      } else {
        console.error('❌ [notificationsSocketMiddleware] max reconnection attempts reached');
      }
    });
  };

  const disconnect = () => {
    if (socket) {
      console.log('🧹 [notificationsSocketMiddleware] disconnecting socket');
      socket.off(); // Remove all listeners
      socket.disconnect();
      socket = null;
      isConnecting = false;
      reconnectAttempts = 0;
    }
  };

  return (next) => (action) => {
    // Let the action update the state first
    const result = next(action);

    const state = store.getState() as RootState;
    const currentToken = state.auth.token;

    // Handle logout action
    if (action.type === logoutUser.fulfilled.type) {
      disconnect();
      return result;
    }

    // Handle token changes
    if (prevToken !== currentToken) {
      if (currentToken) {
        connect(currentToken);
      } else {
        disconnect();
      }
      prevToken = currentToken;
    }

    return result;
  };
};
