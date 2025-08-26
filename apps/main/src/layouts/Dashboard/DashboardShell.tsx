import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  FileText, 
  Menu, 
  X, 
  User,
  LogOut,
  Bell,
  Search,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarNav, 
  SidebarNavItem,
  Topbar,
  TopbarLeft,
  TopbarRight,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dropdown,
  DropdownItem,
  Input,
  Typography,
  Badge
} from '@taskflow/ui';

import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardShellProps } from '../../types/dash.types';


const navigationItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: FileText, label: 'Templates', href: '/dashboard/templates' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  title,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser({ allDevices: false })).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        className="hidden lg:flex"
      >
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!sidebarCollapsed && (
              <Typography variant="h3" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TaskFlow AI
              </Typography>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  active={isActiveRoute(item.href)}
                  className="justify-start"
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </SidebarNavItem>
              );
            })}
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
              <AvatarFallback variant="primary" size="sm">
                {user?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <Typography variant="body-small" className="font-medium truncate">
                  {user?.user?.name || 'User'}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground truncate">
                  {user?.user?.email}
                </Typography>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <Typography variant="h3" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TaskFlow AI
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  active={isActiveRoute(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="justify-start"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </SidebarNavItem>
              );
            })}
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
              <AvatarFallback variant="primary" size="sm">
                {user?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Typography variant="body-small" className="font-medium truncate">
                {user?.user?.name || 'User'}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground truncate">
                {user?.user?.email}
              </Typography>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar>
          <TopbarLeft>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu size={20} />
            </Button>

            {title && (
              <div className="hidden sm:block">
                <Typography variant="h3">{title}</Typography>
              </div>
            )}
          </TopbarLeft>

          <TopbarRight>
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64"
                />
              </div>
              
              <NotificationBell />
            </div>

            <Dropdown
              trigger={
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
                    <AvatarFallback variant="primary" size="sm">
                      {user?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block">{user?.user?.name || 'User'}</span>
                </div>
              }
              align="end"
              className="w-56"
            >
              <DropdownItem onClick={() => window.location.href = '/dashboard/settings'}>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Profile Settings
                </div>
              </DropdownItem>
              <DropdownItem onClick={handleLogout} variant="destructive">
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </div>
              </DropdownItem>
            </Dropdown>
          </TopbarRight>
        </Topbar>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Notification Bell Component
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
    clearError
  } = useNotifications();

  // Ensure notifications is always an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const unreadCount = stats?.unread || 0;
  const hasNotifications = notificationsArray.length > 0;

  // Debug: log notifications and invitations subset on change
  React.useEffect(() => {
    if (import.meta.env.VITE_ENABLE_DEBUG) {
      const invites = notificationsArray.filter(n => n.type === 'workspace_invitation' || n.type === 'space_invitation');
      console.log('🔔 [NotificationBell] Notifications updated', {
        total: notificationsArray.length,
        unread: unreadCount,
        isArray: Array.isArray(notifications),
        notificationsType: typeof notifications,
      });
      if (invites.length) {
        console.log('🧑‍🤝‍🧑 [NotificationBell] Invitation notifications', invites.map(i => ({
          id: i._id,
          type: i.type,
          title: i.title,
          createdAt: i.createdAt,
        })));
      }
    }
  }, [notificationsArray, unreadCount, notifications]);

  // Clear error when component mounts or when error changes
  React.useEffect(() => {
    if (error) {
      console.error('Notification error:', error);
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconProps = { size: 16, className: "flex-shrink-0" };
    
    switch (type) {
      case 'workspace_invitation':
      case 'space_invitation':
        return <UserPlus {...iconProps} className="text-blue-500" />;
      case 'invitation_accepted':
        return <CheckCircle {...iconProps} className="text-green-500" />;
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

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const handleClearReadNotifications = () => {
    clearReadNotifications();
  };

  return (
    <Dropdown
      trigger={
        <div className="relative">
          <Bell size={20} />
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
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs h-6 px-2"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearReadNotifications}
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
            {notificationsArray.slice(0, 10).map((notification) => (
              <div 
                key={notification._id}
                className={`p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <NotificationIcon type={notification.type} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Typography 
                          variant="body-small" 
                          className={`font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </Typography>
                        {(notification.type === 'workspace_invitation' || notification.type === 'space_invitation') && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => {
                                if (import.meta.env.VITE_ENABLE_DEBUG) {
                                  console.log('➡️ [NotificationBell] View invitations clicked');
                                }
                                window.location.href = '/dashboard/settings';
                              }}
                            >
                              View invitations
                            </Button>
                          </div>
                        )}
                        <Typography variant="caption" className="text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={loading}
                            className="h-6 w-6 p-0"
                          >
                            <Check size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification._id)}
                          disabled={loading}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-3" />
                    )}
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

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
