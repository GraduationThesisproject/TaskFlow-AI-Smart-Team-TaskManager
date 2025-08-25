import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { cn } from './utils';
import { Button } from './Button';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

const variantStyles = {
  success: {
    icon: CheckCircleIcon,
    className: 'border-success bg-success/10 text-success'
  },
  error: {
    icon: ExclamationCircleIcon,
    className: 'border-destructive bg-destructive/10 text-destructive'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'border-warning bg-warning/10 text-warning'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'border-info bg-info/10 text-info'
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const variantStyle = variantStyles[variant];
  const Icon = variantStyle.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border bg-card shadow-lg transition-all duration-300',
        variantStyle.className,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        className
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        {description && (
          <p className="text-sm opacity-90 mt-1">{description}</p>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="h-6 w-6 p-0 flex-shrink-0"
      >
        <XMarkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm',
        className
      )}
    >
      {children}
    </div>
  );
};
