import { themes } from './index';
import { hexToCssHsl, lightenColor, darkenColor } from './colorUtils';

export interface UserThemePreferences {
  mode: 'light' | 'dark' | 'system';
  primaryColor?: string;
  accentColor?: string;
  sidebarCollapsed?: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Generate theme variables with custom primary color
 */
export const generateThemeWithCustomColors = (
  baseTheme: 'light' | 'dark',
  primaryColor?: string,
  accentColor?: string
): Record<string, string> => {
  const baseThemeVars = themes[baseTheme];
  const customTheme: Record<string, string> = { ...baseThemeVars } as Record<string, string>;
  
  // Apply custom primary color if provided
  if (primaryColor) {
    const primaryHsl = hexToCssHsl(primaryColor);
    customTheme['--primary'] = primaryHsl;
    customTheme['--ring'] = primaryHsl;
    customTheme['--gradient-primary'] = primaryHsl;
    
    // Generate lighter and darker variants for hover states
    const primaryLighter = lightenColor(primaryColor, 10);
    const primaryDarker = darkenColor(primaryColor, 10);
    
    // Add custom CSS variables for primary color variants
    (customTheme as any)['--primary-lighter'] = primaryLighter;
    (customTheme as any)['--primary-darker'] = primaryDarker;
  }
  
  // Apply custom accent color if provided
  if (accentColor) {
    const accentHsl = hexToCssHsl(accentColor);
    customTheme['--accent'] = accentHsl;
    customTheme['--gradient-secondary'] = accentHsl;
    customTheme['--gradient-accent'] = accentHsl;
  }
  
  return customTheme;
};

/**
 * Apply theme with custom colors
 */
export const applyCustomTheme = (config: ThemeConfig) => {
  const { mode, primaryColor, accentColor } = config;
  const root = document.documentElement;
  const themeVars = generateThemeWithCustomColors(mode, primaryColor, accentColor);
  
  // Apply all theme variables
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Set theme attribute
  root.setAttribute('data-theme', mode);
  
  // Apply scrollbar styles (reuse existing logic)
  applyScrollbarStyles();
};

/**
 * Apply scrollbar styles based on current theme
 */
const applyScrollbarStyles = () => {
  const scrollbarStyles = `
    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    
    ::-webkit-scrollbar-track {
      background: hsl(var(--scrollbar-track));
      border-radius: 6px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: hsl(var(--scrollbar-thumb));
      border-radius: 6px;
      border: 2px solid hsl(var(--scrollbar-track));
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: hsl(var(--scrollbar-thumb-hover));
    }
    
    ::-webkit-scrollbar-corner {
      background: hsl(var(--scrollbar-corner));
    }
    
    /* Firefox scrollbar */
    * {
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--scrollbar-thumb)) hsl(var(--scrollbar-track));
    }
  `;
  
  // Remove existing scrollbar styles
  const existingStyle = document.getElementById('theme-scrollbar-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add new scrollbar styles
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-scrollbar-styles';
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
};

/**
 * Get system theme preference
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve theme mode (system, light, dark)
 */
export const resolveThemeMode = (mode: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

/**
 * Listen for system theme changes
 */
export const listenForSystemThemeChanges = (callback: (theme: 'light' | 'dark') => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
};
