import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Typography,
  Badge,
} from "@taskflow/ui";
import { Menu, X, User, LogOut, Bell, Check, Clock, Users, AlertTriangle, Settings, Eye, Trash2 } from "lucide-react";
import Logo from "../Logo";
import { AvatarWithFallback, ThemeToggle } from "@taskflow/ui";
import { useAuth } from "../../../hooks";
import { useNotifications } from "../../../hooks/useNotifications";
interface User {
  user?: {
    name?: string;
    avatar?: string;
    email?: string;
  };
}

interface UniversalNavbarProps {
  user?: User;
  onLogout?: () => void;
  className?: string;
  onChatClick?: () => void;
}

const UniversalNavbar: React.FC<UniversalNavbarProps> = ({
  onLogout,
  className = "",
  onChatClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const navigationItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`bg-background/90 backdrop-blur-sm border-b border-border sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="transition-all duration-300 hover:scale-105 hover:opacity-80">
            <Logo />
          </Link>
         

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated &&
              navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  {item.name}
                </Link>
              ))}
            
            {/* Upgrade Button for Free Users */}
            {isAuthenticated && (!user?.subscription?.plan || user.subscription.status !== 'active') && (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden text-xs px-4 py-2 h-8 bg-gradient-to-r from-primary via-primary/90 to-accent border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-white hover:text-white"
                  onClick={() => navigate('/dashboard/settings/upgrade')}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                    <span className="relative z-10">🚀 Upgrade Now</span>
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
                
                {/* Floating sparkles */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <ThemeToggle variant="ghost" size="sm" />

                {/* Notification Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="gap-2 px-2.5 h-8 relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  {/* Custom Notification Panel */}
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible transition-all duration-200 transform translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50 backdrop-blur-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <Typography variant="body-medium" className="font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </Typography>
                        {unreadCount > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {unreadCount} new
                          </Badge>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
                              onClick={markAllAsRead}
                            >
                              Mark all read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
                            onClick={() => {
                              clearAllNotifications();
                            }}
                          >
                            Clear all
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Bell className="h-8 w-8 text-gray-400" />
                          </div>
                          <Typography variant="body-medium" className="font-medium mb-2">All caught up!</Typography>
                          <Typography variant="body-small">No new notifications</Typography>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {notifications.map((notification, index) => (
                            <div
                              key={notification._id}
                              className={`group relative p-3 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                                notification.isRead 
                                  ? 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                                  : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-l-4 border-l-blue-500 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {/* Unread indicator */}
                              {!notification.isRead && (
                                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg" />
                              )}
                              
                              <div className="flex items-start gap-3">
                                {/* Icon based on notification type */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                                  notification.type === 'workspace_invitation' || notification.type === 'space_invitation'
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                    : notification.type === 'success'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : notification.type === 'warning'
                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : notification.type === 'error'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {notification.type === 'workspace_invitation' || notification.type === 'space_invitation' ? (
                                    <Users className="h-4 w-4" />
                                  ) : notification.type === 'success' ? (
                                    <Check className="h-4 w-4" />
                                  ) : notification.type === 'warning' ? (
                                    <AlertTriangle className="h-4 w-4" />
                                  ) : notification.type === 'error' ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <Bell className="h-4 w-4" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <Typography variant="body-small" className="font-semibold text-gray-900 dark:text-white flex-1">
                                      {notification.title}
                                    </Typography>
                                    
                                    {/* Action buttons - integrated in header */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                      {!notification.isRead && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-105"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification._id);
                                          }}
                                          title="Mark as read"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notification._id);
                                        }}
                                        title="Delete notification"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <Typography variant="body-small" className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                    {notification.message}
                                  </Typography>
                                  
                                  {/* Time and priority */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      <Typography variant="body-small" className="text-xs">
                                        {formatTime(notification.createdAt)}
                                      </Typography>
                                    </div>
                                    
                                    {/* Priority badge */}
                                    <Badge 
                                      variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'secondary' : 'outline'}
                                      className="text-xs h-5 px-2 font-medium"
                                    >
                                      {notification.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 h-8 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
                          >
                            View all notifications
                          </Button>
                          {unreadCount > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 transition-all duration-200"
                              onClick={markAllAsRead}
                            >
                              Mark all read
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom User Dropdown */}
                <div className="relative group">
                  <div className="flex items-center gap-2">
                    {/* Plan Type Badge */}
                    {user?.subscription?.plan && user.subscription.status === 'active' && (
                      <div className="relative group">
                        <Badge 
                          variant={
                            user.subscription.plan === 'enterprise' ? 'destructive' :
                            user.subscription.plan === 'premium' ? 'default' :
                            user.subscription.plan === 'standard' ? 'secondary' :
                            'outline'
                          }
                          className="relative overflow-hidden text-xs px-3 py-1.5 h-7 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold capitalize"
                        >
                          {/* Premium background for higher tiers */}
                          {user.subscription.plan === 'premium' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 opacity-90" />
                          )}
                          {user.subscription.plan === 'enterprise' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-700 opacity-90" />
                          )}
                          
                          {/* Content */}
                          <div className="relative flex items-center gap-1.5">
                            {user.subscription.plan === 'premium' && <span>💎</span>}
                            {user.subscription.plan === 'enterprise' && <span>👑</span>}
                            {user.subscription.plan === 'standard' && <span>⭐</span>}
                            <span className="relative z-10">{user.subscription.plan}</span>
                          </div>
                          
                          {/* Shine effect for premium plans */}
                          {(user.subscription.plan === 'premium' || user.subscription.plan === 'enterprise') && (
                            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          )}
                        </Badge>
                        
                        {/* Status indicator */}
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse border border-white" />
                      </div>
                    )}
                    
                    <Button variant="ghost" className="gap-2 px-2.5 h-8">
                      <AvatarWithFallback
                        size="sm"
                        className="flex-shrink-0 h-6 w-6"
                        src={user?.user?.avatar}
                        alt={user?.user?.name || "User"}
                      />
                      <span className="text-xs truncate max-w-[100px] text-foreground">
                        {user?.user?.name || user?.user?.email || "User"}
                      </span>
                    </Button>
                  </div>
                  
                  {/* Custom User Panel */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible transition-all duration-200 transform translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50">
                    {/* Header with user info */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <AvatarWithFallback
                          size="lg"
                          className="h-12 w-12"
                          src={user?.user?.avatar}
                          alt={user?.user?.name || "User"}
                        />
                        <div className="flex-1 min-w-0">
                          <Typography variant="body-medium" className="font-semibold text-gray-900 dark:text-white truncate">
                            {user?.user?.name || "User"}
                          </Typography>
                          <Typography variant="body-small" className="text-gray-500 dark:text-gray-400 truncate">
                            {user?.user?.email || "user@example.com"}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/dashboard/settings/profile');
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <Typography variant="body-small" className="font-medium text-gray-900 dark:text-white">
                            View Profile
                          </Typography>
                          <Typography variant="body-small" className="text-gray-500 dark:text-gray-400 text-xs">
                            Manage your account settings and preferences
                          </Typography>
                        </div>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Footer with logout */}
                    <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                      <button
                        onClick={() => {
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200 group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <Typography variant="body-small" className="font-medium text-red-700 dark:text-red-400">
                            Sign Out
                          </Typography>
                          <Typography variant="body-small" className="text-red-500 dark:text-red-500 text-xs">
                            End your current session
                          </Typography>
                        </div>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              location.pathname !== "/signin" &&
              location.pathname !== "/signup" && (
                <div className="flex items-center space-x-3">
                  <ThemeToggle variant="ghost" size="sm" />
                  <Button variant="ghost" size="sm" onClick={() => navigate("/signin")} className="h-8 px-3 text-sm">
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate("/signup")} className="h-8 px-3 text-sm">
                    Get Started
                  </Button>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-blue-600 transition-colors p-1"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-1 pb-2 space-y-1 sm:px-3 bg-background border-t border-border">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-border">
                <div className="flex justify-center pb-1">
                  <ThemeToggle variant="ghost" size="sm" />
                </div>
                {isAuthenticated ? (
                  <div className="space-y-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-sm"
                      onClick={onChatClick}
                    >
                      Support
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-sm relative"
                      onClick={() => {/* Toggle notification dropdown for mobile */}}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-sm"
                      onClick={onLogout}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-sm"
                      onClick={() => navigate("/signin")}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="w-full h-8 text-sm"
                      onClick={() => navigate("/signup")}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UniversalNavbar;
