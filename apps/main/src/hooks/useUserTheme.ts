import { useEffect, useCallback } from 'react';
import { useAppSelector } from '../store';
import { selectUserPreferences } from '../store/slices/authSlice';
import { 
  applyCustomTheme, 
  resolveThemeMode, 
  listenForSystemThemeChanges,
  type ThemeConfig 
} from '@taskflow/theme';

/**
 * Hook to sync user theme preferences with the global theme system
 * Automatically applies user's theme preferences and updates when they change
 */
export const useUserTheme = () => {
  const userPreferences = useAppSelector(selectUserPreferences);
  
  // Apply theme based on user preferences
  const applyUserTheme = useCallback(() => {
    if (!userPreferences?.theme) {
      // Fallback to default theme if no preferences
      return;
    }
    
    const { mode, primaryColor, accentColor } = userPreferences.theme;
    const resolvedMode = resolveThemeMode(mode);
    
    const themeConfig: ThemeConfig = {
      mode: resolvedMode,
      primaryColor: primaryColor || undefined,
      accentColor: accentColor || undefined,
    };
    
    console.log('🎨 Applying user theme:', themeConfig);
    applyCustomTheme(themeConfig);
  }, [userPreferences]);
  
  // Apply theme when user preferences change
  useEffect(() => {
    applyUserTheme();
  }, [applyUserTheme]);
  
  // Listen for system theme changes when user has 'system' mode
  useEffect(() => {
    if (userPreferences?.theme?.mode === 'system') {
      const cleanup = listenForSystemThemeChanges(() => {
        // Re-apply theme when system theme changes
        applyUserTheme();
      });
      
      return cleanup;
    }
  }, [userPreferences?.theme?.mode, applyUserTheme]);
  
  // Return current theme info for components that need it
  const getCurrentTheme = useCallback(() => {
    if (!userPreferences?.theme) {
      return { mode: 'dark' as const, primaryColor: undefined, accentColor: undefined };
    }
    
    const { mode, primaryColor, accentColor } = userPreferences.theme;
    const resolvedMode = resolveThemeMode(mode);
    
    return {
      mode: resolvedMode,
      primaryColor: primaryColor || undefined,
      accentColor: accentColor || undefined,
    };
  }, [userPreferences]);
  
  return {
    applyUserTheme,
    getCurrentTheme,
    userPreferences: userPreferences?.theme,
    isSystemMode: userPreferences?.theme?.mode === 'system',
  };
};
