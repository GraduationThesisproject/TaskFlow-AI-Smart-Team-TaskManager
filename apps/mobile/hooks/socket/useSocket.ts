import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
  namespace?: string;
  auth?: {
    token: string;
  };
}

export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Clear any existing reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Close existing socket if it exists
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      // console.log('🔌 Creating socket connection to:', options.url);
      // console.log('🔑 Authentication token:', options.auth?.token ? 'Present' : 'Missing');

      // Create socket with namespace if specified
      const socketUrl = options.namespace ? `${options.url}${options.namespace}` : options.url;
      
      socketRef.current = io(socketUrl, {
        autoConnect: false, // We'll manually connect
        auth: options.auth,
        // Prefer polling first; upgrade to websocket when possible
        transports: ['polling', 'websocket'],
        path: '/socket.io',
        timeout: 30000, // Increased timeout
        reconnection: false, // We'll handle reconnection manually
        forceNew: true,
        upgrade: true,
        rememberUpgrade: false,
        // Add additional options for better connection handling
        reconnectionAttempts: 0, // Disable built-in reconnection (use with reconnection: false)
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Set up event listeners
      socketRef.current.on('connect', () => {
        // console.log('🔌 Socket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      });

      socketRef.current.on('disconnect', (reason: string) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (reason === 'io server disconnect') {
          setError('Server disconnected');
        } else if (reason === 'io client disconnect') {
          setError('Client disconnected');
        } else if (reason === 'transport close') {
          setError('Transport closed');
        } else if (reason === 'ping timeout') {
          setError('Connection timeout');
        } else if (reason === 'transport error') {
          setError('Transport error');
        } else if (reason === 'parse error') {
          setError('Parse error');
        } else {
          setError(`Disconnected: ${reason}`);
        }
      });

      socketRef.current.on('connect_error', (err) => {
        //console.error('❌ Socket connection error:', err);
        setIsConnecting(false);
        
        let errorMessage = err.message || 'Connection failed';
        
        // Handle specific error types
        if (err.message?.includes('Authentication')) {
          // errorMessage = 'Authentication failed - please log in again';
        } else if (err.message?.includes('CORS')) {
          // errorMessage = 'CORS error - check server configuration';
        } else if (err.message?.includes('timeout')) {
          errorMessage = 'Connection timeout - server may be unavailable';
        }
        
        setError(errorMessage);
        
        // Attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          //console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          // setError(`Failed to connect after ${maxReconnectAttempts} attempts. Please check your connection and try again.`);
        }
      });

      socketRef.current.on('error', (err) => {
        // console.error('❌ Socket error:', err);
        setError(err.message || 'Socket error');
      });

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          // console.log('⏰ Connection timeout - closing socket');
          socketRef.current.close();
          setIsConnecting(false);
          setError('Connection timeout - please try again');
        }
      }, 30000); // 30 second timeout

      // Now manually connect
      // console.log('🚀 Attempting to connect...');
      socketRef.current.connect();

    } catch (err) {
      // console.error('❌ Failed to create socket connection:', err);
      setIsConnecting(false);
      setError('Failed to create socket connection');
    }
  }, [options.url, options.auth]);

  const disconnect = useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      setError('Socket not connected');
      // console.warn('Attempted to emit event on disconnected socket:', event);
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

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    // Only connect if we have a token and autoConnect is enabled
    if (options.autoConnect && options.auth?.token) {
      // Add a longer delay to ensure the backend is ready and auth is stable
      const connectTimeout = setTimeout(() => {
        // console.log('🔄 Auto-connecting socket with token...');
        connect();
      }, 500); // Increased delay to 500ms

      return () => {
        clearTimeout(connectTimeout);
        cleanup();
      };
    }

    return cleanup;
  }, [connect, cleanup, options.autoConnect, options.auth?.token]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
  };
}
