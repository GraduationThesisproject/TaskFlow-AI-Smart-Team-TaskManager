import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

// Toast variant configuration
const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    iconClassName: 'text-blue-500'
  }
};

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: (id: string) => void;
  duration?: number;
  dismissible?: boolean;
}

interface ToastItemProps extends ToastProps {
  onClose: (id: string) => void;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(({ 
  id, 
  title, 
  description, 
  variant = 'info', 
  onClose,
  dismissible = true 
}, ref) => {
  const config = toastVariants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.2
      }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'min-w-[320px] max-w-[420px]',
        config.className
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn('w-5 h-5', config.iconClassName)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm leading-5 mb-1">
            {title}
          </h4>
        )}
        {description && (
          <p className="text-sm leading-5 opacity-90">
            {description}
          </p>
        )}
      </div>

      {/* Close button */}
      {dismissible && (
        <button
          onClick={() => onClose(id)}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-black/5 dark:hover:bg-white/10',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
            'focus:ring-black/20 dark:focus:ring-white/20'
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
});

ToastItem.displayName = 'ToastItem';

// Toast container with positioning
interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={cn(
      'fixed z-50 flex flex-col gap-3 pointer-events-none',
      positionClasses[position]
    )}>
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

export { ToastItem, ToastContainer };
