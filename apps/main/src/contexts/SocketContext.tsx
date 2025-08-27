import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from '../hooks/socket/useSocket';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/env';

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socket: any;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
  reconnect: () => void;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  connectionDetails: {
    url: string;
    hasToken: boolean;
    authStatus: string;
    lastAttempt: Date | null;
    isReady: boolean;
  };
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
  const [socketOptions, setSocketOptions] = useState<{
    url: string;
    autoConnect: boolean;
    auth?: { token: string };
  }>({
    url: env.SOCKET_URL,
    autoConnect: false,
  });
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    socket,
    isConnected,
    isConnecting,
    error,
    emit,
    on,
    off,
    connect,
    reconnectAttempts,
    maxReconnectAttempts,
  } = useSocket(socketOptions);

  // Determine if we're ready to attempt socket connection
  const isReadyToConnect = !authLoading && isAuthenticated && !!token;

  // Update socket options when authentication state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', { 
      isAuthenticated, 
      hasToken: !!token, 
      authLoading,
      isReadyToConnect 
    });
    
    if (isReadyToConnect) {
      console.log('✅ Setting up authenticated socket connection');
      setSocketOptions({
        url: env.SOCKET_URL,
        autoConnect: true,
        auth: { token },
      });
      setLastAttempt(new Date());
      setIsReady(true);
    } else if (!authLoading && (!isAuthenticated || !token)) {
      console.log('❌ Clearing socket connection - no authentication');
      setSocketOptions({
        url: env.SOCKET_URL,
        autoConnect: false,
      });
      setLastAttempt(null);
      setIsReady(false);
    }
    // If authLoading is true, we don't change anything - wait for it to complete
  }, [isAuthenticated, token, authLoading, isReadyToConnect]);

  // Manual reconnect function
  const reconnect = () => {
    if (isReadyToConnect) {
      console.log('🔄 Manual reconnection requested');
      setSocketOptions(prev => ({
        ...prev,
        autoConnect: true,
        auth: { token },
      }));
      setLastAttempt(new Date());
    } else {
      console.log('❌ Cannot reconnect - not ready to connect');
    }
  };

  // Log connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 Socket connected successfully');
    } else if (isConnecting) {
      console.log('🔄 Socket connecting...');
    } else if (error) {
      console.error('❌ Socket error:', error);
    }
  }, [isConnected, isConnecting, error]);

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Socket context debug info:', {
      isAuthenticated,
      hasToken: !!token,
      authLoading,
      isReadyToConnect,
      socketOptions,
      isConnected,
      isConnecting,
      error,
      isReady
    });
  }, [isAuthenticated, token, authLoading, isReadyToConnect, socketOptions, isConnected, isConnecting, error, isReady]);

  const value: SocketContextType = {
    isConnected,
    isConnecting,
    error,
    socket,
    emit,
    on,
    off,
    reconnect,
    reconnectAttempts,
    maxReconnectAttempts,
    connectionDetails: {
      url: env.SOCKET_URL,
      hasToken: !!token,
      authStatus: authLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not_authenticated',
      lastAttempt,
      isReady,
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

// Hook for components that need socket functionality
export function useSocketConnection() {
  const context = useSocketContext();
  
  // Return a simplified interface for basic socket operations
  return {
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    error: context.error,
    emit: context.emit,
    on: context.on,
    off: context.off,
    reconnect: context.reconnect,
    connectionStatus: context.isConnected ? 'connected' : context.isConnecting ? 'connecting' : 'disconnected',
    connectionDetails: context.connectionDetails,
  };
}
