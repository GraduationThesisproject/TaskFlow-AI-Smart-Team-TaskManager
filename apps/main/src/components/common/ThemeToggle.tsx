import React from 'react';
import { Button } from '@taskflow/ui';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectUserPreferences, updateUser } from '../../store/slices/authSlice';
import { useUserTheme } from '../../hooks/useUserTheme';
import { Sun, Moon } from 'lucide-react';
import type { ThemeToggleProps } from '../../types/interfaces/ui';

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const dispatch = useAppDispatch();
  const userPreferences = useAppSelector(selectUserPreferences);
  const { applyUserTheme } = useUserTheme();
  
  const currentMode = userPreferences?.theme?.mode || 'system';
  const isDark = currentMode === 'dark' || (currentMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const handleToggle = async () => {
    const newMode = isDark ? 'light' : 'dark';
    
    try {
      await dispatch(updateUser({
        preferences: {
          ...userPreferences,
          theme: {
            ...userPreferences?.theme,
            mode: newMode,
          }
        }
      })).unwrap();
      
      // Apply the new theme immediately
      applyUserTheme();
    } catch (error) {
      console.error('Failed to update theme mode:', error);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={`flex items-center gap-2 hover:bg-muted/50 transition-all duration-200 rounded-full px-4 py-2 ${className}`}
    >
      {isDark ? (
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
