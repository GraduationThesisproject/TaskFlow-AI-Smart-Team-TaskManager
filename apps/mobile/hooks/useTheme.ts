import { useTheme as useTaskflowTheme } from '@taskflow/theme';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useTaskflowTheme();

  return {
    theme: theme as Theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};
