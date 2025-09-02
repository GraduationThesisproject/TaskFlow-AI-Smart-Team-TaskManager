import { BaseNavbar, NavbarLeft, NavbarRight } from './BaseNavbar';
import { Logo } from './Logo';
import { ThemeToggleButton } from './ThemeToggleButton';
import type { AuthNavbarProps } from '../../../../types/interfaces/ui';

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
