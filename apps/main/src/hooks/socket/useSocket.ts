import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';
import { SocketMessage, SocketEvent } from '../../types';

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
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
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
