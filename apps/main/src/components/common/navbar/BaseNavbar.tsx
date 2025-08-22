import React from 'react';

interface BaseNavbarProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseNavbar: React.FC<BaseNavbarProps> = ({ children, className = '' }) => {
  return (
    <nav className={`w-full h-16 bg-card border-b border-border flex items-center px-4 ${className}`}>
      {children}
    </nav>
  );
};

interface NavbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const NavbarLeft: React.FC<NavbarSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const NavbarCenter: React.FC<NavbarSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
};

export const NavbarRight: React.FC<NavbarSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center gap-4 ml-auto ${className}`}>
      {children}
    </div>
  );
};
