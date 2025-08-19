import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAdmin, getCurrentAdmin } from '../store/slices/adminSlice';
import { Button, Typography, Avatar, Dropdown, DropdownItem } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme';
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
  HeartIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

// Import layouts instead of individual pages
import DashboardLayout from '../layouts/DashboardLayout';
import UserManagementLayout from '../layouts/UserManagementLayout';
import TemplatesLayout from '../layouts/TemplatesLayout';
import AnalyticsLayout from '../layouts/AnalyticsLayout';
import IntegrationsLayout from '../layouts/IntegrationsLayout';
import SystemHealthLayout from '../layouts/SystemHealthLayout';
import NotificationsLayout from '../layouts/NotificationsLayout';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  layout: React.ComponentType;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and key metrics',
    layout: DashboardLayout
  },
  {
    name: 'Users & Roles',
    path: '/users',
    icon: UsersIcon,
    description: 'Manage user accounts and permissions',
    layout: UserManagementLayout
  },
  {
    name: 'Templates',
    path: '/templates',
    icon: DocumentTextIcon,
    description: 'System templates and configurations',
    layout: TemplatesLayout
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: ChartBarIcon,
    description: 'Global statistics and insights',
    layout: AnalyticsLayout
  },
  {
    name: 'Integrations',
    path: '/integrations',
    icon: PuzzlePieceIcon,
    description: 'Third-party integrations and API keys',
    layout: IntegrationsLayout
  },
  {
    name: 'System Health',
    path: '/system-health',
    icon: HeartIcon,
    description: 'Monitor system performance and health',
    layout: SystemHealthLayout
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: BellIcon,
    description: 'System announcements and communication',
    layout: NotificationsLayout
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: CogIcon,
    description: 'System configuration and preferences',
    layout: DashboardLayout // Default to dashboard for now
  }
];

const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAdmin, isAuthenticated, isLoading } = useAppSelector(state => state.admin);



  // Check authentication on mount
  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        dispatch(getCurrentAdmin());
      } else {
        navigate('/login');
      }
    }
  }, [dispatch, isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout by clearing local state
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
  };

  const userMenuItems = [
    { label: 'Profile', action: () => console.log('Profile') },
    { label: 'Settings', action: () => console.log('Settings') },
    { label: 'Logout', action: handleLogout }
  ];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body-medium" className="text-muted-foreground">
            Loading...
          </Typography>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Get current navigation item and layout
  const currentNavItem = navigationItems.find(item => item.path === location.pathname) || navigationItems[0];
  const CurrentLayout = currentNavItem.layout;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <Typography variant="heading-large" className="text-foreground">
              TaskFlow Admin
            </Typography>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 group ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={item.description}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Typography variant="heading-large" className="text-foreground">
              {currentNavItem.name}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              {currentNavItem.description}
            </Typography>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            <Dropdown
              trigger={
                <div className="flex items-center space-x-2 hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar size="sm" className="bg-primary text-primary-foreground">
                    <span className="text-sm font-medium">
                      {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </Avatar>
                  <div className="text-left">
                    <Typography variant="body-medium" className="text-foreground">
                      {currentAdmin?.name || currentAdmin?.email || 'Admin User'}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Typography>
                  </div>
                </div>
              }
            >
              {userMenuItems.map((item, index) => (
                <DropdownItem key={index} onClick={item.action}>
                  {item.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </header>

        {/* Page Content - Render the current layout */}
        <main className="flex-1 overflow-auto p-6">
          <CurrentLayout />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
