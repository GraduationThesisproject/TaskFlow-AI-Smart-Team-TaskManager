// Navbar Types and Interfaces

// Base navbar component interfaces
export interface BaseNavbarProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

export interface User {
  user?: {
    name?: string;
    avatar?: string;
    email?: string;
  };
}

export type UserType = User | null;

export interface NavigationItem {
  name: string;
  hasDropdown: boolean;
  href?: string;
  dropdownItems?: Array<{
    name: string;
    href: string;
    description?: string;
  }>;
}

// Auth Navbar Props
export interface AuthNavbarProps {
  className?: string;
}

// Dashboard Navbar Props
export interface DashboardNavbarProps {
  user?: User;
  onLogout?: () => void;
  className?: string;
}

// Landing Navbar Props
export interface LandingNavbarProps {
  className?: string;
}

// Universal Navbar Props
export interface UniversalNavbarProps {
  user?: User;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  className?: string;
  onChatClick?: () => void;
}

// Component Props
export interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export interface NavigationLinksProps {
  items: NavigationItem[];
  className?: string;
}

export interface NavigationActionsProps {
  className?: string;
}

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export interface DashboardActionsProps {
  className?: string;
}

export interface NotificationButtonProps {
  count?: number;
  className?: string;
}

export interface UserProfileProps {
  user?: User;
  onLogout?: () => void;
  className?: string;
}

export interface LandingAuthButtonsProps {
  className?: string;
}

export interface ThemeToggleButtonProps {
  className?: string;
}

// Navbar Types
export type NavbarType = 'landing' | 'auth' | 'dashboard';

export interface NavbarConfig {
  type: NavbarType;
  showLogo: boolean;
  showSearch: boolean;
  showUserProfile: boolean;
  showAuthButtons: boolean;
  showDashboardActions: boolean;
  showThemeToggle: boolean;
}
