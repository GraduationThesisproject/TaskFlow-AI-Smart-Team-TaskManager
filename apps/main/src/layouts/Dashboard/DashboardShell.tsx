import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Settings, 
  FileText, 
  Menu, 
  X, 
  User,
  LogOut,
  Bell,
  Search
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
  Typography
} from '@taskflow/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useNotifications } from "../../hooks/socket/useNotifications";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const navigationItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: FileText, label: 'Templates', href: '/dashboard/templates' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth);

  // Use custom notifications hook
  const { notifications, unreadCount, markAsRead } = useNotifications(token || '');

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser({ allDevices: false })).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} className="hidden lg:flex">
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
                <SidebarNavItem key={item.href} href={item.href} active={isActiveRoute(item.href)} className="justify-start">
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
                <Typography variant="body-small" className="font-medium truncate">{user?.user?.name || 'User'}</Typography>
                <Typography variant="caption" className="text-muted-foreground truncate">{user?.user?.email}</Typography>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar className={cn("fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <Typography variant="h3" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TaskFlow AI</Typography>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}><X size={20} /></Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavItem key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} active={isActiveRoute(item.href)} className="justify-start">
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
              <AvatarFallback variant="primary" size="sm">{user?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Typography variant="body-small" className="font-medium truncate">{user?.user?.name || 'User'}</Typography>
              <Typography variant="caption" className="text-muted-foreground truncate">{user?.user?.email}</Typography>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar>
          <TopbarLeft>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="lg:hidden"><Menu size={20} /></Button>
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex"><Menu size={20} /></Button>
            {title && <div className="hidden sm:block"><Typography variant="h3">{title}</Typography></div>}
          </TopbarLeft>

          <TopbarRight>
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64" />
              </div>

              {/* Notifications Dropdown */}
              <Dropdown
                trigger={
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unreadCount}</span>
                    )}
                  </Button>
                }
                align="end"
                className="w-80"
              >
                {notifications.length === 0 ? (
                  <div className="p-2 text-muted-foreground text-sm">No notifications</div>
                ) : (
                  notifications.map((n, idx) => (
                    <DropdownItem key={idx} onClick={() => markAsRead(n._id)}>
                      <Typography variant="body-small">{n.message}</Typography>
                    </DropdownItem>
                  ))
                )}
              </Dropdown>
            </div>

            {/* User Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
                    <AvatarFallback variant="primary" size="sm">{user?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block">{user?.user?.name || 'User'}</span>
                </div>
              }
              align="end"
              className="w-56"
            >
              <DropdownItem onClick={() => window.location.href = '/dashboard/settings'}>
                <div className="flex items-center gap-2"><User size={16} />Profile Settings</div>
              </DropdownItem>
              <DropdownItem onClick={handleLogout} variant="destructive">
                <div className="flex items-center gap-2"><LogOut size={16} />Sign Out</div>
              </DropdownItem>
            </Dropdown>
          </TopbarRight>
        </Topbar>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

// Helper function
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
