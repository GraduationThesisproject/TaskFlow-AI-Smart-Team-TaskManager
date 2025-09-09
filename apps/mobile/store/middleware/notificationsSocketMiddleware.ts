import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { addNotification, fetchNotifications } from '../slices/notificationSlice';
import { removeWorkspaceById, upsertWorkspaceStatus, createWorkspace, fetchMembers } from '../slices/workspaceSlice';
import { logoutUser } from '../slices/authSlice';
import { addActivity } from '../slices/activitySlice';

import type { RootState } from "../../store"

export const notificationsSocketMiddleware: Middleware = (store) => {

  let socket: Socket | null = null;
  let prevToken: string | null | undefined;
  let prevRealTimeEnabled: boolean | undefined;
  let isConnecting = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Desktop notification controls
  const NOTIFY_MIN_INTERVAL_MS = 5000; 
  let lastNotifyAt = 0;
  const toBool = (v: any): boolean => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
      if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
      return Boolean(s);
    }
    return Boolean(v);
  };
  const isRealTimeEnabled = (state: RootState): boolean => {
    const pref = state.auth.user?.preferences?.notifications?.realTime as any;
    if (pref && typeof pref === 'object') {
      try {
        return Object.values(pref).some((v) => toBool(v));
      } catch {
        return true;
      }
    }
    // default true if undefined to preserve existing behavior until user saves
    return pref === undefined ? true : toBool(pref);
  };
  const isMuted = () => {
    try {
      // In React Native, we don't have localStorage, so we'll use a simple in-memory flag
      // This could be enhanced to use AsyncStorage if needed
      return false;
    } catch { return false; }
  };

  // Safe mobile notification helper (React Native doesn't have browser notifications)
  const notifyMobile = (title: string, body?: string) => {
    try {
      // Respect RT preference at display time, too
      const state = (store.getState?.() as RootState);
      if (state && !isRealTimeEnabled(state)) return;
      // Respect user mute and throttle bursts
      if (isMuted()) return;
      const now = Date.now();
      if (now - lastNotifyAt < NOTIFY_MIN_INTERVAL_MS) return;

      // In React Native, we'll just log the notification for now
      // This could be enhanced to use Expo Notifications or other push notification services
      console.log('📱 [notificationsSocketMiddleware] Mobile notification:', { title, body });
      lastNotifyAt = now;
    } catch {}
  };

  const connect = (token: string) => {
    // Don't reconnect if already connected or connecting
    if (socket?.connected || isConnecting) {
      console.log('🔧 [notificationsSocketMiddleware] Already connected or connecting, skipping');
      return;
    }
    if (!token) {
      console.log('🔧 [notificationsSocketMiddleware] No token provided, skipping connection');
      return;
    }

    // Validate token format before attempting connection
    const isValidJWT = token && typeof token === 'string' && token.split('.').length === 3;
    if (!isValidJWT) {
      console.log('🔧 [notificationsSocketMiddleware] Invalid token format, skipping connection:', token?.substring(0, 20) + '...');
      return;
    }

    isConnecting = true;
    
    console.log('🔌 [notificationsSocketMiddleware] connecting to socket', env.SOCKET_URL);
    console.log('🔧 [notificationsSocketMiddleware] Token preview:', token.substring(0, 20) + '...');

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    try {
      // Connect to notifications namespace to match backend
      socket = io(`${env.SOCKET_URL}/notifications`, {
        auth: { token },
        autoConnect: true,
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: false,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
        // Add additional options for better connection handling
        withCredentials: true,
        rejectUnauthorized: false, // For development only
      });
    } catch (error) {
      console.error('❌ [notificationsSocketMiddleware] Failed to create socket connection:', error);
      isConnecting = false;
      return;
    }

    socket.on('connect', () => {
      isConnecting = false;
      reconnectAttempts = 0; // Reset counter on successful connection
      console.log('🔌 [notificationsSocketMiddleware] socket connected', { id: socket?.id });
      // Only auto-fetch on connect if real-time is enabled
      const stateNow = store.getState() as RootState;
      if (isRealTimeEnabled(stateNow)) {
        store.dispatch(fetchNotifications() as any);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [notificationsSocketMiddleware] connect_error', {
        message: err?.message || err,
        description: err?.description,
        context: err?.context,
        type: err?.type,
        url: env.SOCKET_URL,
        attempt: reconnectAttempts + 1,
        maxAttempts: MAX_RECONNECT_ATTEMPTS
      });
      isConnecting = false;
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts), 30000);
        console.log(`⏳ [notificationsSocketMiddleware] will retry connection in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connect(token), delay);
      } else {
        console.error('❌ [notificationsSocketMiddleware] max reconnection attempts reached');
        console.error('🔧 [notificationsSocketMiddleware] Final connection details:', {
          url: env.SOCKET_URL,
          tokenLength: token?.length,
          tokenPreview: token?.substring(0, 20) + '...',
          attempts: reconnectAttempts
        });
      }
    });

    socket.on('error', (err) => {
      console.error('❗ [notificationsSocketMiddleware] socket error', err);
    });

    socket.on('notification:new', ({ notification }) => {
      // Gate by preference
      const stateNow = store.getState() as RootState;
      if (!isRealTimeEnabled(stateNow)) return;
      console.log('📩 [notificationsSocketMiddleware] notification:new', {
        id: notification?._id,
        type: notification?.type,
        title: notification?.title,
      });

      // Normalize payload to our slice shape
      const nowIso = new Date().toISOString();
      const normalized = {
        _id: notification?._id || notification?.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        title: notification?.title || 'Notification',
        message: notification?.message || '',
        type: typeof notification?.type === 'string' ? notification.type : 'info',
        recipientId: notification?.recipientId || (notification?.recipient && (typeof notification.recipient === 'object' ? (notification.recipient._id || notification.recipient.id) : notification.recipient)) || '',
        relatedEntity: notification?.relatedEntity
          ? {
              type: notification.relatedEntity.type || notification.relatedEntity.entityType,
              id: notification.relatedEntity.id || notification.relatedEntity.entityId,
              name: notification.relatedEntity.name,
            }
          : undefined,
        priority: notification?.priority || 'low',
        isRead: notification?.isRead === true ? true : false,
        createdAt: notification?.createdAt || nowIso,
        updatedAt: notification?.updatedAt || nowIso,
      };

      store.dispatch(addNotification(normalized as any));
    });

    // Workspace lifecycle: archive/restore (emitted by backend as workspace:status-changed)
    socket.on('workspace:status-changed', (data: {
      workspaceId: string;
      status: 'active' | 'archived';
      archivedAt?: string | null;
      archiveExpiresAt?: string | null;
      archivedBy?: string | null;
      restoredBy?: string | null;
      timestamp?: string;
      scope?: 'user' | 'room';
    }) => {
      try {
        // Gate by preference
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
        const { workspaceId, status, archivedAt = null, archiveExpiresAt = null } = data || {} as any;
        if (!workspaceId || !status) return;

        // Sync Redux state for lists and current workspace
        store.dispatch(upsertWorkspaceStatus({
          id: workspaceId,
          status,
          archivedAt: archivedAt || null,
          archiveExpiresAt: archiveExpiresAt || null,
        }));

        // User-facing desktop notification
        const title = status === 'archived' ? 'Workspace archived' : 'Workspace restored';
        const body = status === 'archived'
          ? (archiveExpiresAt ? `Will be permanently deleted at ${new Date(archiveExpiresAt).toLocaleString()}` : undefined)
          : undefined;
        notifyMobile(title, body);

        console.log('🔔 [notificationsSocketMiddleware] workspace:status-changed', data);
      } catch (e) {
        console.warn('⚠️ [notificationsSocketMiddleware] failed to process workspace:status-changed', e);
      }
    });

    // Real-time workspace delete
    socket.on('workspace:deleted', ({ id }) => {
      try {
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
        console.log('🗑️ [notificationsSocketMiddleware] workspace:deleted', { id });
        store.dispatch(removeWorkspaceById(id));
        notifyMobile('Workspace deleted', 'It was permanently removed');
      } catch (e) {
        console.warn('⚠️ Failed to process workspace:deleted', e);
      }
    });

    // Real-time activities
    socket.on('activity:new', ({ activity }) => {
      try {
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
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
            // Mark as client-only so markAsRead/delete skip server calls (prevents 404)
            clientOnly: true,
          } as any));
        }
      } catch (e) {
        console.warn('⚠️ [notificationsSocketMiddleware] failed to process activity:new', e);
      }
    });

    // Member joined/accepted invitation: refresh members list
    socket.on('workspace:member-added', ({ workspaceId, member }) => {
      try {
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
        if (workspaceId) {
          console.log('👤 [notificationsSocketMiddleware] workspace:member-added', { workspaceId, memberId: member?._id || member?.id });
          store.dispatch(fetchMembers({ id: workspaceId }) as any);
        }
      } catch (e) {
        console.warn('⚠️ Failed to process workspace:member-added', e);
      }
    });

    // Some backends emit a generic members-updated event
    socket.on('workspace:members-updated', ({ workspaceId }) => {
      try {
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
        if (workspaceId) {
          console.log('👥 [notificationsSocketMiddleware] workspace:members-updated', { workspaceId });
          store.dispatch(fetchMembers({ id: workspaceId }) as any);
        }
      } catch (e) {
        console.warn('⚠️ Failed to process workspace:members-updated', e);
      }
    });

    // Invitation accepted alias (if backend uses invitation namespace)
    socket.on('invitation:accepted', ({ workspaceId, userId }) => {
      try {
        const stateNow = store.getState() as RootState;
        if (!isRealTimeEnabled(stateNow)) return;
        if (workspaceId) {
          console.log('✅ [notificationsSocketMiddleware] invitation:accepted', { workspaceId, userId });
          store.dispatch(fetchMembers({ id: workspaceId }) as any);
        }
      } catch (e) {
        console.warn('⚠️ Failed to process invitation:accepted', e);
      }
    });

    socket.on('notifications:unreadCount', () => {
      const stateNow = store.getState() as RootState;
      if (!isRealTimeEnabled(stateNow)) return;
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

  };

  const disconnect = () => {
    if (socket) {
      console.log('🧹 [notificationsSocketMiddleware] disconnecting socket');
      socket.off(); // Remove all listeners
      // Safe disconnect depending on state
      if (socket.connected) {
        socket.disconnect();
      } else {
        socket.close();
      }
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
    const realTimeEnabled = isRealTimeEnabled(state);

    // Handle logout action
    if (action.type === logoutUser.fulfilled.type) {
      disconnect();
      return result;
    }

    // Handle workspace creation - emit socket event and create notification
    if (action.type === createWorkspace.fulfilled.type && socket?.connected) {
      const workspace = action.payload;
      const currentUser = state.auth.user;
      
      if (workspace && currentUser) {
        // Emit socket event for real-time updates
        socket.emit('workspace:created', {
          workspace,
          userId: currentUser.user._id,
          timestamp: new Date().toISOString()
        });

        // Create local notification
        store.dispatch(addNotification({
          _id: `workspace-created-${Date.now()}`,
          title: 'Workspace Created',
          message: `Successfully created workspace "${workspace.name}"`,
          type: 'success',
          recipientId: currentUser.user._id,
          relatedEntity: {
            type: 'workspace',
            id: workspace._id || workspace.id,
            name: workspace.name
          },
          priority: 'low',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientOnly: true,
        } as any));
      }
    }

    // Handle token or preference changes
    const tokenChanged = prevToken !== currentToken;
    const prefChanged = prevRealTimeEnabled !== realTimeEnabled;
    if (tokenChanged || prefChanged) {
      if (currentToken && realTimeEnabled) {
        // Validate token format before attempting connection
        const isValidJWT = currentToken && typeof currentToken === 'string' && currentToken.split('.').length === 3;
        if (!isValidJWT) {
          console.log('🔧 [notificationsSocketMiddleware] Skipping connection - invalid token format:', currentToken?.substring(0, 20) + '...');
          prevToken = currentToken;
          prevRealTimeEnabled = realTimeEnabled;
          return result;
        }
        
        // Only connect if user is authenticated
        const isAuthenticated = state.auth.isAuthenticated;
        if (isAuthenticated) {
          connect(currentToken);
        } else {
          console.log('🔧 [notificationsSocketMiddleware] Skipping connection - user not authenticated');
          disconnect();
        }
      } else {
        // Either token missing or RT disabled -> disconnect
        disconnect();
      }
      prevToken = currentToken;
      prevRealTimeEnabled = realTimeEnabled;
    }

    return result;
  };
};
