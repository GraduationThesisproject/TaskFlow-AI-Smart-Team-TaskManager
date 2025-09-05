import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/socket/useSocket';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/env';
import type { 
  SocketNamespace, 
  SocketContextType, 
  SocketProviderProps 
} from '../types/interfaces/socket';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [namespaces, setNamespaces] = useState<Map<string, SocketNamespace>>(new Map());

  // Create socket connections for each namespace
  const boardSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/',
    auth: token ? { token } : undefined,
  });

  const notificationSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/notifications',
    auth: token ? { token } : undefined,
  });

  const systemSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/system',
    auth: token ? { token } : undefined,
  });

  const chatSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/chat',
    auth: token ? { token } : undefined,
  });

  const workspaceSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/workspace',
    auth: token ? { token } : undefined,
  });

  // Create namespace objects
  const createNamespaceObject = (name: string, socketHook: ReturnType<typeof useSocket>): SocketNamespace => {
    return {
      name,
      socket: socketHook.socket,
      rooms: new Map(),
      on: socketHook.on,
      off: socketHook.off,
      emit: socketHook.emit,
      join: (room: string) => {
        socketHook.emit('join_room', { room });
      },
      leave: (room: string) => {
        socketHook.emit('leave_room', { room });
      },
    };
  };

  // Update namespaces when sockets change
  useEffect(() => {
    const newNamespaces = new Map();
    
    if (boardSocket.socket) {
      newNamespaces.set('board', createNamespaceObject('board', boardSocket));
    }
    if (notificationSocket.socket) {
      newNamespaces.set('notifications', createNamespaceObject('notifications', notificationSocket));
    }
    if (systemSocket.socket) {
      newNamespaces.set('system', createNamespaceObject('system', systemSocket));
    }
    if (chatSocket.socket) {
      newNamespaces.set('chat', createNamespaceObject('chat', chatSocket));
    }
    if (workspaceSocket.socket) {
      newNamespaces.set('workspace', createNamespaceObject('workspace', workspaceSocket));
    }
    
    setNamespaces(newNamespaces);
  }, [boardSocket.socket, notificationSocket.socket, systemSocket.socket, chatSocket.socket, workspaceSocket.socket]);

  // Determine if we're ready to attempt socket connections
  const isReadyToConnect = !authLoading && isAuthenticated && !!token;

  // Update socket connections when authentication state changes
  useEffect(() => {
    if (isReadyToConnect) {
      // Skip socket connections in development with mock authentication
      if (env.IS_DEV && env.ENABLE_API_MOCKING) {
        console.log('🔧 Skipping socket connections - using mock authentication');
        console.log('🔧 Mock tokens cannot authenticate with real backend socket server');
        setIsReady(true);
        return;
      }
      
      // Validate token format before attempting socket connections
      if (token && token.startsWith('mock-jwt-token-')) {
        console.log('🔧 Detected mock token, skipping socket connections');
        console.log('🔧 Mock tokens are not valid for real backend authentication');
        setIsReady(true);
        return;
      }
      
      console.log('✅ Setting up authenticated socket connections for all namespaces');
      setIsReady(true);
      
      // Connect to all namespaces
      boardSocket.connect();
      notificationSocket.connect();
      chatSocket.connect();
      workspaceSocket.connect();
      
      // Only connect to system socket if user has admin privileges
      if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
        systemSocket.connect();
      }
    } else if (!authLoading && (!isAuthenticated || !token)) {
      console.log('❌ Disconnecting all socket connections - no authentication');
      setIsReady(false);
      
      // Disconnect all namespaces
      boardSocket.disconnect();
      notificationSocket.disconnect();
      systemSocket.disconnect();
      chatSocket.disconnect();
      workspaceSocket.disconnect();
    }
  }, [isAuthenticated, token, authLoading, isReadyToConnect, user?.roles?.global, user?.roles?.permissions]);

  // Global connection status
  const isAnyConnected = boardSocket.isConnected || notificationSocket.isConnected || 
                        systemSocket.isConnected || chatSocket.isConnected || workspaceSocket.isConnected;
  
  const isAnyConnecting = boardSocket.isConnecting || notificationSocket.isConnecting || 
                         systemSocket.isConnecting || chatSocket.isConnecting || workspaceSocket.isConnecting;
  
  const hasErrors = !!(boardSocket.error || notificationSocket.error || 
                      systemSocket.error || chatSocket.error || workspaceSocket.error);

  // Connection methods
  const connect = () => {
    if (isReadyToConnect) {
      // Skip socket connections in development with mock authentication
      if (env.IS_DEV && env.ENABLE_API_MOCKING) {
        console.log('🔧 Skipping manual connection - using mock authentication');
        return;
      }
      
      // Validate token format before attempting socket connections
      if (token && token.startsWith('mock-jwt-token-')) {
        console.log('🔧 Detected mock token, skipping manual connection');
        console.log('🔧 Mock tokens are not valid for real backend authentication');
        return;
      }
      
      console.log('🔄 Manual connection requested for all namespaces');
      
      try {
        boardSocket.connect();
        notificationSocket.connect();
        chatSocket.connect();
        workspaceSocket.connect();
        
        if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
          systemSocket.connect();
        }
      } catch (error) {
        console.error('Failed to connect to socket namespaces:', error);
      }
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting all socket namespaces');
    boardSocket.disconnect();
    notificationSocket.disconnect();
    systemSocket.disconnect();
    chatSocket.disconnect();
    workspaceSocket.disconnect();
  };

  const reconnect = () => {
    disconnect();
    setTimeout(connect, 1000);
  };

  // Event handling methods
  const on = (event: string, callback: (data?: any) => void) => { // eslint-disable-line no-unused-vars
    // Default to board socket for events
    boardSocket.on(event, callback);
  };

  const off = (event: string) => {
    boardSocket.off(event);
  };

  const emit = (event: string, data?: any) => {
    boardSocket.emit(event, data);
  };

  // Room management methods
  const joinRoom = (room: string, namespace?: string) => {
    const targetNamespace = namespace ? namespaces.get(namespace) : namespaces.get('board');
    if (targetNamespace) {
      targetNamespace.join(room);
    }
  };

  const leaveRoom = (room: string, namespace?: string) => {
    const targetNamespace = namespace ? namespaces.get(namespace) : namespaces.get('board');
    if (targetNamespace) {
      targetNamespace.leave(room);
    }
  };

  // Namespace management methods
  const getNamespace = (name: string): SocketNamespace | null => {
    return namespaces.get(name) || null;
  };

  const createNamespace = (name: string): SocketNamespace => {
    // Note: This function cannot use hooks due to React rules
    // For now, return a placeholder namespace
    // In a real implementation, you would need to manage this differently
    const placeholderNamespace: SocketNamespace = {
      name,
      socket: null,
      rooms: new Map(),
      on: () => {},
      off: () => {},
      emit: () => {},
      join: () => {},
      leave: () => {},
    };
    
    return placeholderNamespace;
  };

  // Utility methods
  const isConnectedTo = (namespace: string): boolean => {
    const targetNamespace = namespaces.get(namespace);
    return targetNamespace?.socket?.connected || false;
  };

  const getConnectionStatus = (namespace: string): 'connected' | 'connecting' | 'disconnected' | 'error' => {
    const targetNamespace = namespaces.get(namespace);
    if (!targetNamespace || !targetNamespace.socket) return 'disconnected';
    
    if (targetNamespace.socket.connected) return 'connected';
    return 'connecting';
  };

  // Log connection status changes
  useEffect(() => {
    if (isAnyConnected) {
      console.log('🔌 At least one socket namespace connected');
    } else if (isAnyConnecting) {
      console.log('🔄 Socket namespaces connecting...');
    } else if (hasErrors) {
      console.error('❌ Socket errors detected in one or more namespaces');
    }
  }, [isAnyConnected, isAnyConnecting, hasErrors]);

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Socket context debug info:', {
      isAuthenticated,
      hasToken: !!token,
      authLoading,
      isReadyToConnect,
      isAnyConnected,
      isAnyConnecting,
      hasErrors,
      isReady,
      userRoles: user?.roles?.global,
      userPermissions: user?.roles?.permissions
    });
  }, [isAuthenticated, token, authLoading, isReadyToConnect, isAnyConnected, isAnyConnecting, hasErrors, isReady, user?.roles?.global, user?.roles?.permissions]);

  const value: SocketContextType = {
    // Main socket connections
    mainSocket: boardSocket.socket,
    boardSocket: boardSocket.socket,
    chatSocket: chatSocket.socket,
    notificationSocket: notificationSocket.socket,
    systemSocket: systemSocket.socket,
    workspaceSocket: workspaceSocket.socket,
    
    // Connection status
    isConnected: isAnyConnected,
    isConnecting: isAnyConnecting,
    connectionError: hasErrors ? 'One or more socket connections have errors' : null,
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Event handling
    on,
    off,
    emit,
    
    // Room management
    joinRoom,
    leaveRoom,
    
    // Namespace management
    getNamespace,
    createNamespace,
    
    // Utility methods
    isConnectedTo,
    getConnectionStatus,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

// Hook for components that need board socket functionality
export function useBoardSocket() {
  const context = useSocketContext();
  return context.boardSocket;
}

// Hook for components that need notification socket functionality
export function useNotificationSocket() {
  const context = useSocketContext();
  return context.notificationSocket;
}

// Hook for components that need system socket functionality (admin only)
export function useSystemSocket() {
  const context = useSocketContext();
  return context.systemSocket;
}

// Hook for components that need chat socket functionality
export function useChatSocket() {
  const context = useSocketContext();
  return context.chatSocket;
}

// Hook for components that need workspace socket functionality
export function useWorkspaceSocket() {
  const context = useSocketContext();
  return context.workspaceSocket;
}

// Hook for components that need any socket connection
export function useSocketConnection() {
  const context = useSocketContext();
  
  return {
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    connectionError: context.connectionError,
    reconnect: context.reconnect,
    disconnect: context.disconnect,
  };
}
