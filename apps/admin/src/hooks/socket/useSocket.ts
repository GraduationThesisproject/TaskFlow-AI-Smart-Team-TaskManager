import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
  auth?: {
    token: string;
  };
}

export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    url: options.url,
    autoConnect: options.autoConnect ?? true,
    auth: options.auth,
  }), [options.url, options.autoConnect, options.auth?.token]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    socketRef.current = io(memoizedOptions.url, {
      autoConnect: memoizedOptions.autoConnect,
      auth: memoizedOptions.auth,
      // CORS and connection options
      withCredentials: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      // Error handling
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
      console.log('Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      setIsConnected(false);
      setIsConnecting(false);
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }, [memoizedOptions]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  useEffect(() => {
    if (memoizedOptions.autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [memoizedOptions.autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
