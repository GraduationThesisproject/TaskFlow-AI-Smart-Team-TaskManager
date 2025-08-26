import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axios';

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

    return {
      notifications: notificationsResponse.data.data || [],
      stats: statsResponse.data.data,
      pagination: notificationsResponse.data.pagination,
      unreadCount: notificationsResponse.data.unreadCount
    };
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await axiosInstance.patch(`/notifications/${notificationId}/read`);
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

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    await axiosInstance.delete(`/notifications/${notificationId}`);
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
      if (state.stats) {
        state.stats.total += 1;
        if (!action.payload.isRead) {
          state.stats.unread += 1;
        }
        // Safeguard byType counters
        if (state.stats.byType[action.payload.type] === undefined) {
          state.stats.byType[action.payload.type] = 0 as any;
        }
        state.stats.byType[action.payload.type] += 1;
      }
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
        state.stats = action.payload.stats;
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
