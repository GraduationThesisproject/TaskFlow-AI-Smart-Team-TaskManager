import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Theme, createMobileTheme, MobileTheme, GradientPalette } from './index';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mobileTheme: MobileTheme;
  setUserPrimaryColor: (color: string) => void;
  userPrimaryColor: string | null;
  setGradientPalette: (palette: GradientPalette | null) => void;
  gradientPalette: GradientPalette | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  userPrimaryColor?: string;
  gradientPalette?: GradientPalette;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark',
  storageKey = 'taskflow-theme',
  userPrimaryColor: initialUserColor,
  gradientPalette: initialGradientPalette
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [userPrimaryColor, setUserPrimaryColorState] = useState<string | null>(initialUserColor || null);
  const [gradientPalette, setGradientPaletteState] = useState<GradientPalette | null>(initialGradientPalette || null);
  const [mobileTheme, setMobileTheme] = useState<MobileTheme>(() => createMobileTheme(defaultTheme, initialUserColor, initialGradientPalette));

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(storageKey);
        const savedUserColor = await AsyncStorage.getItem('taskflow-user-primary-color');
        const savedGradientPalette = await AsyncStorage.getItem('taskflow-gradient-palette');
        
        let finalTheme = defaultTheme;
        
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          finalTheme = savedTheme as Theme;
        } else {
          // Use system preference if no saved theme
          finalTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        }
        
        const finalGradientPalette = savedGradientPalette as GradientPalette | null;
        
        setThemeState(finalTheme);
        setMobileTheme(createMobileTheme(finalTheme, savedUserColor, finalGradientPalette || undefined));

        if (savedUserColor) {
          setUserPrimaryColorState(savedUserColor);
        }
        
        if (finalGradientPalette) {
          setGradientPaletteState(finalGradientPalette);
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
        setMobileTheme(createMobileTheme(defaultTheme, initialUserColor, initialGradientPalette));
      }
    };

    loadTheme();
  }, [storageKey, defaultTheme, systemColorScheme, initialUserColor, initialGradientPalette]);

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      setMobileTheme(createMobileTheme(newTheme, userPrimaryColor, gradientPalette || undefined));
      await AsyncStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const setUserPrimaryColor = async (color: string) => {
    try {
      setUserPrimaryColorState(color);
      setMobileTheme(createMobileTheme(theme, color, gradientPalette || undefined));
      await AsyncStorage.setItem('taskflow-user-primary-color', color);
    } catch (error) {
      console.warn('Failed to save user primary color:', error);
    }
  };

  const setGradientPalette = async (palette: GradientPalette | null) => {
    try {
      setGradientPaletteState(palette);
      setMobileTheme(createMobileTheme(theme, userPrimaryColor, palette || undefined));
      if (palette) {
        await AsyncStorage.setItem('taskflow-gradient-palette', palette);
      } else {
        await AsyncStorage.removeItem('taskflow-gradient-palette');
      }
    } catch (error) {
      console.warn('Failed to save gradient palette:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    mobileTheme,
    setUserPrimaryColor,
    userPrimaryColor,
    setGradientPalette,
    gradientPalette,
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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useMobileTheme() {
  const { mobileTheme } = useTheme();
  return mobileTheme;
}
