// Socket hooks index file
// Export all socket-related hooks for easy importing

// Core socket hook
export { useSocket } from './useSocket';

// Namespace-specific hooks
export { useBoardSocket, useNotificationSocket, useSystemSocket, useChatSocket, useWorkspaceSocket } from '../../contexts/SocketContext';

// Business logic hooks
export { useTaskSocket } from './useTaskSocket';
export { useNotifications } from './useNotifications';
export { useSystemMonitoring } from './useSystemSocket';
export { useWorkspaceSocketOperations } from './useWorkspaceSocket';
export { useChatSocketOperations } from './useChatSocket';

// Utility hooks
export { useSocketEvent } from './useSocketEvent';
export { useSocketRoom } from './useSocketRoom';

// Context hooks
export { useSocketContext, useSocketConnection } from '../../contexts/SocketContext';
