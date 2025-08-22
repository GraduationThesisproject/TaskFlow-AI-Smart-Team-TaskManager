import React from 'react';
import { cn } from './utils';

export interface TopbarProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  children,
  className,
  sticky = true
}) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 py-4 bg-card border-b border-border',
        sticky && 'sticky top-0 z-50',
        className
      )}
    >
      {children}
    </header>
  );
};

export interface TopbarLeftProps {
  children: React.ReactNode;
  className?: string;
}

export const TopbarLeft: React.FC<TopbarLeftProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {children}
    </div>
  );
};

export interface TopbarCenterProps {
  children: React.ReactNode;
  className?: string;
}

export const TopbarCenter: React.FC<TopbarCenterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center flex-1', className)}>
      {children}
    </div>
  );
};

export interface TopbarRightProps {
  children: React.ReactNode;
  className?: string;
}

export const TopbarRight: React.FC<TopbarRightProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {children}
    </div>
  );
};
