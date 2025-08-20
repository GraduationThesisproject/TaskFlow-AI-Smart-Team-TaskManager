import React from 'react';
import { cn } from './utils';

interface ScrollbarProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  scrollbarSize?: 'sm' | 'md' | 'lg';
  scrollbarColor?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export const Scrollbar: React.FC<ScrollbarProps> = ({
  children,
  className,
  orientation = 'vertical',
  scrollbarSize = 'md',
  scrollbarColor = 'muted'
}) => {
  const sizeClasses = {
    sm: 'scrollbar-thin',
    md: 'scrollbar',
    lg: 'scrollbar-thick'
  };

  const colorClasses = {
    primary: 'scrollbar-track-[hsl(var(--scrollbar-track))] scrollbar-thumb-[hsl(var(--primary))] hover:scrollbar-thumb-[hsl(var(--primary)/0.8)]',
    secondary: 'scrollbar-track-[hsl(var(--scrollbar-track))] scrollbar-thumb-[hsl(var(--secondary))] hover:scrollbar-thumb-[hsl(var(--secondary)/0.8)]',
    accent: 'scrollbar-track-[hsl(var(--scrollbar-track))] scrollbar-thumb-[hsl(var(--accent))] hover:scrollbar-thumb-[hsl(var(--accent)/0.8)]',
    muted: 'scrollbar-track-[hsl(var(--scrollbar-track))] scrollbar-thumb-[hsl(var(--scrollbar-thumb))] hover:scrollbar-thumb-[hsl(var(--scrollbar-thumb-hover))]'
  };

  return (
    <div
      className={cn(
        'overflow-auto',
        sizeClasses[scrollbarSize],
        colorClasses[scrollbarColor],
        orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
        orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
        className
      )}
    >
      {children}
    </div>
  );
};
