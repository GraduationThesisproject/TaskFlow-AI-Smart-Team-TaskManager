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
  const lastConnectionAttemptRef = useRef<number>(0);
  const connectionDebounceMs = 500; // 500ms debounce (reduced from 2000ms)
  const isConnectingRef = useRef(false); // Prevent multiple simultaneous connections

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current) {
      console.log('🔌 Connection already in progress, skipping...');
      return;
    }

    // Debounce connection attempts
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < connectionDebounceMs) {
      console.log('🔌 Connection attempt debounced, too soon since last attempt');
      return;
    }
    lastConnectionAttemptRef.current = now;
    isConnectingRef.current = true;

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

      console.log('🔌 Creating socket connection to:', options.url);
      console.log('🔑 Authentication token:', options.auth?.token ? 'Present' : 'Missing');
      console.log('📡 Namespace:', options.namespace);

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
        console.log('🔌 Socket connected successfully to:', socketUrl, {
          namespace: options.namespace,
          socketId: socketRef.current?.id
        });
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        isConnectingRef.current = false; // Reset connection flag
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
        isConnectingRef.current = false; // Reset connection flag

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
        console.error('❌ Socket connection error:', err, {
          namespace: options.namespace,
          url: socketUrl,
          auth: options.auth,
          errorType: err.type,
          errorDescription: err.description,
          errorContext: err.context,
          errorTransport: err.transport
        });
        console.error('❌ Auth token present:', !!options.auth?.token);
        console.error('❌ Full error object:', err);
        setIsConnecting(false);
        isConnectingRef.current = false; // Reset connection flag
        
        let errorMessage = err.message || 'Connection failed';
        
        // Handle specific error types
        if (err.message?.includes('Authentication')) {
          errorMessage = 'Authentication failed - please log in again';
        } else if (err.message?.includes('CORS')) {
          errorMessage = 'CORS error - check server configuration';
        } else if (err.message?.includes('timeout')) {
          errorMessage = 'Connection timeout - server may be unavailable';
        } else if (err.message?.includes('xhr poll error')) {
          errorMessage = 'Network error - check if server is running';
        }
        
        setError(errorMessage);
        
        // Don't attempt reconnection for authentication errors
        if (err.message?.includes('Authentication') || err.message?.includes('Invalid token')) {
          console.error('❌ Authentication error - stopping reconnection attempts');
          setError('Authentication failed - please refresh the page');
          return;
        }
        
        // Attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError(`Failed to connect after ${maxReconnectAttempts} attempts. Please check your connection and try again.`);
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
      console.log('🚀 Attempting to connect to:', socketUrl);
      socketRef.current.connect();

    } catch (err) {
      // console.error('❌ Failed to create socket connection:', err);
      setIsConnecting(false);
      isConnectingRef.current = false; // Reset connection flag
      setError('Failed to create socket connection');
    }
  }, [options.url, options.namespace, options.auth?.token]);

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
    isConnectingRef.current = false; // Reset connection flag
    reconnectAttemptsRef.current = 0;
  }, []);

  // Recreate socket when auth token actually changes (not just object reference)
  // Remove this useEffect as it was causing infinite loops
  // The connect function already handles closing existing sockets

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      setError('Socket not connected');
      // Attempt to reconnect if not connected
      if (socketRef.current && !socketRef.current.connected) {
        console.warn('Attempted to emit event on disconnected socket, attempting reconnect:', event);
        connect();
      }
    }
  }, [connect]);

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
      // Add a short delay to ensure the backend is ready and auth is stable
      const connectTimeout = setTimeout(() => {
        console.log('🔄 Auto-connecting socket with token...', {
          namespace: options.namespace,
          hasToken: !!options.auth?.token,
          autoConnect: options.autoConnect
        });
        connect();
      }, 200); // Reduced delay to 200ms

      return () => {
        clearTimeout(connectTimeout);
        cleanup();
      };
    }

    return cleanup;
  }, [options.autoConnect, options.auth?.token]); // Removed connect and cleanup from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []); // Empty dependency array for cleanup on unmount only

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
