import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, ThemeColors } from '@/constants/Colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setUserPrimaryColor: (color: string) => void;
  userPrimaryColor: string | null;
  isSystemTheme: boolean;
  setIsSystemTheme: (isSystem: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  userPrimaryColor?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark',
  storageKey = 'taskflow-mobile-theme',
  userPrimaryColor: initialUserColor
}: ThemeProviderProps) {
  const systemColorScheme = useRNColorScheme();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [userPrimaryColor, setUserPrimaryColorState] = useState<string | null>(initialUserColor || null);
  const [isSystemTheme, setIsSystemThemeState] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the current theme colors - always provide colors even if not initialized
  const colors = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    loadThemePreferences();
  }, []);

  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setThemeState(systemColorScheme);
    }
  }, [isSystemTheme, systemColorScheme]);

  const loadThemePreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(storageKey);
      const savedUserColor = await AsyncStorage.getItem('taskflow-mobile-user-primary-color');
      const savedIsSystemTheme = await AsyncStorage.getItem('taskflow-mobile-system-theme');
      
      if (savedIsSystemTheme !== null) {
        const isSystem = JSON.parse(savedIsSystemTheme);
        setIsSystemThemeState(isSystem);
      }

      if (savedTheme && ['light', 'dark'].includes(savedTheme) && !isSystemTheme) {
        setThemeState(savedTheme as Theme);
      } else if (systemColorScheme) {
        setThemeState(systemColorScheme);
      }

      if (savedUserColor) {
        setUserPrimaryColorState(savedUserColor);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
      setIsInitialized(true);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const setUserPrimaryColor = async (color: string) => {
    try {
      setUserPrimaryColorState(color);
      await AsyncStorage.setItem('taskflow-mobile-user-primary-color', color);
    } catch (error) {
      console.warn('Failed to save user primary color:', error);
    }
  };

  const setIsSystemTheme = async (isSystem: boolean) => {
    try {
      setIsSystemThemeState(isSystem);
      await AsyncStorage.setItem('taskflow-mobile-system-theme', JSON.stringify(isSystem));
      
      if (isSystem && systemColorScheme) {
        setThemeState(systemColorScheme);
      }
    } catch (error) {
      console.warn('Failed to save system theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    toggleTheme,
    setUserPrimaryColor,
    userPrimaryColor,
    isSystemTheme,
    setIsSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default theme instead of throwing error
    console.warn('useTheme called outside ThemeProvider, using default theme');
    return {
      theme: 'dark' as Theme,
      colors: darkTheme,
      setTheme: () => {},
      toggleTheme: () => {},
      setUserPrimaryColor: () => {},
      userPrimaryColor: null,
      isSystemTheme: false,
      setIsSystemTheme: () => {},
    };
  }
  return context;
}

// Hook to get just the colors
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

// Safe hook that provides default colors if theme is not available
export function useSafeThemeColors() {
  try {
    const { colors } = useTheme();
    return colors;
  } catch (error) {
    // Return default dark theme colors if theme is not available
    return darkTheme;
  }
}

// Hook to get a specific color
export function useThemeColor(colorKey: keyof ThemeColors) {
  const { colors } = useTheme();
  return colors[colorKey];
}
