import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContainer } from '@taskflow/ui';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showPermissionDenied: (feature: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      ...message,
      duration: message.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: 'success' });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: 'error' });
  }, [showToast]);

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: 'info' });
  }, [showToast]);

  const showPermissionDenied = useCallback((feature: string, description?: string) => {
    showToast({
      title: 'Access Denied',
      description: description || `You don't have permission to access ${feature}. Please contact your administrator.`,
      variant: 'error',
      duration: 8000, // Longer duration for permission errors
    });
  }, [showToast]);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPermissionDenied,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
