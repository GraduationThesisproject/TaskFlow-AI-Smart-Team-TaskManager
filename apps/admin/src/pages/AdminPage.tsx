import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAdmin, getCurrentAdmin } from '../store/slices/adminSlice';
import { getAvatarUrl } from '../services/adminService';
import { Typography, Avatar, Dropdown, DropdownItem } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme';
import { ConfirmationDialog } from '../components/common';
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
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon
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
import PowerBILayout from '../layouts/PowerBILayout';
import ChatLayout from '../layouts/ChatLayout';
import PermissionTestPage from './PermissionTestPage';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      name: 'System Health',
      path: '/system-health',
      icon: HeartIcon,
      description: 'Monitor system performance and health',
      layout: SystemHealthLayout
    },
    {
      name: 'Power BI',
      path: '/powerbi',
      icon: ChartBarIcon,
      description: 'Power BI reports and analytics',
      layout: PowerBILayout
    },
    {
      name: 'Customer Support',
      path: '/chat',
      icon: ChatBubbleLeftIcon,
      description: 'Manage customer support chats and inquiries',
      layout: ChatLayout
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: BellIcon,
      description: 'Manage system notifications and alerts',
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
    },
    {
      name: '🔒 Permission Test',
      path: '/permission-test',
      icon: ShieldCheckIcon,
      description: 'Test the permission system and verify access controls',
      layout: PermissionTestPage
    }
  ];

  // Check authentication on mount
  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    // Only try to get current admin if we have a token and aren't already authenticated
    if (token && !isAuthenticated && !isLoading) {
      console.log('🔐 Token found, fetching admin info...');
      dispatch(getCurrentAdmin());
    } else if (!token) {
      // No token, redirect to login
      console.log('❌ No token found, redirecting to login...');
      navigate('/login');
    }
  }, []); // Empty dependency array to run only once on mount

  // Handle authentication state changes
  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('❌ No token and not authenticated, redirecting to login...');
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Add a delay to ensure authentication is properly established
  React.useEffect(() => {
    if (isAuthenticated && currentAdmin) {
      console.log('✅ Authentication established, admin data loaded');
    }
  }, [isAuthenticated, currentAdmin]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      navigate('/login');
    } catch (error) {
      // Force logout by clearing local state
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  // Close sidebar when navigating on mobile
  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const userMenuItems = [
    { 
      label: 'Profile', 
      action: () => {
        navigate('/profile');
      },
      icon: UserIcon 
    },
    { 
      label: 'Settings', 
      action: () => {
        navigate('/settings');
      },
      icon: CogIcon 
    },
    { 
      label: 'Logout', 
      action: () => {
        setShowLogoutConfirm(true);
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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <Typography variant="heading-large" className="text-foreground">
                TaskFlow Admin
              </Typography>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <Typography variant="heading-large" className="text-foreground truncate">
                {currentNavItem.name}
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground truncate">
                {currentNavItem.description}
              </Typography>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <NotificationBell />
            
            <Dropdown
              trigger={
                <div className="flex items-center space-x-2 hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar size="sm" className="bg-primary text-primary-foreground flex-shrink-0">
                    {currentAdmin?.avatar ? (
                      <img 
                        src={getAvatarUrl(currentAdmin.avatar)} 
                        alt={currentAdmin?.name || 'Admin'} 
                        className="w-full h-full object-cover rounded-full"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          // Hide the image on error and show fallback
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-sm font-medium ${currentAdmin?.avatar ? 'hidden' : ''}`}>
                      {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start space-y-1 min-w-0">
                    <Typography variant="body-medium" className="text-foreground font-medium truncate">
                      {currentAdmin?.name || currentAdmin?.email || 'Admin User'}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground truncate">
                      {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Typography>
                  </div>
                </div>
              }
            >
              {userMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <DropdownItem
                    key={index}
                    onClick={item.action}
                    variant={item.variant === 'destructive' ? 'destructive' : 'default'}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </DropdownItem>
                );
              })}
            </Dropdown>
          </div>
        </header>

        {/* Page Content - Render the current layout */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <CurrentLayout />
        </main>
      </div>
      
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title={t('logout.confirmTitle')}
        description={t('logout.confirmMessage')}
        confirmText={t('logout.confirmButton')}
        cancelText={t('logout.cancelButton')}
        type="warning"
      />
    </div>
  );
};

export default AdminPage;
