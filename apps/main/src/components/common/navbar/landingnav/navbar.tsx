import { useState } from "react";
import { Button } from "@taskflow/ui";
import { Menu, X } from "lucide-react";
import { BaseNavbar, NavbarLeft, NavbarRight } from "../authNav/BaseNavbar";
import { Logo } from "../authNav/Logo";
import { ThemeToggleButton } from "../authNav/ThemeToggleButton";
import { NavigationLinks } from "./NavigationLinks";
import { LandingAuthButtons } from "./LandingAuthButtons";
import { MobileMenu } from "./MobileMenu";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
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

  return (
    <BaseNavbar className="">
      <NavbarLeft>
        <Logo />
        
        {/* Desktop Navigation Links */}
        <NavigationLinks items={navigationItems} className="hidden md:flex" />
      </NavbarLeft>

      <NavbarRight>
        {/* Desktop Auth Buttons */}
        <LandingAuthButtons className="hidden md:flex" />

        {/* Theme Toggle Button */}
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
          items={navigationItems} 
          isOpen={isMenuOpen}
        />
      )}
    </BaseNavbar>
  );
}
