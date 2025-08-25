export const themes = {
  light: {
    '--background': '0 0% 99%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--primary': '201 100% 44%', // #007ADF
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 40% 96%',
    '--secondary-foreground': '222.2 84% 4.9%',
    '--muted': '210 40% 92%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '170 100% 45%', // #00E8C6
    '--accent-foreground': '222.2 84% 4.9%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 85%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '201 100% 44%',
    '--radius': '1rem',
    '--neutral-0': '0 0% 0%',
    '--neutral-100': '0 0% 10%',
    '--neutral-200': '0 0% 16%',
    '--neutral-1000': '0 0% 100%',
    '--success': '142 76% 36%',
    '--warning': '38 92% 50%',
    '--error': '0 84% 60%',
    '--info': '201 100% 44%',
    '--scrollbar-track': '210 40% 96%',
    '--scrollbar-thumb': '215 20% 65%',
    '--scrollbar-thumb-hover': '215 25% 55%',
    '--scrollbar-corner': '210 40% 96%',
    '--gradient-primary': '201 100% 44%',
    '--gradient-secondary': '170 100% 45%',
    '--gradient-accent': '170 100% 45%',
    '--gradient-muted': '210 40% 96%',
  },
  dark: {
    '--background': '0 0% 10%',
    '--foreground': '0 0% 100%',
    '--card': '0 0% 10%',
    '--card-foreground': '0 0% 100%',
    '--popover': '0 0% 16%',
    '--popover-foreground': '0 0% 100%',
    '--primary': '201 100% 44%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 16%',
    '--secondary-foreground': '0 0% 100%',
    '--muted': '0 0% 16%',
    '--muted-foreground': '215 20.2% 65.1%',
    '--accent': '170 100% 45%',
    '--accent-foreground': '0 0% 0%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0% 16%',
    '--input': '0 0% 16%',
    '--ring': '201 100% 44%',
    '--radius': '0.5rem',
    '--neutral-0': '0 0% 0%',
    '--neutral-100': '0 0% 10%',
    '--neutral-200': '0 0% 16%',
    '--neutral-1000': '0 0% 100%',
    '--success': '142 76% 36%',
    '--warning': '38 92% 50%',
    '--error': '0 84% 60%',
    '--info': '201 100% 44%',
    '--scrollbar-track': '0 0% 16%',
    '--scrollbar-thumb': '0 0% 30%',
    '--scrollbar-thumb-hover': '0 0% 40%',
    '--scrollbar-corner': '0 0% 16%',
    '--gradient-primary': '201 100% 44%',
    '--gradient-secondary': '170 100% 45%',
    '--gradient-accent': '0 0% 30%',
    '--gradient-muted': '0 0% 16%',
  },
};

type GradientPalette = 'orange' | 'purple' | 'green' | 'blue';

// Predefined gradient palettes
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

const applyGradientPalette = (vars: Record<string, string>, palette?: GradientPalette) => {
  if (!palette) return;
  const p = gradientPalettes[palette];
  if (!p) return;
  vars['--gradient-primary'] = p.primary;
  vars['--gradient-secondary'] = p.secondary;
  vars['--gradient-accent'] = p.accent;
  // keep --gradient-muted from theme defaults unless specified
};

export const applyTheme = (theme: 'light' | 'dark', userPrimaryColor?: string | null, gradientPalette?: GradientPalette) => {
  const root = document.documentElement;
  const themeVars = { ...themes[theme] };

  // Apply selected gradient palette first (can be overridden by userPrimaryColor below)
  applyGradientPalette(themeVars, gradientPalette);

  // Apply user primary color if provided
  if (userPrimaryColor) {
    try {
      const hsl = toHslString(userPrimaryColor);
      if (hsl) {
        // Drive both primary and accent so buttons, rings, and glows match
        themeVars['--primary'] = hsl;
        themeVars['--accent'] = hsl;
        themeVars['--ring'] = hsl;
        // Do not overwrite gradient variables; keep palette-driven gradients

        const fg = hslForegroundFor(hsl);
        // Keep text white for purple hues regardless of lightness to ensure readability
        const hue = parseFloat(hsl.split(' ')[0]);
        const isPurple = !Number.isNaN(hue) && hue >= 240 && hue <= 320;
        const forcedFg = isPurple ? '0 0% 100%' : fg;
        themeVars['--primary-foreground'] = forcedFg;
        themeVars['--accent-foreground'] = forcedFg;
      }
    } catch (error) {
      console.warn('Invalid user primary color:', userPrimaryColor);
    }
  }

  // Safeguard: ensure white text for purple hues even if userPrimaryColor wasn't provided
  const coerceWhiteForPurple = (hslVal?: string) => {
    if (!hslVal) return false;
    try {
      const hue = parseFloat(hslVal.split(' ')[0]);
      return !Number.isNaN(hue) && hue >= 240 && hue <= 320;
    } catch {
      return false;
    }
  };

  if (coerceWhiteForPurple(themeVars['--primary'])) {
    themeVars['--primary-foreground'] = '0 0% 100%';
  }
  if (coerceWhiteForPurple(themeVars['--accent'])) {
    themeVars['--accent-foreground'] = '0 0% 100%';
  }

  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.setAttribute('data-theme', theme);

  applyScrollbarStyles();
};

// Convert hex/rgb/hsl strings to an HSL space-separated string: "h s% l%"
const toHslString = (color: string): string | null => {
  if (!color) return null;

  // Already HSL
  if (color.startsWith('hsl(') && color.endsWith(')')) {
    return color.slice(4, -1).trim();
  }

  // Hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    let r: number, g: number, b: number;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }
    return rgbToHslString(r, g, b);
  }

  // rgb()
  if (color.startsWith('rgb(') && color.endsWith(')')) {
    const values = color.slice(4, -1).split(',').map(v => v.trim());
    if (values.length < 3) return null;
    const r = parseInt(values[0], 10);
    const g = parseInt(values[1], 10);
    const b = parseInt(values[2], 10);
    return rgbToHslString(r, g, b);
  }

  return null;
};

const rgbToHslString = (r: number, g: number, b: number): string => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }

  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
};

// Compute a contrasting foreground (white or near-black) for the given HSL "h s% l%"
const hslForegroundFor = (hsl: string): string => {
  try {
    const parts = hsl.split(' ').map(p => p.replace('%', ''));
    const l = parseFloat(parts[2]);
    // If lightness is high, use dark foreground; else use white
    return l > 60 ? '222.2 84% 4.9%' : '0 0% 100%';
  } catch {
    return '0 0% 100%';
  }
};

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
    
    * {
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--scrollbar-thumb)) hsl(var(--scrollbar-track));
    }
  `;
  
  const existingStyle = document.getElementById('theme-scrollbar-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-scrollbar-styles';
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
};

export { ThemeProvider, useTheme, ThemeToggle } from './ThemeProvider';
export type { GradientPalette };
export { applyGradientPalette };
export * from './colorUtils';
export * from './themeManager';
