import React, { useState } from 'react';
import { Button, Avatar, AvatarImage, AvatarFallback, Dropdown, Typography, Badge } from '@taskflow/ui';
import { LogOut, UserCog, Bell, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle, UserPlus } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import type { User as UserType } from '../../../types/navbar';

interface UserProfileProps {
  user?: UserType;
  onLogout?: () => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onLogout, 
  className = '' 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user?.user) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => (window.location.href = '/signin')}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Global Notification Bell */}
      <NotificationBell />

      {/* User Menu */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group flex items-center gap-2 rounded-full ring-1 ring-primary/30 hover:ring-2 hover:bg-primary transition px-2 pr-3"
      >
        <Avatar size="sm">
          {user.user.avatar && (
            <AvatarImage src={user.user.avatar} alt={user.user.name || 'User'} />
          )}
          <AvatarFallback variant="primary">
            {user.user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline font-medium text-foreground group-hover:text-background transition-colors">
          {user.user.name || 'User'}
        </span>
      </Button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setIsDropdownOpen(false);
                window.location.href = '/dashboard/settings';
              }}
            >
              <UserCog className="w-4 h-4" />
              Profile & Settings
            </Button>
            
            <div className="border-t border-border my-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline NotificationBell moved here for global access
const NotificationBell: React.FC = () => {
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    clearError,
    fetchNotifications,
  } = useNotifications();

  const unreadCount = stats?.unread || 0;
  const hasNotifications = notifications.length > 0;

  React.useEffect(() => {
    if (error) {
      // Auto-clear error after 5s
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconProps = { size: 16, className: 'flex-shrink-0' } as const;
    switch (type) {
      case 'workspace_invitation':
      case 'space_invitation':
        return <UserPlus {...iconProps} className="text-blue-500" />;
      case 'invitation_accepted':
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-500" />;
      default:
        return <Info {...iconProps} className="text-blue-500" />;
    }
  };

  const handleBellOpen = React.useCallback(() => {
    // Refresh notifications on open to ensure latest data
    fetchNotifications?.();
  }, [fetchNotifications]);

  return (
    <Dropdown
      trigger={
        <div className="relative" onClick={handleBellOpen}>
          <Bell size={20} className="text-primary hover:text-background transition-colors" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      }
      variant="ghost"
      size="sm"
      align="end"
      contentClassName="w-80"
    >
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <Typography variant="h4" className="font-semibold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}
        {hasNotifications && (
          <div className="flex items-center gap-2 mt-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs h-6 px-2"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearReadNotifications}
              disabled={loading}
              className="text-xs h-6 px-2"
            >
              Clear read
            </Button>
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <Typography variant="body-small" className="text-muted-foreground">
              Loading notifications...
            </Typography>
          </div>
        ) : !hasNotifications ? (
          <div className="p-4 text-center">
            <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
            <Typography variant="body-small" className="text-muted-foreground">
              No notifications yet
            </Typography>
          </div>
        ) : (
          <div>
            {notifications.slice(0, 10).map((n) => (
              <div 
                key={n._id}
                className={`p-3 border-b border-border hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Typography 
                          variant="body-small" 
                          className={`font-medium truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {n.title}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </Typography>
                        {(n.type === 'workspace_invitation' || n.type === 'space_invitation') && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => { markAsRead(n._id); window.location.href = '/dashboard/settings'; }}
                            >
                              View invitations
                            </Button>
                          </div>
                        )}
                        <Typography variant="caption" className="text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </Typography>
                      </div>
                      {/* Actions: mark-as-read (if unread) and delete */}
                      {n.deliveryMethods?.inApp !== false && (
                        <div className="flex items-center gap-1">
                          {!n.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(n._id)}
                              disabled={loading}
                              className="h-6 px-1 text-green-600 hover:text-green-700"
                              title="Mark as read"
                            >
                              <CheckCircle size={12} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(n._id)}
                            disabled={loading}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length > 10 && (
              <div className="p-3 border-t border-border text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Dropdown>
  );
};
