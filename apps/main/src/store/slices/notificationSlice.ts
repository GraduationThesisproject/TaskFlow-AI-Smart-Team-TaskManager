import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axios';
import type { RootState } from '../../store';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientId: string;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  clientOnly?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

interface NotificationState {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: { limit?: number; page?: number; isRead?: boolean; type?: string; priority?: string }) => {
    const [notificationsResponse, statsResponse] = await Promise.all([
      axiosInstance.get('/notifications', { params }),
      axiosInstance.get('/notifications/stats')
    ]);

    // Backend sendResponse shape: { success, message, data: { ... } }
    const nData = notificationsResponse.data?.data || {};
    const sData = statsResponse.data?.data || {};

    return {
      notifications: nData.notifications || [],
      stats: sData.stats || null,
      pagination: nData.pagination || null,
      unreadCount: nData.unreadCount || 0,
    };
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { getState }) => {
    const state = getState() as RootState;
    const n = state.notifications.notifications.find(n => n._id === notificationId) as any;
    if (n?.clientOnly) {
      // Locally generated notification: update state only
      return notificationId;
    }
    // If not client-only, ensure it's a Mongo ObjectId before making API request
    const isMongoId = /^[a-f0-9]{24}$/i.test(notificationId);
    if (!isMongoId) {
      return notificationId;
    }
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
    } catch (err: any) {
      // Treat 404 as non-fatal (notification may have been client-only or already deleted)
      if (err?.response?.status !== 404) throw err;
    }
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await axiosInstance.post('/notifications/mark-all-read');
    return true;
  }
);

export const markNotificationsAsReadBulk = createAsyncThunk(
  'notifications/markBulkAsRead',
  async (ids: string[], { getState }) => {
    const state = getState() as RootState;
    // Only include server-backed Mongo ObjectIds that aren't clientOnly
    const serverIds = ids.filter(id => {
      const n = state.notifications.notifications.find(n => n._id === id) as any;
      const isMongoId = /^[a-f0-9]{24}$/i.test(id);
      return isMongoId && !n?.clientOnly;
    });
    if (serverIds.length > 0) {
      try {
        await axiosInstance.patch('/notifications/bulk-read', { notificationIds: serverIds });
      } catch (err: any) {
        // Some ids may not exist anymore; ignore 404 to keep UX smooth
        if (err?.response?.status !== 404) throw err;
      }
    }
    // Always return the original ids to update state locally
    return ids;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { getState }) => {
    const state = getState() as RootState;
    const n = state.notifications.notifications.find(n => n._id === notificationId) as any;
    if (n?.clientOnly) {
      // Locally generated notification: update state only
      return notificationId;
    }
    const isMongoId = /^[a-f0-9]{24}$/i.test(notificationId);
    if (!isMongoId) {
      return notificationId;
    }
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
    } catch (err: any) {
      // Treat 404 as non-fatal (already deleted or non-existent)
      if (err?.response?.status !== 404) throw err;
    }
    return notificationId;
  }
);

export const clearReadNotifications = createAsyncThunk(
  'notifications/clearReadNotifications',
  async () => {
    await axiosInstance.post('/notifications/clear-read');
    return true;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Ensure notifications is an array before mutating
      if (!Array.isArray(state.notifications)) {
        state.notifications = [];
      }
      state.notifications.unshift(action.payload);
      // Ensure stats and byType structure exists before updating
      if (!state.stats) {
        state.stats = {
          total: 0,
          unread: 0,
          byType: { info: 0, success: 0, warning: 0, error: 0 },
        };
      }
      if (!state.stats.byType) {
        state.stats.byType = { info: 0, success: 0, warning: 0, error: 0 } as any;
      }
      state.stats.total += 1;
      if (!action.payload.isRead) {
        state.stats.unread += 1;
      }
      if (state.stats.byType[action.payload.type] === undefined) {
        state.stats.byType[action.payload.type] = 0 as any;
      }
      state.stats.byType[action.payload.type] += 1;
    },
    updateNotificationStatus: (state, action: PayloadAction<{ id: string; isRead: boolean }>) => {
      const notification = state.notifications.find(n => n._id === action.payload.id);
      if (notification && notification.isRead !== action.payload.isRead) {
        notification.isRead = action.payload.isRead;
        if (state.stats) {
          if (action.payload.isRead) {
            state.stats.unread = Math.max(0, state.stats.unread - 1);
          } else {
            state.stats.unread += 1;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload.notifications)
          ? action.payload.notifications
          : [];
        const s = action.payload.stats || {} as any;
        const baseByType = { info: 0, success: 0, warning: 0, error: 0 };
        const computed = {
          total: typeof s.total === 'number' ? s.total : state.notifications.length,
          unread: typeof s.unread === 'number' ? s.unread : state.notifications.filter(n => !n.isRead).length,
          byType: {
            info: s.byType?.info ?? 0,
            success: s.byType?.success ?? 0,
            warning: s.byType?.warning ?? 0,
            error: s.byType?.error ?? 0,
          },
        } as any;
        // Ensure keys exist even if backend omitted byType
        state.stats = { ...computed, byType: { ...baseByType, ...computed.byType } };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
        // Ensure notifications is always an array even on error
        state.notifications = [];
        state.stats = null;
      })
      
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          if (state.stats) {
            state.stats.unread = Math.max(0, state.stats.unread - 1);
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark notification as read';
      })
      
      // Bulk mark as read
      .addCase(markNotificationsAsReadBulk.fulfilled, (state, action) => {
        const ids: string[] = action.payload as any;
        ids.forEach(id => {
          const n = state.notifications.find(nn => nn._id === id);
          if (n && !n.isRead) {
            n.isRead = true;
            if (state.stats) {
              state.stats.unread = Math.max(0, state.stats.unread - 1);
            }
          }
        });
      })
      .addCase(markNotificationsAsReadBulk.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to bulk mark notifications as read';
      })
      
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        if (state.stats) {
          state.stats.unread = 0;
        }
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark all notifications as read';
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(n => n._id === action.payload);
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        
        if (deletedNotification && state.stats) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (!deletedNotification.isRead) {
            state.stats.unread = Math.max(0, state.stats.unread - 1);
          }
          state.stats.byType[deletedNotification.type] = Math.max(0, state.stats.byType[deletedNotification.type] - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete notification';
      })
      
      // Clear read notifications
      .addCase(clearReadNotifications.fulfilled, (state) => {
        const readNotifications = state.notifications.filter(n => n.isRead);
        state.notifications = state.notifications.filter(n => !n.isRead);
        
        if (state.stats) {
          state.stats.total = state.stats.total - readNotifications.length;
          readNotifications.forEach(notification => {
            state.stats!.byType[notification.type] = Math.max(0, state.stats!.byType[notification.type] - 1);
          });
        }
      })
      .addCase(clearReadNotifications.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to clear read notifications';
      });
  },
});

export const { clearError, addNotification, updateNotificationStatus } = notificationSlice.actions;
export default notificationSlice.reducer;
