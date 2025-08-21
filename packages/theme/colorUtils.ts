// Color utility functions for theme management

/**
 * Convert hex color to HSL values
 * @param hex - Hex color string (e.g., "#007ADF")
 * @returns HSL values as an object { h, s, l }
 */
export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

/**
 * Convert HSL values to CSS HSL string
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns CSS HSL string (e.g., "201 100% 44%")
 */
export const hslToCss = (h: number, s: number, l: number): string => {
  return `${h} ${s}% ${l}%`;
};

/**
 * Convert hex color to CSS HSL string
 * @param hex - Hex color string
 * @returns CSS HSL string
 */
export const hexToCssHsl = (hex: string): string => {
  const { h, s, l } = hexToHsl(hex);
  return hslToCss(h, s, l);
};

/**
 * Generate a lighter version of a color
 * @param hex - Base hex color
 * @param amount - Lightness increase (0-100)
 * @returns CSS HSL string for lighter color
 */
export const lightenColor = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.min(100, l + amount);
  return hslToCss(h, s, newL);
};

/**
 * Generate a darker version of a color
 * @param hex - Base hex color
 * @param amount - Lightness decrease (0-100)
 * @returns CSS HSL string for darker color
 */
export const darkenColor = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.max(0, l - amount);
  return hslToCss(h, s, newL);
};

/**
 * Generate a more saturated version of a color
 * @param hex - Base hex color
 * @param amount - Saturation increase (0-100)
 * @returns CSS HSL string for more saturated color
 */
export const saturateColor = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  const newS = Math.min(100, s + amount);
  return hslToCss(h, newS, l);
};

/**
 * Generate a less saturated version of a color
 * @param hex - Base hex color
 * @param amount - Saturation decrease (0-100)
 * @returns CSS HSL string for less saturated color
 */
export const desaturateColor = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  const newS = Math.max(0, s - amount);
  return hslToCss(h, newS, l);
};
