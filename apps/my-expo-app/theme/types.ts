export interface Colors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Priority colors
  priorityVeryHigh: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  
  // Border and divider
  border: string;
  divider: string;
  
  // Interactive states
  disabled: string;
  placeholder: string;
}

export interface Typography {
  // Font families
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  
  // Font sizes
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  
  // Line heights
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  
  // Font weights
  fontWeight: {
    normal: string;
    medium: string;
    bold: string;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Shadows {
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
}

export interface GlobalStyles {
  // Layout styles
  container: object;
  header: object;
  headerRow: object;
  content: object;
  
  // Navigation styles
  searchContainer: object;
  searchBar: object;
  
  // Tab styles
  viewTabs: object;
  activeTab: object;
  inactiveTab: object;
  
  // Board/Grid styles
  boardContainer: object;
  column: object;
  columnHeader: object;
  columnTitleRow: object;
  
  // Card styles
  card: object;
  cardHeader: object;
  cardContent: object;
  
  // Task styles
  taskItem: object;
  taskCard: object;
  taskHeader: object;
  taskTitle: object;
  taskCount: object;
  priorityBadge: object;
  progressContainer: object;
  progressBar: object;
  progressFill: object;
  
  // Button styles
  primaryButton: object;
  secondaryButton: object;
  iconButton: object;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  globalStyles: GlobalStyles;
}

export type ThemeMode = 'light' | 'dark';
