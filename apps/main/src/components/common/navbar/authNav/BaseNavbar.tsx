
interface BaseNavbarProps {
  children: React.ReactNode;
  className?: string;
}

export function BaseNavbar({ children, className = '' }: BaseNavbarProps) {
  return (
    <nav className={`w-full h-[67px] bg-background border-b border-border flex items-center px-4 relative font-inter ${className}`}>
      {children}
    </nav>
  );
}

interface NavbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

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
