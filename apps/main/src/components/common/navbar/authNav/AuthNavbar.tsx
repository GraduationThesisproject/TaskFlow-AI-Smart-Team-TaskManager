import { BaseNavbar, NavbarLeft, NavbarRight } from './BaseNavbar';
import { Logo } from './Logo';
import { ThemeToggleButton } from './ThemeToggleButton';

interface AuthNavbarProps {
  className?: string;
}

export function AuthNavbar({ className = '' }: AuthNavbarProps) {
  return (
    <BaseNavbar className={className}>
      <NavbarLeft>
        <Logo />
      </NavbarLeft>
      
      <NavbarRight>
        <ThemeToggleButton />
      </NavbarRight>
    </BaseNavbar>
  );
}

export default AuthNavbar;
