import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { env } from '../../config/env';
import { io, Socket } from 'socket.io-client';

export function SocketConnectionTest() {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not started');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testBasicConnection = async () => {
    addLog('Testing basic HTTP connection...');
    try {
      const response = await fetch(`${env.SOCKET_URL}/health`);
      if (response.ok) {
        addLog('✅ HTTP connection successful');
        setConnectionStatus('HTTP OK');
      } else {
        addLog(`❌ HTTP connection failed: ${response.status}`);
        setConnectionStatus('HTTP Failed');
      }
    } catch (err) {
      addLog(`❌ HTTP connection error: ${err}`);
      setConnectionStatus('HTTP Error');
    }
  };

  const testSocketConnection = () => {
    addLog('Testing Socket.IO connection...');
    setConnectionStatus('Connecting...');
    setError(null);

    try {
      // Create socket with minimal options
      const newSocket = io(env.SOCKET_URL, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        addLog('✅ Socket connected successfully');
        setConnectionStatus('Connected');
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        addLog(`❌ Socket connection error: ${err.message}`);
        setConnectionStatus('Connection Error');
        setError(err.message);
      });

      newSocket.on('disconnect', (reason) => {
        addLog(`🔌 Socket disconnected: ${reason}`);
        setConnectionStatus('Disconnected');
      });

      newSocket.on('error', (err) => {
        addLog(`❌ Socket error: ${err}`);
        setError(err.toString());
      });

      // Store socket reference
      setSocket(newSocket);

      // Attempt connection
      addLog('Attempting to connect...');
      newSocket.connect();

    } catch (err) {
      addLog(`❌ Failed to create socket: ${err}`);
      setConnectionStatus('Creation Failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testSocketWithAuth = () => {
    if (!user?.token) {
      addLog('❌ No authentication token available');
      return;
    }

    addLog('Testing Socket.IO connection with authentication...');
    setConnectionStatus('Connecting with Auth...');
    setError(null);

    try {
      const newSocket = io(env.SOCKET_URL, {
        autoConnect: false,
        auth: { token: user.token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      newSocket.on('connect', () => {
        addLog('✅ Authenticated socket connected successfully');
        setConnectionStatus('Authenticated Connected');
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        addLog(`❌ Authenticated socket connection error: ${err.message}`);
        setConnectionStatus('Auth Connection Error');
        setError(err.message);
      });

      newSocket.on('disconnect', (reason) => {
        addLog(`🔌 Authenticated socket disconnected: ${reason}`);
        setConnectionStatus('Auth Disconnected');
      });

      setSocket(newSocket);
      newSocket.connect();

    } catch (err) {
      addLog(`❌ Failed to create authenticated socket: ${err}`);
      setConnectionStatus('Auth Creation Failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      addLog('🔌 Socket disconnected manually');
      setConnectionStatus('Manually Disconnected');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog(`Frontend running on: ${window.location.origin}`);
    addLog(`Socket URL: ${env.SOCKET_URL}`);
    addLog(`API URL: ${env.API_BASE_URL}`);
    addLog(`Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    addLog(`Has token: ${user?.token ? 'Yes' : 'No'}`);
  }, [isAuthenticated, user]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-lg max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Socket Connection Test</h3>
        <button
          onClick={clearLogs}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear Logs
        </button>
      </div>

      {/* Status Display */}
      <div className="mb-4 p-2 bg-muted rounded text-xs">
        <div><strong>Status:</strong> {connectionStatus}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testBasicConnection}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test HTTP
        </button>
        <button
          onClick={testSocketConnection}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Socket
        </button>
        <button
          onClick={testSocketWithAuth}
          disabled={!user?.token}
          className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Auth Socket
        </button>
        <button
          onClick={disconnect}
          disabled={!socket}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>

      {/* Logs */}
      <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="p-1 bg-muted/50 rounded">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
