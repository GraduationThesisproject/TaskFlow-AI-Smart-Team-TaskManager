export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'security' | 'maintenance' | 'task' | 'workspace';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isEnabled?: boolean;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  readAt?: string;
  deliveryStatus?: {
    email?: 'pending' | 'delivered' | 'failed';
    push?: 'pending' | 'delivered' | 'failed';
    slack?: 'pending' | 'delivered' | 'failed';
  };
  metadata?: Record<string, any>;
}

export interface NotificationCount {
  count: number;
}

export interface NotificationSocketEvents {
  'notification:new': { notification: Notification };
  'notification:typed': { notification: Notification; type: string };
  'notifications:unreadCount': NotificationCount;
  'notifications:recent': { notifications: Notification[] };
  'notifications:marked-read': { notificationId: string };
  'notifications:all-marked-read': void;
  'notifications:subscribed': { types: string[] };
  'notifications:unsubscribed': { types: string[] };
  'notifications:list': { notifications: Notification[]; unreadCount: number };
  'notifications:markRead': { notificationId: string };
  'notifications:delete': { notificationId: string };
  'error': { message: string };
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
  limit?: number;
}
