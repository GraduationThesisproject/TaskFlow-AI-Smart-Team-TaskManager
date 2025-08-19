// Admin-specific hooks
export { useAdmin } from './useAdmin';
export { useUserManagement } from './useUserManagement';
export { useAnalytics } from './useAnalytics';

// General hooks (can be shared from main app or duplicated)
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useClickOutside } from './useClickOutside';
export { useTextDirection, isRTLLanguage, getTextDirectionForLanguage } from './useTextDirection';

// Media hooks
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsLargeScreen } from './media/useMediaQuery';
export { useScreenSize } from './media/useScreenSize';
export { useOrientation } from './media/useOrientation';

// Socket hooks
export { useSocket } from './socket/useSocket';
export { useSocketRoom } from './socket/useSocketRoom';
export { useSocketEvent } from './socket/useSocketEvent';
