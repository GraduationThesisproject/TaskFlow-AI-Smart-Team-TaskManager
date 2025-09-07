import { Platform } from 'react-native';
import { ThemeColors } from '@/constants/Colors';

/**
 * Theme utilities for consistent theming across the app
 */
export class ThemeUtils {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to HSL
   */
  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

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

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Convert HSL to hex
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

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
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
   * Get contrast color (black or white) for a given background color
   */
  static getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
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
        light: '#ffffff',
        main: baseColor,
        dark: '#000000',
        contrast: '#ffffff'
      };
    }

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return {
      light: this.hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.min(100, hsl.l + 20)),
      main: baseColor,
      dark: this.hslToHex(hsl.h, Math.min(100, hsl.s + 20), Math.max(0, hsl.l - 20)),
      contrast: this.getContrastColor(baseColor)
    };
  }

  /**
   * Create platform-specific shadow styles
   */
  static getThemeShadowStyle(
    colors: ThemeColors, 
    elevation: number = 4, 
    opacity: number = 0.15
  ) {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: colors['neutral-0'],
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: opacity,
        shadowRadius: elevation,
      };
    } else {
      return {
        elevation: elevation,
        shadowColor: colors['neutral-0'],
      };
    }
  }

  /**
   * Create a complete theme style object
   */
  static createThemeStyle(
    colors: ThemeColors,
    config: {
      backgroundColor?: keyof ThemeColors;
      textColor?: keyof ThemeColors;
      borderColor?: keyof ThemeColors;
      borderRadius?: number;
      padding?: number;
      margin?: number;
      elevation?: number;
    }
  ) {
    const style: any = {};

    if (config.backgroundColor) {
      style.backgroundColor = colors[config.backgroundColor];
    }
    if (config.textColor) {
      style.color = colors[config.textColor];
    }
    if (config.borderColor) {
      style.borderColor = colors[config.borderColor];
    }
    if (config.borderRadius !== undefined) {
      style.borderRadius = config.borderRadius;
    }
    if (config.padding !== undefined) {
      style.padding = config.padding;
    }
    if (config.margin !== undefined) {
      style.margin = config.margin;
    }
    if (config.elevation !== undefined) {
      Object.assign(style, this.getThemeShadowStyle(colors, config.elevation));
    }

    return style;
  }

  /**
   * Get responsive font size based on screen width
   */
  static getResponsiveFontSize(baseSize: number, screenWidth: number): number {
    const scale = screenWidth / 375; // Base width (iPhone X)
    return Math.round(baseSize * scale);
  }

  /**
   * Create gradient colors array
   */
  static createGradient(startColor: string, endColor: string, steps: number = 10): string[] {
    const startRgb = this.hexToRgb(startColor);
    const endRgb = this.hexToRgb(endColor);
    
    if (!startRgb || !endRgb) return [startColor, endColor];

    const gradient: string[] = [];
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * ratio);
      const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * ratio);
      const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * ratio);
      
      gradient.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return gradient;
  }

  /**
   * Create theme-aware gradient
   */
  static createThemeGradient(colors: ThemeColors, colorKey: keyof ThemeColors): string[] {
    const baseColor = colors[colorKey];
    const palette = this.createColorPalette(baseColor);
    return this.createGradient(palette.light, palette.dark);
  }

  /**
   * Validate color format
   */
  static isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
           /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color) ||
           /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color);
  }

  /**
   * Get color brightness (0-255)
   */
  static getColorBrightness(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  }

  /**
   * Check if color is light or dark
   */
  static isLightColor(color: string): boolean {
    return this.getColorBrightness(color) > 128;
  }

  /**
   * Get accessible text color for a background
   */
  static getAccessibleTextColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  }

  /**
   * Create opacity variant of a color
   */
  static withOpacity(color: string, opacity: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  /**
   * Generate random theme color
   */
  static generateRandomThemeColor(): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#F59E0B', // Orange
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

/**
 * Hook for theme utilities
 */
export function useThemeUtils() {
  return ThemeUtils;
}

export default ThemeUtils;