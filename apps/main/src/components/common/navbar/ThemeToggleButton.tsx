import React from 'react';
import { Button } from '@taskflow/ui';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@taskflow/theme';
import type { ThemeToggleButtonProps } from '../../../types/interfaces/ui';

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`flex items-center gap-2 hover:bg-muted/50 transition-all duration-200 rounded-full px-3 py-2 ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">Dark</span>}
        </>
      )}
    </Button>
  );
};
