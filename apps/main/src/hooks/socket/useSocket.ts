import { useEffect, useRef, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';
import { SocketMessage, SocketEvent } from '../../types';
import { useState } from 'react';

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

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    socketRef.current = io(options.url, {
      autoConnect: options.autoConnect ?? true,
      auth: options.auth,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });
  }, [options.url, options.autoConnect, options.auth]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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
    if (options.autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);

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
