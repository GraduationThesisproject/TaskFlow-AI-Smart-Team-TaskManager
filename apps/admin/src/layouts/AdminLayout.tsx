import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAdmin, getCurrentAdmin } from '../store/slices/adminSlice';
import { Button, Typography, Avatar, Dropdown } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme/ThemeProvider';
import { 
  HomeIcon, 
  UsersIcon, 
  TemplateIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
  HeartIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and key metrics'
  },
  {
    name: 'Users & Roles',
    path: '/users',
    icon: UsersIcon,
    description: 'Manage user accounts and permissions'
  },
  {
    name: 'Templates',
    path: '/templates',
    icon: TemplateIcon,
    description: 'System templates and configurations'
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: ChartBarIcon,
    description: 'Global statistics and insights'
  },
  {
    name: 'Integrations',
    path: '/integrations',
    icon: PuzzlePieceIcon,
    description: 'Third-party integrations and API keys'
  },
  {
    name: 'System Health',
    path: '/system-health',
    icon: HeartIcon,
    description: 'Monitor system performance and health'
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: BellIcon,
    description: 'System announcements and communication'
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: CogIcon,
    description: 'System configuration and preferences'
  }
];

const AdminLayout: React.FC = () => {
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
            <Typography variant="heading-medium" className="text-foreground">
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
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              {navigationItems.find(item => item.path === location.pathname)?.description || ''}
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
                <button className="flex items-center space-x-2 hover:bg-muted p-2 rounded-lg transition-colors">
                  <Avatar size="sm" className="bg-primary text-primary-foreground">
                    {currentAdmin?.avatar ? (
                      <img src={currentAdmin.avatar} alt={currentAdmin.name || 'Admin'} />
                    ) : (
                      <span className="text-sm font-medium">
                        {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </Avatar>
                  <div className="text-left">
                    <Typography variant="body-medium" className="text-foreground">
                      {currentAdmin?.name || 'Admin User'}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {currentAdmin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </Typography>
                  </div>
                </button>
              }
              items={userMenuItems}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
