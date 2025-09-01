import { useEffect } from 'react';
import { useTheme } from '@taskflow/theme';
import { useAuth } from '../../hooks/useAuth';
import type { AppLayoutProps } from '../../types/interfaces/ui';

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  const {  userPrimaryColor } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    // Ensure proper viewport height on mobile devices
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  useEffect(() => {
    // Apply user primary color if available
    const primary = user?.preferences?.theme?.primaryColor;
    if (primary && !userPrimaryColor) {
      // This will be handled by the theme system
    }
  }, [user?.preferences?.theme?.primaryColor, userPrimaryColor]);

  return (
    <div 
      className={`bg-gradient-to-br from-background via-muted/10 to-background ${className}`}
    >
      {children}
    </div>
  );
}
