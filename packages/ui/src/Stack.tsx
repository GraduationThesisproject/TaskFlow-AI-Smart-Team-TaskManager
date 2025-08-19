import React from 'react';
import { cn } from './utils';

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  as?: keyof JSX.IntrinsicElements;
}

export const Stack: React.FC<StackProps> = ({
  children,
  className,
  spacing = 'none',
  direction = 'vertical',
  align = 'start',
  justify = 'start',
  as: Component = 'div'
}) => {
  const spacingClasses = {
    none: '',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };

  const horizontalSpacingClasses = {
    none: '',
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8'
  };

  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <Component
      className={cn(
        directionClasses[direction],
        direction === 'vertical' ? spacingClasses[spacing] : horizontalSpacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </Component>
  );
};
