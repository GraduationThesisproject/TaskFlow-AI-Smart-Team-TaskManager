import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import MobileAlert, { AlertVariant, AlertType, MobileAlertProps } from './MobileAlert';

interface AlertState {
  visible: boolean;
  variant: AlertVariant;
  type: AlertType;
  title?: string;
  description?: string;
  message?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  animationDuration?: number;
  backdropOpacity?: number;
  allowBackdropClose?: boolean;
}

interface MobileAlertContextType {
  showAlert: (props: Omit<AlertState, 'visible'>) => void;
  hideAlert: () => void;
  showModal: (title: string, message: string, options?: Partial<AlertState>) => void;
  showBanner: (variant: AlertVariant, message: string, options?: Partial<AlertState>) => void;
  showToast: (variant: AlertVariant, message: string, options?: Partial<AlertState>) => void;
  showSuccess: (message: string, options?: Partial<AlertState>) => void;
  showError: (message: string, options?: Partial<AlertState>) => void;
  showWarning: (message: string, options?: Partial<AlertState>) => void;
  showInfo: (message: string, options?: Partial<AlertState>) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, options?: Partial<AlertState>) => void;
}

const MobileAlertContext = createContext<MobileAlertContextType | undefined>(undefined);

interface MobileAlertProviderProps {
  children: ReactNode;
}

export function MobileAlertProvider({ children }: MobileAlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    variant: 'info',
    type: 'modal',
    message: '',
  });

  const showAlert = useCallback((props: Omit<AlertState, 'visible'>) => {
    setAlertState({
      ...props,
      visible: true,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showModal = useCallback((title: string, message: string, options?: Partial<AlertState>) => {
    showAlert({
      type: 'modal',
      title,
      message,
      variant: 'info',
      ...options,
    });
  }, [showAlert]);

  const showBanner = useCallback((variant: AlertVariant, message: string, options?: Partial<AlertState>) => {
    showAlert({
      type: 'banner',
      variant,
      message,
      position: 'top',
      duration: 4000,
      ...options,
    });
  }, [showAlert]);

  const showToast = useCallback((variant: AlertVariant, message: string, options?: Partial<AlertState>) => {
    showAlert({
      type: 'toast',
      variant,
      message,
      position: 'bottom',
      duration: 3000,
      ...options,
    });
  }, [showAlert]);

  const showSuccess = useCallback((message: string, options?: Partial<AlertState>) => {
    showBanner('success', message, { duration: 3000, ...options });
  }, [showBanner]);

  const showError = useCallback((message: string, options?: Partial<AlertState>) => {
    showBanner('error', message, { duration: 4000, ...options });
  }, [showBanner]);

  const showWarning = useCallback((message: string, options?: Partial<AlertState>) => {
    showBanner('warning', message, { duration: 3500, ...options });
  }, [showBanner]);

  const showInfo = useCallback((message: string, options?: Partial<AlertState>) => {
    showBanner('info', message, { duration: 3000, ...options });
  }, [showBanner]);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, options?: Partial<AlertState>) => {
    showAlert({
      type: 'modal',
      title,
      message,
      variant: 'warning',
      onConfirm,
      onCancel: hideAlert,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      allowBackdropClose: false,
      ...options,
    });
  }, [showAlert, hideAlert]);

  const contextValue: MobileAlertContextType = {
    showAlert,
    hideAlert,
    showModal,
    showBanner,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };

  return (
    <MobileAlertContext.Provider value={contextValue}>
      {children}
      <MobileAlert
        visible={alertState.visible}
        variant={alertState.variant}
        type={alertState.type}
        title={alertState.title}
        description={alertState.description}
        message={alertState.message}
        onClose={alertState.onClose}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCloseButton={alertState.showCloseButton}
        showIcon={alertState.showIcon}
        icon={alertState.icon}
        duration={alertState.duration}
        position={alertState.position}
        animationDuration={alertState.animationDuration}
        backdropOpacity={alertState.backdropOpacity}
        allowBackdropClose={alertState.allowBackdropClose}
      />
    </MobileAlertContext.Provider>
  );
}

export function useMobileAlert(): MobileAlertContextType {
  const context = useContext(MobileAlertContext);
  if (context === undefined) {
    throw new Error('useMobileAlert must be used within a MobileAlertProvider');
  }
  return context;
}

// Export the MobileAlert component for direct use
export { MobileAlert };
export type { MobileAlertProps, AlertVariant, AlertType };
