import { store } from '@/store';
import { markNotificationAsRead, clearAllNotifications } from '@/store/slices/notificationSlice';

/**
 * Utility functions for managing notifications
 */

/**
 * Clear all workspace creation notifications
 * This is useful for clearing persistent workspace creation notifications
 */
export const clearWorkspaceCreationNotifications = () => {
  const state = store.getState();
  const notifications = state.notifications.notifications || [];
  
  // Find all workspace creation notifications
  const workspaceCreationNotifications = notifications.filter(notification => 
    notification.title === 'Workspace Created' || 
    notification.message?.includes('Successfully created workspace') ||
    notification.message?.includes('was created successfully')
  );
  
  // Mark them all as read
  workspaceCreationNotifications.forEach(notification => {
    if (!notification.isRead) {
      store.dispatch(markNotificationAsRead(notification._id));
    }
  });
  
  console.log(`🧹 Cleared ${workspaceCreationNotifications.length} workspace creation notifications`);
};

/**
 * Clear all notifications (use with caution)
 */
export const clearAllNotificationsUtil = () => {
  store.dispatch(clearAllNotifications());
  console.log('🧹 Cleared all notifications');
};

/**
 * Check if a notification is a workspace creation notification
 */
export const isWorkspaceCreationNotification = (notification: any): boolean => {
  return notification.title === 'Workspace Created' || 
         notification.message?.includes('Successfully created workspace') ||
         notification.message?.includes('was created successfully');
};
