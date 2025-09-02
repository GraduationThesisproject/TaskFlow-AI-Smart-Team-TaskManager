// Color utility functions for mobile theme management
// Migrated from packages/theme/colorUtils.ts

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

/**
 * Convert HSL to RGB for React Native
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
};

/**
 * Parse HSL string and convert to hex for React Native
 * @param hslString - HSL string in format "h s% l%"
 * @returns Hex color string
 */
export const parseHslToHex = (hslString: string): string => {
  const match = hslString.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!match) return '#000000';
  
  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);
  
  return hslToHex(h, s, l);
};

/**
 * Convert any color format to HSL string for mobile use
 * @param color - Color in hex, rgb, or hsl format
 * @returns HSL string or null if invalid
 */
export const toHslString = (color: string): string | null => {
  if (!color) return null;

  // Already HSL
  if (color.startsWith('hsl(') && color.endsWith(')')) {
    return color.slice(4, -1).trim();
  }

  // Hex
  if (color.startsWith('#')) {
    const { h, s, l } = hexToHsl(color);
    return hslToCss(h, s, l);
  }

  // rgb()
  if (color.startsWith('rgb(') && color.endsWith(')')) {
    const values = color.slice(4, -1).split(',').map(v => v.trim());
    if (values.length < 3) return null;
    const r = parseInt(values[0], 10);
    const g = parseInt(values[1], 10);
    const b = parseInt(values[2], 10);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const { h, s, l } = hexToHsl(hex);
    return hslToCss(h, s, l);
  }

  return null;
};

/**
 * Compute a contrasting foreground color for the given HSL
 * @param hsl - HSL string in format "h s% l%"
 * @returns HSL string for contrasting foreground
 */
export const hslForegroundFor = (hsl: string): string => {
  try {
    const parts = hsl.split(' ').map(p => p.replace('%', ''));
    const l = parseFloat(parts[2]);
    // If lightness is high, use dark foreground; else use white
    return l > 60 ? '222.2 84% 4.9%' : '0 0% 100%';
  } catch {
    return '0 0% 100%';
  }
};
