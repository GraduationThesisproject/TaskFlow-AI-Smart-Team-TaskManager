import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAdmin, getCurrentAdmin } from '../store/slices/adminSlice';
import { Typography, Avatar, Dropdown, DropdownItem } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  HeartIcon,
  PuzzlePieceIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// Import NotificationBell component
import { NotificationBell } from '../components/NotificationBell';

// Import all layouts
import DashboardLayout from '../layouts/DashboardLayout';
import UserManagementLayout from '../layouts/UserManagementLayout';
import TemplatesLayout from '../layouts/TemplatesLayout';
import AnalyticsLayout from '../layouts/AnalyticsLayout';
import IntegrationsLayout from '../layouts/IntegrationsLayout';
import SystemHealthLayout from '../layouts/SystemHealthLayout';
import NotificationsLayout from '../layouts/NotificationsLayout';
import SettingsLayout from '../layouts/SettingsLayout';
import ProfileLayout from '../layouts/ProfileLayout';

// Import language context and translation hook
import { useLanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  layout: React.ComponentType;
}

const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAdmin, isAuthenticated, isLoading } = useAppSelector(state => state.admin);
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = [
    {
      name: t('navigation.dashboard'),
      path: '/dashboard',
      icon: HomeIcon,
      description: t('dashboard.overview'),
      layout: DashboardLayout
    },
    {
      name: t('navigation.usersAndRoles'),
      path: '/users',
      icon: UsersIcon,
      description: t('userManagement.manageUsers'),
      layout: UserManagementLayout
    },
    {
      name: t('navigation.templates'),
      path: '/templates',
      icon: DocumentTextIcon,
      description: 'System templates and configurations',
      layout: TemplatesLayout
    },
    {
      name: t('navigation.analytics'),
      path: '/analytics',
      icon: ChartBarIcon,
      description: 'Global statistics and insights',
      layout: AnalyticsLayout
    },
    {
      name: t('navigation.integrations'),
      path: '/integrations',
      icon: PuzzlePieceIcon,
      description: 'Third-party integrations and API keys',
      layout: IntegrationsLayout
    },
    {
      name: t('navigation.systemHealth'),
      path: '/system-health',
      icon: HeartIcon,
      description: 'Monitor system performance and health',
      layout: SystemHealthLayout
    },
    {
      name: t('navigation.notifications'),
      path: '/notifications',
      icon: BellIcon,
      description: 'System announcements and communication',
      layout: NotificationsLayout
    },
    {
      name: t('navigation.settings'),
      path: '/settings',
      icon: CogIcon,
      description: 'System configuration and preferences',
      layout: SettingsLayout
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      description: 'Manage your personal profile and account',
      layout: ProfileLayout
    }
  ];

  // Check authentication on mount
  React.useEffect(() => {
    console.log('AdminPage: useEffect triggered:', { isAuthenticated, isLoading, hasCurrentAdmin: !!currentAdmin });
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem('adminToken');
      console.log('AdminPage: checking token:', !!token);
      if (token) {
        console.log('AdminPage: token found, dispatching getCurrentAdmin');
        dispatch(getCurrentAdmin());
      } else {
        console.log('AdminPage: no token, navigating to login');
        navigate('/login');
      }
    }
  }, [dispatch, isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    console.log('=== LOGOUT DEBUG START ===');
    console.log('Logout started...');
    console.log('Current state before logout:', { isAuthenticated, currentAdmin });
    console.log('Current location:', location.pathname);
    console.log('Token in localStorage:', !!localStorage.getItem('adminToken'));
    
    try {
      console.log('Dispatching logoutAdmin...');
      await dispatch(logoutAdmin()).unwrap();
      console.log('Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout by clearing local state
      console.log('Force clearing localStorage and navigating...');
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
    console.log('=== LOGOUT DEBUG END ===');
  };

  const userMenuItems = [
    { 
      label: 'Profile', 
      action: () => {
        console.log('=== PROFILE CLICKED ===');
        console.log('Profile clicked');
        navigate('/profile');
      },
      icon: UserIcon 
    },
    { 
      label: 'Settings', 
      action: () => {
        console.log('=== SETTINGS CLICKED ===');
        console.log('Settings clicked');
        navigate('/settings');
      },
      icon: CogIcon 
    },
    { 
      label: 'Logout', 
      action: () => {
        console.log('=== LOGOUT CLICKED FROM DROPDOWN ===');
        console.log('Logout clicked from menu');
        handleLogout();
      },
      icon: ArrowRightOnRectangleIcon,
      variant: 'destructive' as const
    }
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

  // Ensure we have admin data before rendering layouts
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body-medium" className="text-muted-foreground">
            Loading admin data...
          </Typography>
        </div>
      </div>
    );
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
            <NotificationBell />
            
            {/* Test Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Test Logout
            </button>
            
            <Dropdown
              trigger={
                <div className="flex items-center space-x-2 hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar size="sm" className="bg-primary text-primary-foreground">
                    <span className="text-sm font-medium">
                      {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </Avatar>
                  <div className="flex flex-col items-start space-y-1">
                    <Typography variant="body-medium" className="text-foreground font-medium">
                      {currentAdmin?.name || currentAdmin?.email || 'Admin User'}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Typography>
                  </div>
                </div>
              }
            >
              {userMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`w-full text-left p-2 rounded-lg transition-colors hover:bg-muted flex items-center space-x-2 ${
                      item.variant === 'destructive' ? 'text-red-600 hover:text-red-700' : 'text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
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
