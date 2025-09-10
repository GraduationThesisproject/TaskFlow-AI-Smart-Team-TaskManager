// Cross-platform theme colors that match the web theme system
export const lightTheme = {
  // Core colors
  background: '#fafafa', // hsl(0 0% 99%)
  foreground: '#0a0a0a', // hsl(222.2 84% 4.9%)
  card: '#ffffff',
  'card-foreground': '#0a0a0a',
  popover: '#ffffff',
  'popover-foreground': '#0a0a0a',
  
  // Primary colors
  primary: '#007ADF', // hsl(201 100% 44%)
  'primary-foreground': '#ffffff',
  
  // Secondary colors
  secondary: '#f1f5f9', // hsl(210 40% 96%)
  'secondary-foreground': '#0a0a0a',
  
  // Muted colors
  muted: '#e2e8f0', // hsl(210 40% 92%)
  'muted-foreground': '#64748b', // hsl(215.4 16.3% 46.9%)
  
  // Accent colors
  accent: '#00E8C6', // hsl(170 100% 45%)
  'accent-foreground': '#0a0a0a',
  
  // Destructive colors
  destructive: '#ef4444', // hsl(0 84.2% 60.2%)
  'destructive-foreground': '#fafafa',
  
  // Border and input colors
  border: '#d1d5db', // hsl(214.3 31.8% 85%)
  input: '#e5e7eb', // hsl(214.3 31.8% 91.4%)
  ring: '#007ADF',
  
  // Neutral colors
  'neutral-0': '#000000',
  'neutral-100': '#1a1a1a',
  'neutral-200': '#262626',
  'neutral-1000': '#ffffff',
  
  // Status colors
  success: '#16a34a', // hsl(142 76% 36%)
  warning: '#f59e0b', // hsl(38 92% 50%)
  error: '#ef4444', // hsl(0 84% 60%)
  info: '#007ADF', // hsl(201 100% 44%)
  
  // Scrollbar colors
  'scrollbar-track': '#f1f5f9',
  'scrollbar-thumb': '#94a3b8',
  'scrollbar-thumb-hover': '#64748b',
  'scrollbar-corner': '#f1f5f9',
  
  // Gradient colors
  'gradient-primary': '#007ADF',
  'gradient-secondary': '#00E8C6',
  'gradient-accent': '#00E8C6',
  'gradient-muted': '#f1f5f9',
  
  // Legacy support
  text: '#0a0a0a',
  tint: '#007ADF',
  tabIconDefault: '#94a3b8',
  tabIconSelected: '#007ADF',
};

export const darkTheme = {
  // Core colors
  background: '#1a1a1a', // hsl(0 0% 10%)
  foreground: '#ffffff',
  card: '#1a1a1a',
  'card-foreground': '#ffffff',
  popover: '#262626', // hsl(0 0% 16%)
  'popover-foreground': '#ffffff',
  
  // Primary colors
  primary: '#007ADF', // hsl(201 100% 44%)
  'primary-foreground': '#ffffff',
  
  // Secondary colors
  secondary: '#262626', // hsl(0 0% 16%)
  'secondary-foreground': '#ffffff',
  
  // Muted colors
  muted: '#262626', // hsl(0 0% 16%)
  'muted-foreground': '#94a3b8', // hsl(215 20.2% 65.1%)
  
  // Accent colors
  accent: '#00E8C6', // hsl(170 100% 45%)
  'accent-foreground': '#000000',
  
  // Destructive colors
  destructive: '#7f1d1d', // hsl(0 62.8% 30.6%)
  'destructive-foreground': '#ffffff',
  
  // Border and input colors
  border: '#404040', // hsl(0 0% 25%) - lighter border for better visibility
  input: '#262626', // hsl(0 0% 16%)
  ring: '#007ADF',
  
  // Neutral colors
  'neutral-0': '#000000',
  'neutral-100': '#1a1a1a',
  'neutral-200': '#262626',
  'neutral-1000': '#ffffff',
  
  // Status colors
  success: '#16a34a', // hsl(142 76% 36%)
  warning: '#f59e0b', // hsl(38 92% 50%)
  error: '#ef4444', // hsl(0 84% 60%)
  info: '#007ADF', // hsl(201 100% 44%)
  
  // Scrollbar colors
  'scrollbar-track': '#262626',
  'scrollbar-thumb': '#404040',
  'scrollbar-thumb-hover': '#525252',
  'scrollbar-corner': '#262626',
  
  // Gradient colors
  'gradient-primary': '#007ADF',
  'gradient-secondary': '#00E8C6',
  'gradient-accent': '#404040', // hsl(0 0% 30%)
  'gradient-muted': '#262626',
  
  // Legacy support
  text: '#ffffff',
  tint: '#ffffff',
  tabIconDefault: '#94a3b8',
  tabIconSelected: '#ffffff',
};

// Default export for backward compatibility
export default {
  light: lightTheme,
  dark: darkTheme,
};

// Type definitions
export type ThemeColors = typeof lightTheme;
export type ColorKey = keyof ThemeColors;
