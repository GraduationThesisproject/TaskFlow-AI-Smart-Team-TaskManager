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
      const newSocket = io(env.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      newSocket.on('connect', () => {
        addLog('✅ Socket connection successful');
        setConnectionStatus('Connected');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (err) => {
        addLog(`❌ Socket connection error: ${err.message}`);
        setConnectionStatus('Connection Error');
        setError(err.message);
      });

      newSocket.on('disconnect', () => {
        addLog('🔌 Socket disconnected');
        setConnectionStatus('Disconnected');
      });

    } catch (err) {
      addLog(`❌ Socket setup error: ${err}`);
      setConnectionStatus('Setup Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testAuthSocketConnection = () => {
    addLog('Testing authenticated Socket.IO connection...');
    setConnectionStatus('Connecting with auth...');
    setError(null);

    if (!user?.token) {
      addLog('❌ No authentication token available');
      setConnectionStatus('No Token');
      setError('Authentication required');
      return;
    }

    try {
      const newSocket = io(env.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        auth: {
          token: user.token
        }
      });

      newSocket.on('connect', () => {
        addLog('✅ Authenticated socket connection successful');
        setConnectionStatus('Auth Connected');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (err) => {
        addLog(`❌ Authenticated socket connection error: ${err.message}`);
        setConnectionStatus('Auth Error');
        setError(err.message);
      });

      newSocket.on('disconnect', () => {
        addLog('🔌 Authenticated socket disconnected');
        setConnectionStatus('Auth Disconnected');
      });

    } catch (err) {
      addLog(`❌ Authenticated socket setup error: ${err}`);
      setConnectionStatus('Auth Setup Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      addLog('🔌 Manually disconnected');
      setConnectionStatus('Disconnected');
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

  // return (
  //   <div className="fixed top-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-lg max-h-96 overflow-y-auto">
  //     <div className="flex items-center justify-between mb-4">
  //       <h3 className="font-semibold text-sm">Socket Connection Test</h3>
  //       <button
  //         onClick={clearLogs}
  //         className="text-xs text-muted-foreground hover:text-foreground"
  //       >
  //         Clear Logs
  //       </button>
  //     </div>

  //     {/* Status Display */}
  //     <div className="mb-4 p-2 bg-muted rounded text-xs">
  //       <div><strong>Status:</strong> {connectionStatus}</div>
  //       <div><strong>Error:</strong> {error || 'None'}</div>
  //     </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testBasicConnection}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test HTTP
        </button>
        <button
          onClick={testSocketConnection}
          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Socket
        </button>
        <button
          onClick={testAuthSocketConnection}
          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Auth Socket
        </button>
        <button
          onClick={disconnect}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
