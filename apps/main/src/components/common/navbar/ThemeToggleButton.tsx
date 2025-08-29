import React from 'react';
import { Button } from '@taskflow/ui';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@taskflow/theme';

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`rounded-full h-9 w-9 group ring-1 ring-primary/30 hover:ring-2 hover:bg-primary transition ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-primary group-hover:text-background transition-colors" />
          {showLabel && <span className="sr-only">Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary group-hover:text-background transition-colors" />
          {showLabel && <span className="sr-only">Dark</span>}
        </>
      )}
    </Button>
  );
};
