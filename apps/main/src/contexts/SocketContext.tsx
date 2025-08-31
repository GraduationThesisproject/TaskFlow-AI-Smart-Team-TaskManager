import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [isReady, setIsReady] = useState(false);

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

  // Determine if we're ready to attempt socket connections
  const isReadyToConnect = !authLoading && isAuthenticated && !!token;

  // Update socket connections when authentication state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', { 
      isAuthenticated, 
      hasToken: !!token, 
      authLoading,
      isReadyToConnect 
    });
    
    if (isReadyToConnect) {
      console.log('✅ Setting up authenticated socket connections for all namespaces');
      setLastAttempt(new Date());
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
      setLastAttempt(null);
      setIsReady(false);
      
      // Disconnect all namespaces
      boardSocket.disconnect();
      notificationSocket.disconnect();
      systemSocket.disconnect();
      chatSocket.disconnect();
      workspaceSocket.disconnect();
    }
  }, [isAuthenticated, token, authLoading, isReadyToConnect, user?.roles?.global, user?.roles?.permissions]);

  // Manual reconnect function
  const reconnect = () => {
    if (isReadyToConnect) {
      console.log('🔄 Manual reconnection requested for all namespaces');
      setLastAttempt(new Date());
      
      boardSocket.connect();
      notificationSocket.connect();
      chatSocket.connect();
      workspaceSocket.connect();
      
      if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
        systemSocket.connect();
      }
    } else {
      console.log('❌ Cannot reconnect - not ready to connect');
    }
  };

  // Disconnect all namespaces
  const disconnect = () => {
    console.log('🔌 Disconnecting all socket namespaces');
    boardSocket.disconnect();
    notificationSocket.disconnect();
    systemSocket.disconnect();
    chatSocket.disconnect();
    workspaceSocket.disconnect();
  };

  // Get namespace by name
  const getNamespace = (name: 'board' | 'notifications' | 'system' | 'chat' | 'workspace'): SocketNamespace => {
    const namespaces = {
      board: boardSocket,
      notifications: notificationSocket,
      system: systemSocket,
      chat: chatSocket,
      workspace: workspaceSocket,
    };
    return namespaces[name];
  };

  // Global connection status
  const isAnyConnected = boardSocket.isConnected || notificationSocket.isConnected || 
                        systemSocket.isConnected || chatSocket.isConnected || workspaceSocket.isConnected;
  
  const isAnyConnecting = boardSocket.isConnecting || notificationSocket.isConnecting || 
                         systemSocket.isConnecting || chatSocket.isConnecting || workspaceSocket.isConnecting;
  
  const hasErrors = !!(boardSocket.error || notificationSocket.error || 
                      systemSocket.error || chatSocket.error || workspaceSocket.error);

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
    board: boardSocket,
    notifications: notificationSocket,
    system: systemSocket,
    chat: chatSocket,
    workspace: workspaceSocket,
    
    isAnyConnected,
    isAnyConnecting,
    hasErrors,
    
    reconnect,
    disconnect,
    getNamespace,
    
    connectionDetails: {
      baseUrl: env.SOCKET_URL,
      hasToken: !!token,
      authStatus: authLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not_authenticated',
      lastAttempt,
      isReady,
      namespaces: ['board', 'notifications', 'chat', 'workspace', 'system'],
    },
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
  return context.board;
}

// Hook for components that need notification socket functionality
export function useNotificationSocket() {
  const context = useSocketContext();
  return context.notifications;
}

// Hook for components that need system socket functionality (admin only)
export function useSystemSocket() {
  const context = useSocketContext();
  return context.system;
}

// Hook for components that need chat socket functionality
export function useChatSocket() {
  const context = useSocketContext();
  return context.chat;
}

// Hook for components that need workspace socket functionality
export function useWorkspaceSocket() {
  const context = useSocketContext();
  return context.workspace;
}

// Hook for components that need any socket connection
export function useSocketConnection() {
  const context = useSocketContext();
  
  return {
    isAnyConnected: context.isAnyConnected,
    isAnyConnecting: context.isAnyConnecting,
    hasErrors: context.hasErrors,
    reconnect: context.reconnect,
    disconnect: context.disconnect,
    connectionDetails: context.connectionDetails,
  };
}
