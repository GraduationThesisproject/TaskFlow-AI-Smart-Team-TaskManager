import React, { useEffect } from 'react';
import { useTheme } from '@taskflow/theme';
import { useAuth } from '../../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  const { theme, userPrimaryColor } = useTheme();
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
    if (user?.user?.preferences?.primaryColor && !userPrimaryColor) {
      // This will be handled by the theme system
    }
  }, [user?.user?.preferences?.primaryColor, userPrimaryColor]);

  return (
    <div 
      className={`min-h-screen min-h-[100vh] min-h-[calc(var(--vh,1vh)*100)] bg-gradient-to-br from-background via-muted/10 to-background ${className}`}
      style={{
        height: '100vh',
        height: 'calc(var(--vh, 1vh) * 100)',
      }}
    >
      {children}
    </div>
  );
}
