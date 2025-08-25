import React from 'react';
import { cn } from './utils';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className,
  collapsed = false,
  width = 'md',
  position = 'left'
}) => {
  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[28rem]'
  };

  const collapsedWidth = 'w-16';

  return (
    <aside
      className={cn(
        'flex flex-col border-border bg-card transition-all duration-300',
        position === 'left' ? 'border-r' : 'border-l',
        collapsed ? collapsedWidth : widthClasses[width],
        className
      )}
    >
      {children}
    </aside>
  );
};

export interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-border', className)}>
      {children}
    </div>
  );
};

export interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </div>
  );
};

export interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('p-4 border-t border-border', className)}>
      {children}
    </div>
  );
};

export interface SidebarNavProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  children,
  className
}) => {
  return (
    <nav className={cn('space-y-2', className)}>
      {children}
    </nav>
  );
};

export interface SidebarNavItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  children,
  className,
  active = false,
  onClick,
  href
}) => {
  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        active && 'bg-primary text-primary-foreground',
        !active && 'text-muted-foreground',
        className
      )}
    >
      {children}
    </Component>
  );
};
