import React from 'react';
import { cn } from './utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const Textarea: React.FC<TextareaProps> = ({
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClasses = {
    default: 'border-input',
    error: 'border-destructive focus-visible:ring-destructive'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <textarea
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};
