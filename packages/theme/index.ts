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

export const applyTheme = (theme: 'light' | 'dark', userPrimaryColor?: string | null) => {
  const root = document.documentElement;
  const themeVars = { ...themes[theme] };
  
  // Apply user primary color if provided
  if (userPrimaryColor) {
    try {
      const color = parseColor(userPrimaryColor);
      if (color) {
        themeVars['--primary'] = color;
        themeVars['--ring'] = color;
        themeVars['--gradient-primary'] = color;
      }
    } catch (error) {
      console.warn('Invalid user primary color:', userPrimaryColor);
    }
  }
  
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.setAttribute('data-theme', theme);
  
  applyScrollbarStyles();
};

const parseColor = (color: string): string | null => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `${r} ${g} ${b}`;
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `${r} ${g} ${b}`;
    }
  }
  
  // Handle HSL colors
  if (color.startsWith('hsl(') && color.endsWith(')')) {
    return color.slice(4, -1);
  }
  
  // Handle RGB colors
  if (color.startsWith('rgb(') && color.endsWith(')')) {
    const values = color.slice(4, -1).split(',').map(v => v.trim());
    return values.join(' ');
  }
  
  return null;
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
export * from './colorUtils';
export * from './themeManager';
