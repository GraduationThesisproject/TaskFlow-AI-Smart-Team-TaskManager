import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@taskflow/ui";
import { Menu, X } from "lucide-react";
import type { UniversalNavbarProps, NavigationItem } from "../../../types/navbar";

// Import all necessary components from consolidated navbar folder
import { BaseNavbar, NavbarLeft, NavbarCenter, NavbarRight } from "./BaseNavbar";
import { Logo } from "./Logo";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { AuthButtons } from "./AuthButtons";
import { MenuButton } from "./MenuButton";
import { NavigationActions } from "./NavigationActions";
import { SearchBar } from "./SearchBar";
import { DashboardActions } from "./DashboardActions";
import { NotificationButton } from "./NotificationButton";
import { UserProfile } from "./UserProfile";
import { NavigationLinks } from "./NavigationLinks";
import { MobileMenu } from "./MobileMenu";

export default function UniversalNavbar({ 
  user, 
  onLogout, 
  isAuthenticated = false, 
  className = "" 
}: UniversalNavbarProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount] = useState(3);

  // Determine navbar type based on authentication and location
  const getNavbarType = () => {
    if (isAuthenticated ) {
      return 'auth';
    }
    if (!isAuthenticated && (location.pathname === '/' || location.pathname.startsWith('/landing'))) {
      return 'landing';
    }
    return 'auth'; // For signin/signup pages
  };

  const navbarType = getNavbarType();

  // Landing page navigation items
  const landingNavigationItems: NavigationItem[] = [
    { 
      name: "Product", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Task Management", href: "/features/tasks", description: "Organize and track your tasks" },
        { name: "Team Collaboration", href: "/features/collaboration", description: "Work together seamlessly" },
        { name: "Analytics", href: "/features/analytics", description: "Insights and reporting" }
      ]
    },
    { 
      name: "Solutions", 
      hasDropdown: true,
      dropdownItems: [
        { name: "For Teams", href: "/solutions/teams", description: "Perfect for small to medium teams" },
        { name: "For Enterprise", href: "/solutions/enterprise", description: "Scale with confidence" }
      ]
    },
    { 
      name: "Resources", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Documentation", href: "/docs", description: "Learn how to use TaskFlow" },
        { name: "Blog", href: "/blog", description: "Latest updates and tips" },
        { name: "Support", href: "/support", description: "Get help when you need it" }
      ]
    },
    { name: "Pricing", hasDropdown: false, href: "/pricing" },
    { name: "Enterprise", hasDropdown: false, href: "/enterprise" },
  ];

  // Render Dashboard Navbar
  if (navbarType === 'auth') {
    return (
      <BaseNavbar className={`bg-black border-b border-gray-700 ${className}`}>
        <NavbarLeft>
          <MenuButton 
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          <Logo />
          <NavigationActions className="ml-8" />
        </NavbarLeft>

        <NavbarCenter>
          <SearchBar className="mx-8" />
        </NavbarCenter>

        <NavbarRight>
          <DashboardActions />
          <ThemeToggleButton />
          <NotificationButton count={notificationCount} />
          <UserProfile user={user} onLogout={onLogout} />
        </NavbarRight>
      </BaseNavbar>
    );
  }

  // Render Landing Navbar
  if (navbarType === 'landing') {
    return (
      <BaseNavbar className={`bg-black border-b border-gray-800 ${className}`}>
        <NavbarLeft>
          <Logo />
          <NavigationLinks items={landingNavigationItems} className="hidden md:flex" />
        </NavbarLeft>

        <NavbarRight>
          <AuthButtons className="hidden md:flex" />
          <ThemeToggleButton className="hidden md:flex" />

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white bg-transparent"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </NavbarRight>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <MobileMenu 
            items={landingNavigationItems} 
            isOpen={isMenuOpen}
          />
        )}
      </BaseNavbar>
    );
  }

  // Render Auth Navbar (for signin/signup pages)
  return (
    <BaseNavbar className={className}>
      <NavbarLeft>
        <Logo />
      </NavbarLeft>

      <NavbarRight>
        <AuthButtons />
        <ThemeToggleButton />
      </NavbarRight>
    </BaseNavbar>
  );
}
