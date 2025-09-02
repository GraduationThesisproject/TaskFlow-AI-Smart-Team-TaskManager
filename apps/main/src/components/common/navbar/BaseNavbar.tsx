import React from 'react';
import type { BaseNavbarProps, NavbarSectionProps } from '../../../types/interfaces/ui';

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
