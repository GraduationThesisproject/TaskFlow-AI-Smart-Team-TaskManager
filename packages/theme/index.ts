export const themes = {
  light: {
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--primary': '201 100% 44%', // #007ADF
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 40% 96%',
    '--secondary-foreground': '222.2 84% 4.9%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '170 100% 45%', // #00E8C6
    '--accent-foreground': '222.2 84% 4.9%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '201 100% 44%',
    '--radius': '0.5rem',
    '--neutral-0': '0 0% 0%',
    '--neutral-100': '0 0% 10%',
    '--neutral-200': '0 0% 16%',
    '--neutral-1000': '0 0% 100%',
  },
  dark: {
    '--background': '0 0% 0%', // Pure black background
    '--foreground': '0 0% 100%', // White text
    '--card': '0 0% 10%', // #1A1A1A for cards
    '--card-foreground': '0 0% 100%',
    '--popover': '0 0% 16%', // #2A2A2A for popovers
    '--popover-foreground': '0 0% 100%',
    '--primary': '201 100% 44%', // #007ADF - Primary Blue
    '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 16%', // #2A2A2A for secondary elements
    '--secondary-foreground': '0 0% 100%',
    '--muted': '0 0% 16%', // #2A2A2A
    '--muted-foreground': '215 20.2% 65.1%',
    '--accent': '170 100% 45%', // #00E8C6 - Accent Cyan
    '--accent-foreground': '0 0% 0%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0% 16%', // #2A2A2A for borders
    '--input': '0 0% 16%', // #2A2A2A for inputs
    '--ring': '201 100% 44%', // Primary blue for focus rings
    '--radius': '0.5rem',
    '--neutral-0': '0 0% 0%', // #000000
    '--neutral-100': '0 0% 10%', // #1A1A1A  
    '--neutral-200': '0 0% 16%', // #2A2A2A
    '--neutral-1000': '0 0% 100%', // #FFFFFF
    '--success': '142 76% 36%', // Green
    '--warning': '38 92% 50%', // Orange
    '--error': '0 84% 60%', // Red
    '--info': '201 100% 44%', // Blue
  },
};

export const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  const themeVars = themes[theme];
  
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.setAttribute('data-theme', theme);
};
