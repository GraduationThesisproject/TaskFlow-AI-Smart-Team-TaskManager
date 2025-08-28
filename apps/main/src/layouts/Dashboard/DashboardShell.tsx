import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, FileText, BarChart3, X, Settings, Users, ArrowLeft, Palette, Bell, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  Button,
} from "@taskflow/ui";

import type { DashboardShellProps } from '../../types/dash.types';
import { RecentActivity } from '../../components/dashboard/home/RecentActivity';

type NavItem = { icon: LucideIcon; label: string; href: string };

type UniversalSidebarProps = {
  locationPath: string;
  locationHash?: string;
  // desktop
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (v: boolean) => void;
  // mobile
  mobile?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (v: boolean) => void;
};

function UniversalSidebar({
  locationPath,
  locationHash,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobile,
  mobileMenuOpen,
  setMobileMenuOpen,
}: UniversalSidebarProps) {
  // Detect section from path
  const getSectionFromPath = (pathname: string): 'dashboard' | 'workspace' | 'boards' | 'settings' => {
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/board')) return 'boards';
    if (pathname.startsWith('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };

  // Universal config per section
  const getSectionConfig = (sectionName: ReturnType<typeof getSectionFromPath>): {
    title: string;
    items: NavItem[];
    backLink?: { href: string; label: string };
  } => {
    if (sectionName === 'workspace') {
      return {
        title: 'Workspace',
        items: [
          { icon: Users, label: 'Workspace Management', href: '/workspace' },
          { icon: BarChart3, label: 'Reports', href: '/workspace/reports' },
          { icon: Settings, label: 'Settings', href: '/workspace/settings' },
        ],
        backLink: { href: '/dashboard', label: 'Dashboard' },
      };
    }
    if (sectionName === 'settings') {
      return {
        title: 'Settings',
        items: [
          { icon: Settings, label: 'Profile', href: '/dashboard/settings#profile' },
          { icon: Palette, label: 'Theme settings', href: '/dashboard/settings#theme' },
          { icon: Bell, label: 'Notifications', href: '/dashboard/settings#notifications' },
          { icon: Zap, label: 'Upgrade', href: '/dashboard/settings#upgrade' },
        ],
        backLink: { href: '/dashboard', label: 'Dashboard' },
      };
    }
    // dashboard default
    return {
      title: 'Dashboard',
      items: [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: FileText, label: 'Templates', href: '/dashboard/templates' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      ],
    };
  };

  const section = getSectionFromPath(locationPath);
  const { title, items, backLink } = getSectionConfig(section);
  const isWorkspace = section === 'workspace';
  // In workspace: hide title and show arrow + Workspace (title) as the back control label
  const hideTitle = isWorkspace;
  const effectiveBackLink = backLink
    ? (isWorkspace ? { ...backLink, label: title } : backLink)
    : undefined;

  // Suppress active highlighting for Home and Workspace Management
  const suppressedActiveHrefs = new Set(['/dashboard', '/workspace']);
  const isActiveRoute = (href: string) => {
    if (suppressedActiveHrefs.has(href)) return false;
    // handle hash targets for settings
    if (href.includes('#')) {
      const hash = '#' + href.split('#')[1];
      return locationPath.startsWith('/dashboard/settings') && locationHash === hash;
    }
    return locationPath === href || locationPath.startsWith(`${href}/`);
  };

  const showRecentAfter: string | undefined = section === 'dashboard' ? 'Analytics' : undefined;

  if (mobile) {
    return (
      <>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          />
        )}
        <Sidebar
          className="fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300"
          collapsed={!!sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        >
          <SidebarHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                {effectiveBackLink && (
                  <div className="flex items-center gap-4">
                    {!sidebarCollapsed && (
                      <span className={isWorkspace ? 'text-2xl font-bold tracking-tight text-foreground' : 'text-sm'}>
                        {effectiveBackLink.label}
                      </span>
                    )}
                    <Button
                      variant={isWorkspace ? 'ghost' : 'secondary'}
                      size="icon"
                      className={
                        (isWorkspace
                          ? 'h-10 w-10 '
                          : 'h-10 w-10 rounded-full ') +
                        'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                      }
                      asChild
                    >
                      <Link to={effectiveBackLink.href} aria-label={`Back to ${effectiveBackLink.label}`}>
                        <ArrowLeft size={20} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
                      </Link>
                    </Button>
                  </div>
                )}
                {!sidebarCollapsed && !hideTitle && (
                  <div className="text-2xl font-bold tracking-tight text-foreground px-1">
                    {title}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-0 h-auto"
                aria-label="Close sidebar"
              >
                <div className="flex flex-col gap-1 w-8 h-8 items-center justify-center">
                  <div className="w-4 h-0.5 bg-foreground" />
                  <div className="w-4 h-0.5 bg-foreground" />
                  <div className="w-4 h-0.5 bg-foreground" />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <div className="flex flex-col h-full">
              <SidebarNav>
                {items.map((item) => {
                  const Icon = item.icon;
                  const showRecent = showRecentAfter === item.label;
                  return (
                    <div key={item.href}>
                      <SidebarNavItem
                        href={item.href}
                        active={isActiveRoute(item.href)}
                        onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                        className={sidebarCollapsed ? 'justify-center px-0 gap-0' : 'justify-start'}
                      >
                        <Icon size={18} className="shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </SidebarNavItem>
                      {showRecent && (
                        <div className="px-3 pt-3">
                          <RecentActivity />
                        </div>
                      )}
                    </div>
                  );
                })}
              </SidebarNav>
              <div className="flex-1" />
            </div>
          </SidebarContent>
        </Sidebar>

      </>
    );
  }

  // Desktop
  return (
    <Sidebar collapsed={!!sidebarCollapsed} onCollapse={setSidebarCollapsed} className="hidden lg:flex">
      <SidebarHeader>
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed && setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 p-0 h-auto"
            aria-label="Toggle sidebar"
          >
            <div className="flex flex-col gap-1 w-8 h-8 items-center justify-center">
              <div className="w-4 h-0.5 bg-foreground" />
              <div className="w-4 h-0.5 bg-foreground" />
              <div className="w-4 h-0.5 bg-foreground" />
            </div>
          </Button>
          {effectiveBackLink && (
            <div className="flex items-center gap-4">
              {!sidebarCollapsed && (
                <span className={isWorkspace ? 'text-2xl font-bold tracking-tight text-foreground' : 'text-sm'}>
                  {effectiveBackLink.label}
                </span>
              )}
              <Button
                variant={isWorkspace ? 'ghost' : 'secondary'}
                size="icon"
                className={
                  (isWorkspace
                    ? 'h-10 w-10 '
                    : 'h-10 w-10 rounded-full ') +
                  'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                }
                asChild
              >
                <Link to={effectiveBackLink.href} aria-label={`Back to ${effectiveBackLink.label}`}>
                  <ArrowLeft size={20} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
                </Link>
              </Button>
            </div>
          )}
          {!sidebarCollapsed && !hideTitle && (
            <div className="text-2xl font-bold tracking-tight text-foreground px-1">
              {title}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex flex-col h-full">
          <SidebarNav>
            {items.map((item) => {
              const Icon = item.icon;
              const showRecent = !sidebarCollapsed && showRecentAfter === item.label;
              return (
                <div key={item.href}>
                  <SidebarNavItem
                    href={item.href}
                    active={isActiveRoute(item.href)}
                    className={sidebarCollapsed ? 'justify-center px-0 gap-0' : 'justify-start'}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </SidebarNavItem>
                  {showRecent && (
                    <div className="px-3 pt-3">
                      <RecentActivity />
                    </div>
                  )}
                </div>
              );
            })}
          </SidebarNav>
          <div className="flex-1" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <UniversalSidebar
        locationPath={location.pathname}
        locationHash={location.hash}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Mobile Sidebar */}
      <UniversalSidebar
        locationPath={location.pathname}
        locationHash={location.hash}
        mobile
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-visible p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

