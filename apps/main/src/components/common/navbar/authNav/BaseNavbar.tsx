
import type { BaseNavbarProps, NavbarSectionProps } from '../../../../types/interfaces/ui';

export function NavbarLeft({ children, className = '' }: NavbarSectionProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function NavbarCenter({ children, className = '' }: NavbarSectionProps) {
  return (
    <div className={`flex-1 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export function NavbarRight({ children, className = '' }: NavbarSectionProps) {
  return (
    <div className={`flex items-center gap-4 ml-auto ${className}`}>
      {children}
    </div>
  );
}
