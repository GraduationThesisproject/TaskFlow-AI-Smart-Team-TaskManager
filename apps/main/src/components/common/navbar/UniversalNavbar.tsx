  import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { UniversalNavbarProps, NavigationItem } from '../../../types/navbar';
import { BaseNavbar, NavbarLeft, NavbarCenter, NavbarRight } from './BaseNavbar';
import { Logo } from './Logo';
import { ThemeToggleButton } from './ThemeToggleButton';
// Removed NavigationActions (Home/Create) and SearchBar to simplify the top navbar
import { DashboardActions } from './DashboardActions';
import { NavigationLinks } from './NavigationLinks';
import { MobileMenu } from './MobileMenu';
import { UserProfile } from './UserProfile';

export default function UniversalNavbar({
  user,
  onLogout,
  isAuthenticated = false,
  className = '',
}: UniversalNavbarProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine navbar type based on authentication and location
  const getNavbarType = () => {
    if (isAuthenticated) return 'auth';
    if (!isAuthenticated && (location.pathname === '/' || location.pathname.startsWith('/landing'))) {
      return 'landing';
    }
    return 'auth'; // default to auth layout for sign-in/up pages
  };

  const navbarType = getNavbarType();

  // Landing page navigation items
  const landingNavigationItems: NavigationItem[] = [
    {
      name: 'Product',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Task Management', href: '/features/tasks', description: 'Organize and track your tasks' },
        { name: 'Team Collaboration', href: '/features/collaboration', description: 'Work together seamlessly' },
        { name: 'Analytics', href: '/features/analytics', description: 'Insights and reporting' },
      ],
    },
    {
      name: 'Solutions',
      hasDropdown: true,
      dropdownItems: [
        { name: 'For Teams', href: '/solutions/teams', description: 'Perfect for small to medium teams' },
        { name: 'For Enterprise', href: '/solutions/enterprise', description: 'Scale with confidence' },
      ],
    },
    {
      name: 'Resources',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Documentation', href: '/docs', description: 'Learn how to use TaskFlow' },
        { name: 'Blog', href: '/blog', description: 'Latest updates and tips' },
        { name: 'Support', href: '/support', description: 'Get help when you need it' },
      ],
    },
    { name: 'Pricing', hasDropdown: false, href: '/pricing' },
    { name: 'Enterprise', hasDropdown: false, href: '/enterprise' },
  ];

  // Render Authenticated/Dashboard Navbar
  if (navbarType === 'auth') {
    return (
      <BaseNavbar className={`bg-black border-b border-gray-700 ${className}`}>
        <NavbarLeft>
          <Logo />
        </NavbarLeft>

        <NavbarRight>
          <DashboardActions onChatClick={onChatClick} />
          <ThemeToggleButton />
          <UserProfile user={user} onLogout={onLogout} />
        </NavbarRight>
      </BaseNavbar>
    );
  }

  // Render Landing Page Navbar
  return (
    <BaseNavbar className={`bg-white border-b border-gray-200 ${className}`}>
      <NavbarLeft>
        <Logo />
      </NavbarLeft>

      <NavbarCenter>
        <NavigationLinks items={landingNavigationItems} />
      </NavbarCenter>

      <NavbarRight>
        <UserProfile user={user} onLogout={onLogout} />
      </NavbarRight>

      {/* Mobile dropdown (visible only on small screens) */}
      <MobileMenu items={landingNavigationItems} isOpen={isMenuOpen} />
    </BaseNavbar>
  );
}
