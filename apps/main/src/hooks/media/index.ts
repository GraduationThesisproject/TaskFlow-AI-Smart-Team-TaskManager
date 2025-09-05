// Export all media hooks for easy importing
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsLargeScreen } from './useMediaQuery';
export { useScreenSize } from './useScreenSize';
export { useOrientation } from './useOrientation';

// Re-export commonly used hooks with aliases for convenience
export { useIsDesktop as useIsLargeScreen } from './useMediaQuery';
export { useIsMobile as useIsSmallScreen } from './useMediaQuery';
