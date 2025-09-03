import { Platform } from 'react-native';
import { ThemeColors } from '@/constants/Colors';
import { Fonts, FontSizes, FontWeights } from '@/constants/Fonts';


// Theme utilities for React Native
export class ThemeUtils {
  /**
   * Get platform-specific font family
   */
  static getFontFamily(
    fontFamily: keyof typeof Fonts.primary,
    platform: 'ios' | 'android' = Platform.OS as 'ios' | 'android'
  ): string {
    const customFont = Fonts.primary[fontFamily];
    const systemFont = Fonts.system[platform][fontFamily];
    return `${customFont}, ${systemFont}`;
  }

  /**
   * Get font style object with platform-specific font family
   */
  static getFontStyle(
    size: keyof typeof FontSizes = 'base',
    weight: keyof typeof FontWeights = 'normal',
    family: keyof typeof Fonts.primary = 'regular'
  ) {
    return {
      fontSize: FontSizes[size],
      fontWeight: FontWeights[weight],
      fontFamily: this.getFontFamily(family),
    };
  }

  /**
   * Convert hex color to RGB array
   */
  static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  /**
   * Convert RGB to HSL
   */
  static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  /**
   * Get contrasting color (black or white) for a given background color
   */
  static getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    const [r, g, b] = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  /**
   * Create a gradient color array for React Native
   */
  static createGradient(
    startColor: string,
    endColor: string,
    steps: number = 10
  ): string[] {
    const startRgb = this.hexToRgb(startColor);
    const endRgb = this.hexToRgb(endColor);

    if (!startRgb || !endRgb) return [startColor, endColor];

    const gradient: string[] = [];
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * ratio);
      const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * ratio);
      const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * ratio);
      gradient.push(`rgb(${r}, ${g}, ${b})`);
    }

    return gradient;
  }

  /**
   * Create a theme-aware gradient
   */
  static createThemeGradient(
    colors: ThemeColors,
    gradientType: 'primary' | 'secondary' | 'accent' | 'muted' = 'primary'
  ): string[] {
    const startColor = colors[`gradient-${gradientType}`];
    const endColor = colors[`gradient-${gradientType === 'primary' ? 'secondary' : 'accent'}`];
    return this.createGradient(startColor, endColor);
  }

  /**
   * Get shadow style for iOS and Android
   */
  static getShadowStyle(
    elevation: number = 2,
    shadowColor: string = '#000000',
    shadowOpacity: number = 0.1,
    shadowRadius: number = 4,
    shadowOffset: { width: number; height: number } = { width: 0, height: 2 }
  ) {
    if (Platform.OS === 'ios') {
      return {
        shadowColor,
        shadowOffset,
        shadowOpacity,
        shadowRadius,
      };
    } else {
      return {
        elevation,
      };
    }
  }

  /**
   * Get theme-aware shadow style
   */
  static getThemeShadowStyle(
    colors: ThemeColors,
    elevation: number = 2,
    shadowOpacity: number = 0.1
  ) {
    return this.getShadowStyle(
      elevation,
      colors['neutral-0'],
      shadowOpacity,
      elevation * 2,
      { width: 0, height: elevation }
    );
  }

  /**
   * Create a color palette from a base color
   */
  static createColorPalette(baseColor: string): {
    light: string;
    main: string;
    dark: string;
    contrast: string;
  } {
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) {
      return {
        light: baseColor,
        main: baseColor,
        dark: baseColor,
        contrast: '#000000',
      };
    }

    const [h, s, l] = this.rgbToHsl(...rgb);
    
    // Create lighter and darker variants
    const lightColor = `hsl(${h}, ${s}%, ${Math.min(l + 20, 100)}%)`;
    const darkColor = `hsl(${h}, ${s}%, ${Math.max(l - 20, 0)}%)`;
    
    // Convert back to hex for React Native
    const lightHex = this.hslToHex(h, s, Math.min(l + 20, 100));
    const darkHex = this.hslToHex(h, s, Math.max(l - 20, 0));
    const contrastHex = this.getContrastColor(baseColor);

    return {
      light: lightHex,
      main: baseColor,
      dark: darkHex,
      contrast: contrastHex,
    };
  }

  /**
   * Convert HSL to hex color
   */
  static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Get responsive font size based on screen width
   */
  static getResponsiveFontSize(
    baseSize: keyof typeof FontSizes,
    screenWidth: number
  ): number {
    const baseFontSize = FontSizes[baseSize];
    const scale = screenWidth / 375; // iPhone 12 width as baseline
    return Math.round(baseFontSize * Math.min(scale, 1.2));
  }

  /**
   * Create a theme-aware border radius
   */
  static getBorderRadius(
    size: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'
  ): number {
    const radiusMap = {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    };
    return radiusMap[size];
  }

  /**
   * Get spacing value
   */
  static getSpacing(
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none' = 'md'
  ): number {
    const spacingMap = {
      none: 0,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
    };
    return spacingMap[size];
  }

  /**
   * Create a complete theme style object
   */
  static createThemeStyle(
    colors: ThemeColors,
    options: {
      backgroundColor?: keyof ThemeColors;
      textColor?: keyof ThemeColors;
      borderColor?: keyof ThemeColors;
      borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
      padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
      margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
      elevation?: number;
      shadowOpacity?: number;
    } = {}
  ) {
    const {
      backgroundColor = 'background',
      textColor = 'foreground',
      borderColor = 'border',
      borderRadius = 'md',
      padding = 'md',
      margin = 'none',
      elevation = 0,
      shadowOpacity = 0.1,
    } = options;

    return {
      backgroundColor: colors[backgroundColor],
      color: colors[textColor],
      borderColor: colors[borderColor],
      borderRadius: this.getBorderRadius(borderRadius),
      padding: this.getSpacing(padding),
      margin: this.getSpacing(margin),
      ...this.getThemeShadowStyle(colors, elevation, shadowOpacity),
    };
  }
}

// Export commonly used utilities
export const {
  getFontFamily,
  getFontStyle,
  getContrastColor,
  createGradient,
  createThemeGradient,
  getShadowStyle,
  getThemeShadowStyle,
  createColorPalette,
  getResponsiveFontSize,
  getBorderRadius,
  getSpacing,
  createThemeStyle,
} = ThemeUtils;
