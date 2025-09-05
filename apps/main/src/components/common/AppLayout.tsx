import React, { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col ${className}`}>
      {children}
    </div>
  );
};
