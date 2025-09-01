import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  AvatarFallback,
  AvatarImage,
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Typography,
} from "@taskflow/ui";
import { Menu, X, User, LogOut } from "lucide-react";
import Logo from "../Logo";
import { Avatar } from "@taskflow/ui";
import { useAuth } from "../../../hooks";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const navigationItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated &&
              navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={onChatClick}>
                  Support
                </Button>
                <Dropdown
                  trigger={
                    <Button variant="ghost" className="gap-2 px-3 h-10">
                      <Avatar
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {user?.user?.avatar && (
                          <AvatarImage
                            src={user?.user?.avatar}
                            alt={user?.user?.name || "User"}
                          />
                        )}
                        <AvatarFallback>
                          {user?.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[120px] text-foreground">
                        {user?.user?.name || user?.user?.email || "User"}
                      </span>
                    </Button>
                  }
                >
                  <DropdownItem onClick={() => {
                    navigate('/dashboard/settings/profile');
                    // Close dropdown after a short delay to allow navigation
                    setTimeout(() => {
                      const dropdownButton = document.querySelector('[aria-expanded="true"]') as HTMLButtonElement;
                      if (dropdownButton) {
                        dropdownButton.click();
                      }
                    }, 100);
                  }}>
                    <User className="h-4 w-4 mr-2" />
                    <Typography variant="body-small">View Profile</Typography>
                  </DropdownItem>

                  <DropdownSeparator />
                  <DropdownItem variant="destructive" onClick={() => {
                    onLogout?.();
                    // Close dropdown after a short delay to allow logout
                    setTimeout(() => {
                      const dropdownButton = document.querySelector('[aria-expanded="true"]') as HTMLButtonElement;
                      if (dropdownButton) {
                        dropdownButton.click();
                      }
                    }, 100);
                  }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <Typography variant="body-small">Logout</Typography>
                  </DropdownItem>
                </Dropdown>
              </div>
            ) : (
              location.pathname !== "/signin" &&
              location.pathname !== "/signup" && (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate("/signin")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/signup")}>
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
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={onChatClick}
                    >
                      Support
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onLogout}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/signin")}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full"
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
