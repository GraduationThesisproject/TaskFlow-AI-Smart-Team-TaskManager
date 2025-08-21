export const themes = {
  light: {
    '--background': '0 0% 70%',
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
    // Scrollbar colors for light theme
    '--scrollbar-track': '210 40% 96%', // Light gray track
    '--scrollbar-thumb': '215 20% 65%', // Medium gray thumb
    '--scrollbar-thumb-hover': '215 25% 55%', // Darker on hover
    '--scrollbar-corner': '210 40% 96%', // Light gray corner
    // Gradient colors for light theme
    '--gradient-primary': '201 100% 44%', // Primary blue
    '--gradient-secondary': '170 100% 45%', // Accent cyan
    '--gradient-accent': '215 20% 65%', // Medium gray
    '--gradient-muted': '210 40% 96%', // Light gray
  },
  dark: {
    '--background': '0 0% 10%', // Layout background
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
    // Scrollbar colors for dark theme
    '--scrollbar-track': '0 0% 16%', // Dark gray track
    '--scrollbar-thumb': '0 0% 30%', // Medium gray thumb
    '--scrollbar-thumb-hover': '0 0% 40%', // Lighter on hover
    '--scrollbar-corner': '0 0% 16%', // Dark gray corner
    // Gradient colors for dark theme
    '--gradient-primary': '201 100% 44%', // Primary blue
    '--gradient-secondary': '170 100% 45%', // Accent cyan
    '--gradient-accent': '0 0% 30%', // Medium gray
    '--gradient-muted': '0 0% 16%', // Dark gray
  },
};

export const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  const themeVars = themes[theme];
  
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.setAttribute('data-theme', theme);
  
  // Apply scrollbar styles
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

// Export ThemeProvider from the main index
export { ThemeProvider, useTheme, ThemeToggle } from './ThemeProvider';
