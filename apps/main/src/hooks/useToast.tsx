import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastItem, ToastContainer } from '../components/ui/Toast';

// Toast configuration interface
export interface ToastConfig {
  duration?: number;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Enhanced toast interface
export interface EnhancedToastProps {
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  config?: ToastConfig;
}

// Toast context type
interface ToastContextType {
  success: (message: string, title?: string, config?: ToastConfig) => string;
  error: (message: string, title?: string, config?: ToastConfig) => string;
  warning: (message: string, title?: string, config?: ToastConfig) => string;
  info: (message: string, title?: string, config?: ToastConfig) => string;
  loading: (message: string, title?: string, config?: ToastConfig) => string;
  update: (id: string, updates: Partial<EnhancedToastProps>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<(EnhancedToastProps & { id: string })[]>([]);

  const showToast = useCallback((toast: EnhancedToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const config = toast.config || {};
    
    const newToast = {
      ...toast,
      id,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-dismiss after duration (default 5 seconds)
    const duration = config.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, [maxToasts]);

  const success = useCallback((message: string, title?: string, config?: ToastConfig) => {
    return showToast({
      title: title || 'Success',
      description: message,
      variant: 'success',
      config
    });
  }, [showToast]);

  const error = useCallback((message: string, title?: string, config?: ToastConfig) => {
    return showToast({
      title: title || 'Error',
      description: message,
      variant: 'error',
      config
    });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string, config?: ToastConfig) => {
    return showToast({
      title: title || 'Warning',
      description: message,
      variant: 'warning',
      config
    });
  }, [showToast]);

  const info = useCallback((message: string, title?: string, config?: ToastConfig) => {
    return showToast({
      title: title || 'Info',
      description: message,
      variant: 'info',
      config
    });
  }, [showToast]);

  const loading = useCallback((message: string, title?: string, config?: ToastConfig) => {
    return showToast({
      title: title || 'Loading',
      description: message,
      variant: 'info',
      config: { ...config, duration: 0 } // Loading toasts don't auto-dismiss
    });
  }, [showToast]);

  const updateToast = useCallback((id: string, updates: Partial<EnhancedToastProps>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    success, 
    error, 
    warning, 
    info, 
    loading, 
    update: updateToast, 
    remove: removeToast, 
    clear: clearToasts 
  }), [success, error, warning, info, loading, updateToast, removeToast, clearToasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position}>
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              id={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              onClose={removeToast}
              dismissible={toast.config?.dismissible !== false}
            />
          ))}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  );
};
