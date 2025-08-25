import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from './utils';
import { Button } from './Button';

export type AlertVariant = 'warning' | 'error' | 'success' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  showCloseButton?: boolean;
}

const variantIcons = {
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const variantClasses = {
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-success/10 text-success border-success/20',
  info: 'bg-info/10 text-info border-info/20',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    variant = 'warning',
    title,
    description,
    onClose,
    className,
    showIcon = true,
    showCloseButton = true,
    children,
    ...props
  }, ref) => {
    const Icon = variantIcons[variant];
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantClasses[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex items-start">
          {showIcon && (
            <div className="flex-shrink-0 mr-3">
              <Icon className="h-5 w-5 mt-0.5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm font-medium">
                {title}
              </h3>
            )}
            {description && (
              <div className="mt-1 text-sm opacity-90">
                {description}
              </div>
            )}
            {children}
          </div>
          {showCloseButton && onClose && (
            <div className="ml-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
