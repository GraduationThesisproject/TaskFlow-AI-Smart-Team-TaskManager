import { BaseNavbar, NavbarLeft, NavbarCenter, NavbarRight } from './BaseNavbar';
import { Logo } from './Logo';
import { ThemeToggleButton } from './ThemeToggleButton';

interface MainNavbarProps {
  className?: string;
}

export function MainNavbar({ className = '' }: MainNavbarProps) {
  return (
    <BaseNavbar className={className}>
      <NavbarLeft>
        <Logo />
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4 ml-8">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 7.50033L10 1.66699L17.5 7.50033V16.667C17.5 17.109 17.3244 17.5329 17.0118 17.8455C16.6993 18.1581 16.2754 18.3337 15.8333 18.3337H4.16667C3.72464 18.3337 3.30072 18.1581 2.98816 17.8455C2.67559 17.5329 2.5 17.109 2.5 16.667V7.50033Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 18.3333V10H12.5V18.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-foreground text-sm">Home</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00065 3.33301V12.6663M3.33398 7.99967H12.6673" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-foreground text-sm">Create</span>
          </div>
        </div>
      </NavbarLeft>

      <NavbarCenter>
        {/* Search Bar */}
        <div className="flex-1 max-w-[275px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-[42px] bg-input border border-border rounded-lg pl-10 pr-4 text-foreground text-base placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.9996 13.9996L11.0996 11.0996" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </NavbarCenter>

      <NavbarRight>
        {/* Action Buttons */}
        <button className="relative w-10 h-10 rounded-full border-2 border-transparent flex items-center justify-center hover:bg-muted transition-colors">
          <svg className="w-5 h-5 text-foreground" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6.66699C15 5.34091 14.4732 4.06914 13.5355 3.13146C12.5979 2.19378 11.3261 1.66699 10 1.66699C8.67392 1.66699 7.40215 2.19378 6.46447 3.13146C5.52678 4.06914 5 5.34091 5 6.66699C5 12.5003 2.5 14.167 2.5 14.167H17.5C17.5 14.167 15 12.5003 15 6.66699Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.4419 17.5C11.2954 17.7526 11.0851 17.9622 10.8321 18.1079C10.5791 18.2537 10.2922 18.3304 10.0003 18.3304C9.70828 18.3304 9.42142 18.2537 9.1684 18.1079C8.91539 17.9622 8.7051 17.7526 8.55859 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
        </button>

        <ThemeToggleButton />

        {/* User Profile */}
        <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          U
        </button>
      </NavbarRight>
    </BaseNavbar>
  );
}
