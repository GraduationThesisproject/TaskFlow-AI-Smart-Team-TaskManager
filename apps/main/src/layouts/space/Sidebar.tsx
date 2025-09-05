import React, { useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Grid, BarChart3, Settings, ArrowLeft, X, Users, Archive } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  Button,
} from "@taskflow/ui";
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Space } from '../../types/space.types';

interface SpaceSidebarProps {
  locationPath?: string;
  locationHash?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
  mobile?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  currentSpace?: Space;
}

const SpaceSidebar: React.FC<SpaceSidebarProps> = ({
  locationPath = '',
  sidebarCollapsed = false,
  setSidebarCollapsed,
  mobile = false,
  mobileMenuOpen = false,
  setMobileMenuOpen,
  currentSpace
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close mobile menu when clicking outside
  useClickOutside(sidebarRef, () => {
    if (mobile && mobileMenuOpen && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  });

  const handleBackNavigation = useCallback((href: string) => {
    console.log('Navigating back to:', href);
    navigate(href);
    if (mobile && mobileMenuOpen && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [navigate, mobile, mobileMenuOpen, setMobileMenuOpen]);

  const section = 'space' as const;

  // Navigation items for space
  const { title, items, backLink } = useMemo(() => {
    return {
      title: currentSpace?.name || 'Space',
      items: [
        { icon: Home, label: 'Overview', href: '/space' },
        { icon: Grid, label: 'Boards', href: '/space/boards' },
        { icon: Users, label: 'Members', href: '/space/members' },
        { icon: BarChart3, label: 'Analytics', href: '/space/analytics' },
        { icon: Archive, label: 'Archive', href: '/space/archive' },
        { icon: Settings, label: 'Settings', href: '/space/settings' },
      ],
      backLink: { href: '/workspace', label: 'Workspace' },
    };
  }, [currentSpace?.name]);

  const isSpace = section === 'space';
  const hideTitle = isSpace;
  const effectiveBackLink = backLink
    ? (isSpace ? { ...backLink, label: title } : backLink)
    : undefined;

  // Suppress active highlighting for Overview
  const suppressedActiveHrefs = useMemo(() => new Set(['/space']), []);
  const isActiveRoute = useCallback((href: string) => {
    if (suppressedActiveHrefs.has(href)) return false;
    
    // Handle settings routes properly
    if (href.includes('/settings/')) {
      return locationPath === href || locationPath.startsWith(href);
    }
    
    return locationPath === href || locationPath.startsWith(`${href}/`);
  }, [locationPath, suppressedActiveHrefs]);

  if (mobile) {
    return (
      <>
        {/* Mobile Toggle Button - Always visible */}
        {!mobileMenuOpen && <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="fixed top-16 left-4 z-[60] lg:hidden bg-background/95 backdrop-blur-sm border border-border shadow-lg hover:bg-background/100 hover:scale-105 transition-all duration-200 rounded-md h-8 w-8 p-0"
          aria-label="Open mobile menu"
        >
          <div className="flex flex-col gap-0.5 w-4 h-4 items-center justify-center">
            <div className="w-3 h-0.5 bg-foreground transition-all" />
            <div className="w-3 h-0.5 bg-foreground transition-all" />
            <div className="w-3 h-0.5 bg-foreground transition-all" />
          </div>
        </Button>}
        
        {/* Mobile Sidebar */}
        <div ref={sidebarRef}>
          <Sidebar
            className={
              `fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ` +
              (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
            }
            collapsed={!!sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          >
            <SidebarHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {effectiveBackLink && !sidebarCollapsed && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary"
                        onClick={() => handleBackNavigation(effectiveBackLink.href)}
                        aria-label={effectiveBackLink?.label ? `Back to ${effectiveBackLink.label}` : 'Back'}
                      >
                        <ArrowLeft size={18} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
                      </Button>
                    </div>
                  )}
                  {!sidebarCollapsed && !hideTitle && (
                    <div className="text-lg font-semibold tracking-tight text-foreground px-1">
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
                  className="h-8 w-8 p-0"
                >
                  <X size={18} />
                </Button>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <div className="flex flex-col h-full">
                <SidebarNav>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.href}>
                        <Link
                          to={item.href}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            sidebarCollapsed ? 'justify-center px-0 gap-0' : 'justify-start'
                          } ${
                            isActiveRoute(item.href)
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-gray-100'
                          }`}
                          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                        >
                          <Icon size={16} className="shrink-0" />
                          {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                        </Link>
                      </div>
                    );
                  })}
                </SidebarNav>
                <div className="flex-1" />
              </div>
            </SidebarContent>
          </Sidebar>
        </div>
      </>
    );
  }

  // Desktop
  return (
    <Sidebar collapsed={!!sidebarCollapsed} onCollapse={setSidebarCollapsed} className="hidden lg:flex">
      <SidebarHeader>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed && setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-2.5 p-0 h-auto"
            aria-label="Toggle sidebar"
          >
            <div className="flex flex-col gap-0.5 w-6 h-6 items-center justify-center">
              <div className="w-3 h-0.5 bg-foreground" />
              <div className="w-3 h-0.5 bg-foreground" />
              <div className="w-3 h-0.5 bg-foreground" />
            </div>
          </Button>
          {effectiveBackLink && !sidebarCollapsed && (
            <div className="flex items-center gap-3">
              {!sidebarCollapsed && (
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {effectiveBackLink.label}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary"
                onClick={() => handleBackNavigation(effectiveBackLink.href)}
                aria-label={effectiveBackLink?.label ? `Back to ${effectiveBackLink.label}` : 'Back'}
              >
                <ArrowLeft size={18} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
              </Button>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex flex-col h-full">
          <SidebarNav>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      sidebarCollapsed ? 'justify-center px-0 gap-0' : 'justify-start'
                    } ${
                      isActiveRoute(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                </div>
              );
            })}
          </SidebarNav>
          <div className="flex-1" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default SpaceSidebar;
