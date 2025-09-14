import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Banner, { BannerType, BannerProps } from './Banner';

interface BannerState {
  visible: boolean;
  type: BannerType;
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
  onPress?: () => void;
  showCloseButton?: boolean;
  position?: 'top' | 'bottom';
  icon?: React.ReactNode;
  actionText?: string;
  onActionPress?: () => void;
  animationDuration?: number;
}

interface BannerContextType {
  showBanner: (props: Omit<BannerState, 'visible'>) => void;
  hideBanner: () => void;
  showSuccess: (message: string, options?: Partial<BannerState>) => void;
  showError: (message: string, options?: Partial<BannerState>) => void;
  showWarning: (message: string, options?: Partial<BannerState>) => void;
  showInfo: (message: string, options?: Partial<BannerState>) => void;
  showBannerWithTitle: (type: BannerType, title: string, message: string, options?: Partial<BannerState>) => void;
  showBannerWithAction: (type: BannerType, message: string, actionText: string, onActionPress: () => void, options?: Partial<BannerState>) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

interface BannerProviderProps {
  children: ReactNode;
}

export function BannerProvider({ children }: BannerProviderProps) {
  const [bannerState, setBannerState] = useState<BannerState>({
    visible: false,
    type: 'info',
    message: '',
  });

  const showBanner = useCallback((props: Omit<BannerState, 'visible'>) => {
    setBannerState({
      ...props,
      visible: true,
    });
  }, []);

  const hideBanner = useCallback(() => {
    setBannerState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((message: string, options?: Partial<BannerState>) => {
    showBanner({
      type: 'success',
      message,
      duration: 3000,
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const showError = useCallback((message: string, options?: Partial<BannerState>) => {
    showBanner({
      type: 'error',
      message,
      duration: 4000,
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const showWarning = useCallback((message: string, options?: Partial<BannerState>) => {
    showBanner({
      type: 'warning',
      message,
      duration: 3500,
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const showInfo = useCallback((message: string, options?: Partial<BannerState>) => {
    showBanner({
      type: 'info',
      message,
      duration: 3000,
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const showBannerWithTitle = useCallback((type: BannerType, title: string, message: string, options?: Partial<BannerState>) => {
    showBanner({
      type,
      title,
      message,
      duration: 4000,
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const showBannerWithAction = useCallback((type: BannerType, message: string, actionText: string, onActionPress: () => void, options?: Partial<BannerState>) => {
    showBanner({
      type,
      message,
      actionText,
      onActionPress,
      duration: 0, // No auto-hide for action banners
      position: 'bottom',
      ...options,
    });
  }, [showBanner]);

  const contextValue: BannerContextType = {
    showBanner,
    hideBanner,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBannerWithTitle,
    showBannerWithAction,
  };

  return (
    <BannerContext.Provider value={contextValue}>
      {children}
      <Banner
        visible={bannerState.visible}
        type={bannerState.type}
        message={bannerState.message}
        title={bannerState.title}
        duration={bannerState.duration}
        onClose={bannerState.onClose}
        onPress={bannerState.onPress}
        showCloseButton={bannerState.showCloseButton}
        position={bannerState.position}
        icon={bannerState.icon}
        actionText={bannerState.actionText}
        onActionPress={bannerState.onActionPress}
        animationDuration={bannerState.animationDuration}
      />
    </BannerContext.Provider>
  );
}

export function useBanner(): BannerContextType {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}

// Export the Banner component for direct use
export { Banner };
export type { BannerProps, BannerType };
