import React from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { Badge, Dropdown, DropdownItem } from '@taskflow/ui';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Dropdown
        trigger={
          <div
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        }
        side="bottom"
        align="end"
        contentClassName="w-80 max-h-[400px] overflow-y-auto shadow-lg border border-border/50 bg-popover backdrop-blur-sm"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-base">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Notifications List */}
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification: any) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.isRead ? 'bg-muted/30 border-l-2 border-l-primary' : 'bg-transparent'
                  }`}
                >
                  <div className={`text-lg flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-foreground leading-tight">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    {notification.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <Badge
                        variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs px-2 py-0.5"
                      >
                        {notification.priority}
                      </Badge>
                      {notification.category && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {notification.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="p-4 border-t border-border text-center">
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View all notifications
            </button>
          </div>
        )}
      </Dropdown>
    </div>
  );
};
