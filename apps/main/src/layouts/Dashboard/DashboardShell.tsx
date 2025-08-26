import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Settings, FileText, BarChart3, X } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  Button,
  Typography,
} from '@taskflow/ui';

import type { DashboardShellProps } from '../../types/dash.types';


const navigationItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: FileText, label: 'Templates', href: '/dashboard/templates' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // User info removed from sidebar footer per requirements

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        className="hidden lg:flex"
      >
        <SidebarHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 p-0 h-auto"
            aria-label="Toggle sidebar"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!sidebarCollapsed && (
              <Typography
                variant="h3"
                className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              >
                TaskFlow AI
              </Typography>
            )}
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  active={isActiveRoute(item.href)}
                  className="justify-start"
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </SidebarNavItem>
              );
            })}
          </SidebarNav>
        </SidebarContent>


      </Sidebar>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-0 h-auto"
              aria-label="Close sidebar"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <Typography variant="h3" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TaskFlow AI
              </Typography>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  active={isActiveRoute(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="justify-start"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </SidebarNavItem>
              );
            })}
          </SidebarNav>
        </SidebarContent>

 
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Topbar and NotificationBell removed as per refactor; notifications now live in UserProfile

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
