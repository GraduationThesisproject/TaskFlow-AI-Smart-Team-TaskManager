import  { useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FileText, BarChart3, X, Settings, Users, ArrowLeft, Palette, Bell, Zap, Clock } from 'lucide-react';
import type { NavItem } from '../../types/dash.types';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  Button,
} from "@taskflow/ui";
import { RecentActivity } from '../../components/dashboard/home/RecentActivity';
import type { UniversalSidebarProps } from '../../types/dash.types';
import { useClickOutside } from '../../hooks/useClickOutside';

export function SideBarDashboard({
  locationPath,
  locationHash,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobile,
  mobileMenuOpen,
  setMobileMenuOpen,
}: UniversalSidebarProps) {
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

  const section = useMemo(() => {
    if (locationPath.startsWith('/workspace')) return 'workspace' as const;
    if (locationPath.startsWith('/board')) return 'boards' as const;
    if (locationPath.startsWith('/dashboard/settings')) return 'settings' as const;
    return 'dashboard' as const;
  }, [locationPath]);


  // Universal config per section (memoized)
  const { title, items, backLink } = useMemo(() => {
    if (section === 'workspace') {
      return {
        title: 'Workspace',
        items: [
          { icon: Users, label: 'Workspace Management', href: '/workspace' },
          { icon: BarChart3, label: 'Reports', href: '/workspace/reports' },
          { icon: Settings, label: 'Settings', href: '/workspace/settings' },
        ] as NavItem[],
        backLink: { href: '/dashboard', label: 'Dashboard' },
      };
    }
    if (section === 'settings') {
      return {
        title: 'Profile & Settings',
        items: [
          { icon: Settings, label: 'Profile', href: '/dashboard/settings/profile' },
          { icon: Palette, label: 'Theme settings', href: '/dashboard/settings/theme' },
          { icon: Bell, label: 'Notifications settings', href: '/dashboard/settings/notifications' },
          { icon: Clock, label: 'Recent Activity', href: '/dashboard/settings/activity' },
          { icon: Zap, label: 'Upgrade', href: '/dashboard/settings/upgrade' },
        ] as NavItem[],
        backLink: { href: '/dashboard', label: 'Dashboard' },
      };
    }
    return {
      title: 'Dashboard',
      items: [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: Users, label: 'Workspaces', href: '/dashboard/workspaces' },
        { icon: FileText, label: 'Templates', href: '/dashboard/templates' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      ] as NavItem[],
    };
  }, [section]);

  const isWorkspace = section === 'workspace';
  const isWorkspaceOrSettings = section === 'workspace' || section === 'settings';
  // In workspace: hide title and show arrow + Workspace (title) as the back control label
  const hideTitle = isWorkspace;
  const effectiveBackLink = backLink
    ? (isWorkspace ? { ...backLink, label: title } : backLink)
    : undefined;

  // Suppress active highlighting for Home and Workspace Management
  const suppressedActiveHrefs = useMemo(() => new Set(['/dashboard', '/workspace']), []);
  const isActiveRoute = useCallback((href: string) => {
    if (suppressedActiveHrefs.has(href)) return false;
    
    // Handle settings routes properly
    if (href.includes('/settings/')) {
      return locationPath === href || locationPath.startsWith(href);
    }
    
    // Handle hash targets for legacy support
    if (href.includes('#')) {
      const hash = '#' + href.split('#')[1];
      return locationPath.startsWith('/dashboard/settings') && locationHash === hash;
    }
    
    return locationPath === href || locationPath.startsWith(`${href}/`);
  }, [locationHash, locationPath, suppressedActiveHrefs]);

  const showRecentAfter: string | undefined = section === 'dashboard' ? 'Analytics' : undefined;

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
                {section === 'settings' ? (
                  <>
                    {!sidebarCollapsed && !hideTitle && (
                      <div className="text-lg font-semibold tracking-tight text-foreground px-1">
                        {title}
                      </div>
                    )}
                    {effectiveBackLink && !sidebarCollapsed && (
                      <div className="flex items-center gap-3">
                        <Button
                          variant={isWorkspaceOrSettings ? 'ghost' : 'secondary'}
                          size="icon"
                          className={
                            ((isWorkspaceOrSettings)
                              ? 'h-8 w-8 '
                              : 'h-8 w-8 rounded-full ') +
                            'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                          }
                          onClick={() => handleBackNavigation(effectiveBackLink.href)}
                          aria-label={effectiveBackLink?.label ? `Back to ${effectiveBackLink.label}` : 'Back'}
                        >
                          <ArrowLeft size={18} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {effectiveBackLink && !sidebarCollapsed && (
                      <div className="flex items-center gap-3">
                        <Button
                          variant={isWorkspaceOrSettings ? 'ghost' : 'secondary'}
                          size="icon"
                          className={
                            ((isWorkspaceOrSettings)
                              ? 'h-8 w-8 '
                              : 'h-8 w-8 rounded-full ') +
                            'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                          }
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
                  </>
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
                  const showRecent = showRecentAfter === item.label;
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
                      {showRecent && (
                        <div className="px-2.5 pt-2">
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
          {section === 'settings' ? (
            <>
              {!sidebarCollapsed && !hideTitle && (
                <div className="text-lg font-semibold tracking-tight text-foreground px-1">
                  {title}
                </div>
              )}
              {effectiveBackLink && !sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <Button
                    variant={isWorkspaceOrSettings ? 'ghost' : 'secondary'}
                    size="icon"
                    className={
                      ((isWorkspaceOrSettings)
                        ? 'h-8 w-8 '
                        : 'h-8 w-8 rounded-full ') +
                      'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                    }
                    onClick={() => handleBackNavigation(effectiveBackLink.href)}
                    aria-label={effectiveBackLink?.label ? `Back to ${effectiveBackLink.label}` : 'Back'}
                  >
                    <ArrowLeft size={18} className="transition-colors text-primary group-hover:text-background drop-shadow-[0_0_8px_currentColor]" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {effectiveBackLink && !sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  {!sidebarCollapsed && (
                    <span className={isWorkspace ? 'text-lg font-semibold tracking-tight text-foreground' : 'text-sm'}>
                      {effectiveBackLink.label}
                    </span>
                  )}
                  <Button
                    variant={isWorkspaceOrSettings ? 'ghost' : 'secondary'}
                    size="icon"
                    className={
                      ((isWorkspaceOrSettings)
                        ? 'h-8 w-8 '
                        : 'h-8 w-8 rounded-full ') +
                      'group hover:scale-105 transition ring-1 ring-primary/40 hover:ring-2 hover:bg-primary'
                    }
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
            </>
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
                  {showRecent && (
                    <div className="px-2.5 pt-2">
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
