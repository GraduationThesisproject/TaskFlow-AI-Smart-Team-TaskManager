import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';
import type { SocketMessage, SocketEvent } from '../../types';
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
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    setError(null);

    try {
      socketRef.current = io(options.url, {
        autoConnect: options.autoConnect ?? true,
        auth: options.auth,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        setIsConnecting(false);
        if (reason === 'io server disconnect') {
          setError('Server disconnected');
        }
      });

      socketRef.current.on('connect_error', (err) => {
        setIsConnecting(false);
        setError(err.message || 'Connection failed');
      });

      socketRef.current.on('error', (err) => {
        setError(err.message || 'Socket error');
      });
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to create socket connection');
    }
  }, [options.url, options.autoConnect, options.auth]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      setError('Socket not connected');
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
    if (options.autoConnect && options.auth?.token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect, options.auth?.token]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
