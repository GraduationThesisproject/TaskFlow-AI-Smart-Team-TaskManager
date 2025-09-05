import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { cn } from './utils';
import { Button } from './Button';
import { Spinner } from './Loading';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
  progress?: number; // For loading toasts
  showProgress?: boolean; // For loading toasts
}

const variantStyles = {
  success: {
    icon: CheckCircleIcon,
    className: 'border-success bg-success/10 text-success',
    iconClassName: 'text-success',
    bgClassName: 'bg-success/5',
    borderClassName: 'border-success/20'
  },
  error: {
    icon: ExclamationCircleIcon,
    className: 'border-destructive bg-destructive/10 text-destructive',
    iconClassName: 'text-destructive',
    bgClassName: 'bg-destructive/5',
    borderClassName: 'border-destructive/20'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'border-warning bg-warning/10 text-warning',
    iconClassName: 'text-warning',
    bgClassName: 'bg-warning/5',
    borderClassName: 'border-warning/20'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'border-info bg-info/10 text-info',
    iconClassName: 'text-info',
    bgClassName: 'bg-info/5',
    borderClassName: 'border-info/20'
  },
  loading: {
    icon: ClockIcon,
    className: 'border-primary bg-primary/10 text-primary',
    iconClassName: 'text-primary',
    bgClassName: 'bg-primary/5',
    borderClassName: 'border-primary/20'
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
  className,
  progress,
  showProgress = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progressValue, setProgressValue] = useState(progress || 0);
  const variantStyle = variantStyles[variant];
  const Icon = variantStyle.icon;

  useEffect(() => {
    if (duration > 0 && variant !== 'loading') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, variant]);

  // Update progress for loading toasts
  useEffect(() => {
    if (progress !== undefined) {
      setProgressValue(progress);
    }
  }, [progress]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300); // Wait for exit animation
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border bg-card shadow-lg transition-all duration-300 ease-in-out',
        variantStyle.bgClassName,
        variantStyle.borderClassName,
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95',
        className
      )}

    >
      <div className="flex-shrink-0 mt-0.5">
        {variant === 'loading' ? (
          <Spinner size="sm" variant="default" className={variantStyle.iconClassName} />
        ) : (
          <Icon className={cn("h-5 w-5", variantStyle.iconClassName)} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        {description && (
          <p className="text-sm opacity-90 mt-1">{description}</p>
        )}
        {showProgress && variant === 'loading' && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progressValue)}% complete
            </p>
          </div>
        )}
      </div>
      
      {variant !== 'loading' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0 flex-shrink-0 hover:bg-muted/50"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      )}


    </div>
  );
};

export interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  children,
  className,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 max-w-sm',
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
};
