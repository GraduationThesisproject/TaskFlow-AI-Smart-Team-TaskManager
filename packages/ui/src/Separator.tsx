import React from 'react';
import { cn } from './utils';

export interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  orientation = 'horizontal' 
}) => {
  return (
    <div
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
};
