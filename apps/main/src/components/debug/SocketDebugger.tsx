import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';

export function SocketDebugger() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[SocketDebugger] ${message}`);
  };

  const testBasicConnection = async () => {
    addLog('Testing basic HTTP connection...');
    try {
      const response = await fetch(`${env.SOCKET_URL}/health`);
      if (response.ok) {
        addLog('✅ HTTP connection successful');
        setTestResults(prev => ({ ...prev, http: 'success' }));
      } else {
        addLog(`❌ HTTP connection failed: ${response.status}`);
        setTestResults(prev => ({ ...prev, http: 'failed' }));
      }
    } catch (err) {
      addLog(`❌ HTTP connection error: ${err}`);
      setTestResults(prev => ({ ...prev, http: 'error' }));
    }
  };

  const testSocketConnection = () => {
    addLog('Testing Socket.IO connection to test namespace...');
    setConnectionStatus('Connecting...');
    setError(null);

    try {
      // Create a new socket connection to test namespace (no auth required)
      const newSocket = io(`${env.SOCKET_URL}/test`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        addLog('✅ Socket connection successful');
        addLog(`Socket ID: ${newSocket.id}`);
        setConnectionStatus('Connected');
        setSocket(newSocket);
        setTestResults(prev => ({ ...prev, socket: 'success' }));
        
        // Test ping/pong
        addLog('Testing ping/pong...');
        newSocket.emit('ping');
      });
      
      newSocket.on('pong', (data) => {
        addLog(`✅ Ping/pong successful: ${data.message}`);
        setTestResults(prev => ({ ...prev, pingPong: 'success' }));
      });

      newSocket.on('connect_error', (err) => {
        addLog(`❌ Socket connection error: ${err.message}`);
        setConnectionStatus('Connection Error');
        setError(err.message);
        setTestResults(prev => ({ ...prev, socket: 'error' }));
      });

      newSocket.on('disconnect', (reason) => {
        addLog(`🔌 Socket disconnected: ${reason}`);
        setConnectionStatus('Disconnected');
        setTestResults(prev => ({ ...prev, socket: 'disconnected' }));
      });

      newSocket.on('error', (err) => {
        addLog(`❌ Socket error: ${err}`);
        setError(err.toString());
      });

      // Set connection timeout
      setTimeout(() => {
        if (!newSocket.connected) {
          addLog('⏰ Connection timeout');
          setConnectionStatus('Timeout');
          setError('Connection timeout');
          setTestResults(prev => ({ ...prev, socket: 'timeout' }));
        }
      }, 10000);

    } catch (err) {
      addLog(`❌ Socket setup error: ${err}`);
      setConnectionStatus('Setup Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTestResults(prev => ({ ...prev, socket: 'setup_error' }));
    }
  };

  const testAuthenticatedSocket = () => {
    addLog('Testing authenticated Socket.IO connection...');
    
    // Get token from localStorage (for testing)
    const token = localStorage.getItem('token') || 'test-token';
    addLog(`Using token: ${token ? 'Present' : 'Missing'}`);

    try {
      const authSocket = io(env.SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
      });

      authSocket.on('connect', () => {
        addLog('✅ Authenticated socket connected');
        addLog(`Socket ID: ${authSocket.id}`);
        setTestResults(prev => ({ ...prev, authSocket: 'success' }));
      });

      authSocket.on('connect_error', (err) => {
        addLog(`❌ Authenticated socket error: ${err.message}`);
        setTestResults(prev => ({ ...prev, authSocket: 'error' }));
      });

      authSocket.on('disconnect', (reason) => {
        addLog(`🔌 Authenticated socket disconnected: ${reason}`);
        setTestResults(prev => ({ ...prev, authSocket: 'disconnected' }));
      });

    } catch (err) {
      addLog(`❌ Authenticated socket setup error: ${err}`);
      setTestResults(prev => ({ ...prev, authSocket: 'setup_error' }));
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnectionStatus('Disconnected');
      addLog('🔌 Socket manually disconnected');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults({});
  };

  useEffect(() => {
    addLog(`🔍 Socket Debugger initialized`);
    addLog(`📍 Socket URL: ${env.SOCKET_URL}`);
    addLog(`🌐 Environment: ${env.NODE_ENV}`);
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Socket Connection Debugger</h2>
      
      {/* Connection Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Connection Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Socket URL:</strong> {env.SOCKET_URL}
          </div>
          <div>
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'Connecting...' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </span>
          </div>
          <div>
            <strong>Environment:</strong> {env.NODE_ENV}
          </div>
          <div>
            <strong>Socket ID:</strong> {socket?.id || 'N/A'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={testBasicConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test HTTP
        </button>
        <button
          onClick={testSocketConnection}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Socket
        </button>
        <button
          onClick={testAuthenticatedSocket}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Auth Socket
        </button>
        <button
          onClick={disconnectSocket}
          disabled={!socket}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Disconnect
        </button>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test}>
                <strong>{test}:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  result === 'success' ? 'bg-green-100 text-green-800' :
                  result === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Logs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Run a test to see connection details.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
