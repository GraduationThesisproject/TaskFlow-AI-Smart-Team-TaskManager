import { Platform } from 'react-native';
import { parseHslToHex, toHslString, hslForegroundFor } from './colorUtils';

export type Theme = 'light' | 'dark';
export type GradientPalette = 'orange' | 'purple' | 'green' | 'blue';

export interface MobileThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral0: string;
  neutral100: string;
  neutral200: string;
  neutral1000: string;
}

// Predefined gradient palettes (migrated from React.js theme)
const gradientPalettes: Record<GradientPalette, { primary: string; secondary: string; accent: string; muted?: string }> = {
  // red -> orange
  orange: {
    primary: '0 84% 60%',        // red
    secondary: '24 100% 50%',    // orange
    accent: '24 100% 50%',
  },
  // purple -> pink
  purple: {
    primary: '270 90% 60%',      // purple
    secondary: '320 85% 65%',    // pink
    accent: '320 85% 65%',
  },
  // dark green -> clear (light) green
  green: {
    primary: '140 70% 25%',      // dark green
    secondary: '142 70% 60%',    // light green
    accent: '142 70% 60%',
  },
  // blue -> cyan
  blue: {
    primary: '201 100% 44%',     // blue
    secondary: '190 100% 50%',   // cyan
    accent: '190 100% 50%',
  },
};

export const mobileThemes: Record<Theme, MobileThemeColors> = {
  light: {
    background: parseHslToHex('0 0% 99%'),
    foreground: parseHslToHex('222.2 84% 4.9%'),
    card: parseHslToHex('0 0% 100%'),
    cardForeground: parseHslToHex('222.2 84% 4.9%'),
    popover: parseHslToHex('0 0% 100%'),
    popoverForeground: parseHslToHex('222.2 84% 4.9%'),
    primary: parseHslToHex('201 100% 44%'),
    primaryForeground: parseHslToHex('0 0% 100%'),
    secondary: parseHslToHex('210 40% 96%'),
    secondaryForeground: parseHslToHex('222.2 84% 4.9%'),
    muted: parseHslToHex('210 40% 92%'),
    mutedForeground: parseHslToHex('215.4 16.3% 46.9%'),
    accent: parseHslToHex('170 100% 45%'),
    accentForeground: parseHslToHex('222.2 84% 4.9%'),
    destructive: parseHslToHex('0 84.2% 60.2%'),
    destructiveForeground: parseHslToHex('210 40% 98%'),
    border: parseHslToHex('214.3 31.8% 85%'),
    input: parseHslToHex('214.3 31.8% 91.4%'),
    ring: parseHslToHex('201 100% 44%'),
    success: parseHslToHex('142 76% 36%'),
    warning: parseHslToHex('38 92% 50%'),
    error: parseHslToHex('0 84% 60%'),
    info: parseHslToHex('201 100% 44%'),
    neutral0: parseHslToHex('0 0% 0%'),
    neutral100: parseHslToHex('0 0% 10%'),
    neutral200: parseHslToHex('0 0% 16%'),
    neutral1000: parseHslToHex('0 0% 100%'),
  },
  dark: {
    background: parseHslToHex('0 0% 10%'),
    foreground: parseHslToHex('0 0% 100%'),
    card: parseHslToHex('0 0% 10%'),
    cardForeground: parseHslToHex('0 0% 100%'),
    popover: parseHslToHex('0 0% 16%'),
    popoverForeground: parseHslToHex('0 0% 100%'),
    primary: parseHslToHex('201 100% 44%'),
    primaryForeground: parseHslToHex('0 0% 100%'),
    secondary: parseHslToHex('0 0% 16%'),
    secondaryForeground: parseHslToHex('0 0% 100%'),
    muted: parseHslToHex('0 0% 16%'),
    mutedForeground: parseHslToHex('215 20.2% 65.1%'),
    accent: parseHslToHex('170 100% 45%'),
    accentForeground: parseHslToHex('0 0% 0%'),
    destructive: parseHslToHex('0 62.8% 30.6%'),
    destructiveForeground: parseHslToHex('0 0% 100%'),
    border: parseHslToHex('0 0% 16%'),
    input: parseHslToHex('0 0% 16%'),
    ring: parseHslToHex('201 100% 44%'),
    success: parseHslToHex('142 76% 36%'),
    warning: parseHslToHex('38 92% 50%'),
    error: parseHslToHex('0 84% 60%'),
    info: parseHslToHex('201 100% 44%'),
    neutral0: parseHslToHex('0 0% 0%'),
    neutral100: parseHslToHex('0 0% 10%'),
    neutral200: parseHslToHex('0 0% 16%'),
    neutral1000: parseHslToHex('0 0% 100%'),
  },
};

export interface MobileTheme {
  colors: MobileThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeights: {
      normal: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
      medium: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
      semibold: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
      bold: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

// Apply gradient palette to theme colors
const applyGradientPalette = (colors: MobileThemeColors, palette?: GradientPalette) => {
  if (!palette) return;
  const p = gradientPalettes[palette];
  if (!p) return;
  
  colors.primary = parseHslToHex(p.primary);
  colors.accent = parseHslToHex(p.accent);
  // Keep other colors as defaults
};

// Create mobile theme with optional customizations
export const createMobileTheme = (
  theme: Theme, 
  userPrimaryColor?: string | null, 
  gradientPalette?: GradientPalette
): MobileTheme => {
  const colors = { ...mobileThemes[theme] }; // Create a copy to avoid mutating the original
  
  // Apply gradient palette first
  if (gradientPalette) {
    applyGradientPalette(colors, gradientPalette);
  }
  
  // Apply user primary color (overrides gradient palette)
  if (userPrimaryColor) {
    const hsl = toHslString(userPrimaryColor);
    if (hsl) {
      colors.primary = parseHslToHex(hsl);
      colors.accent = parseHslToHex(hsl);
      colors.ring = parseHslToHex(hsl);
      
      const fg = hslForegroundFor(hsl);
      // Keep text white for purple hues regardless of lightness
      const hue = parseFloat(hsl.split(' ')[0]);
      const isPurple = !Number.isNaN(hue) && hue >= 240 && hue <= 320;
      const forcedFg = isPurple ? parseHslToHex('0 0% 100%') : parseHslToHex(fg);
      colors.primaryForeground = forcedFg;
      colors.accentForeground = forcedFg;
    }
  }

  return {
    colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    typography: {
      fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
      },
      fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    shadows: {
      sm: {
        shadowColor: colors.neutral0,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: colors.neutral0,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: colors.neutral0,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 8,
      },
    },
  };
};
