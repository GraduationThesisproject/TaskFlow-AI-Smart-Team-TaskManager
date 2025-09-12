// Font configuration for cross-platform support
// Supports iOS and Android with proper font fallbacks

export const Fonts = {
  // Primary font family - Poppins (using specific weight files)
  primary: {
    // Using Poppins specific weight files
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    light: 'Poppins-Light',
  },
  
  // Secondary font family - Poppins (using specific weight files)
  secondary: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    light: 'Poppins-Light',
  },
  
  // Monospace font - SpaceMono (using available font)
  mono: {
    regular: 'SpaceMono-Regular',
    medium: 'SpaceMono-Regular',
    bold: 'SpaceMono-Regular',
  },
  
  // System fallbacks
  system: {
    // iOS system fonts
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      semiBold: 'SF Pro Text',
      bold: 'SF Pro Text',
      light: 'SF Pro Text',
    },
    // Android system fonts
    android: {
      regular: 'Roboto',
      medium: 'Roboto',
      semiBold: 'Roboto',
      bold: 'Roboto',
      light: 'Roboto',
    },
  },
};

// Font size scale
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

// Font weight scale
export const FontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Line height scale
export const LineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

// Letter spacing scale
export const LetterSpacing = {
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
};

// Helper function to get platform-specific font family
export function getFontFamily(
  fontFamily: keyof typeof Fonts.primary,
  platform: 'ios' | 'android' = 'ios'
): string {
  const customFont = Fonts.primary[fontFamily];
  const systemFont = Fonts.system[platform][fontFamily];
  
  // Return custom font with system fallback
  return `${customFont}, ${systemFont}`;
}

// Helper function to get font style object
export function getFontStyle(
  size: keyof typeof FontSizes = 'base',
  weight: keyof typeof FontWeights = 'normal',
  family: keyof typeof Fonts.primary = 'regular',
  platform: 'ios' | 'android' = 'ios'
) {
  return {
    fontSize: FontSizes[size],
    fontWeight: FontWeights[weight],
    fontFamily: getFontFamily(family, platform),
  };
}

// Predefined text styles
export const TextStyles = {
  // Display styles
  display: {
    large: getFontStyle('6xl', 'bold'),
    medium: getFontStyle('5xl', 'bold'),
    small: getFontStyle('4xl', 'bold'),
  },
  
  // Heading styles
  heading: {
    h1: getFontStyle('3xl', 'bold'),
    h2: getFontStyle('2xl', 'semiBold'),
    h3: getFontStyle('xl', 'semiBold'),
    h4: getFontStyle('lg', 'medium'),
    h5: getFontStyle('base', 'medium'),
    h6: getFontStyle('sm', 'medium'),
  },
  
  // Body text styles
  body: {
    large: getFontStyle('lg', 'normal'),
    medium: getFontStyle('base', 'normal'),
    small: getFontStyle('sm', 'normal'),
  },
  
  // Label styles
  label: {
    large: getFontStyle('base', 'medium'),
    medium: getFontStyle('sm', 'medium'),
    small: getFontStyle('xs', 'medium'),
  },
  
  // Caption styles
  caption: {
    large: getFontStyle('sm', 'normal'),
    medium: getFontStyle('xs', 'normal'),
    small: getFontStyle('xs', 'light'),
  },
  
  // Button styles
  button: {
    large: getFontStyle('lg', 'semiBold'),
    medium: getFontStyle('base', 'semiBold'),
    small: getFontStyle('sm', 'semiBold'),
  },
  
  // Code styles
  code: {
    large: getFontStyle('lg', 'normal'),
    medium: getFontStyle('base', 'normal'),
    small: getFontStyle('sm', 'normal'),
  },
};

// Font loading configuration - only load existing fonts
export const FontConfig = {
  // Font files to load (relative to assets/fonts/)
  fonts: [
    // Poppins specific weights (confirmed to exist)
    'Poppins-Regular.ttf',
    'Poppins-Medium.ttf',
    'Poppins-SemiBold.ttf',
    'Poppins-Bold.ttf',
    'Poppins-Light.ttf',
    
    // SpaceMono (confirmed to exist)
    'SpaceMono-Regular.ttf',
  ],
  
  // Font loading options
  options: {
    // Enable font loading timeout
    timeout: 10000,
    // Enable font loading retry
    retry: 3,
  },
};
