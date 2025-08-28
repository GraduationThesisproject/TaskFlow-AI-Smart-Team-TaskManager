import React, { useState } from 'react';
import { useSocketConnection } from '../../contexts/SocketContext';
import { testSocketConnection, checkBackendHealth, getConnectionTips } from '../../utils/socketTest';
import { env } from '../../config/env';
import { useAuth } from '../../hooks/useAuth';
import { Bug, TestTube, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function SocketDebugger() {
  const { isConnected, isConnecting, error, reconnect, connectionStatus, connectionDetails } = useSocketConnection();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testSocketConnection(token || undefined);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        error: `Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const checkHealth = async () => {
    const isHealthy = await checkBackendHealth();
    setTestResult({
      success: isHealthy,
      error: isHealthy ? undefined : 'Backend server is not responding',
      details: { healthCheck: isHealthy }
    });
  };

  const tips = getConnectionTips();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-sm">Socket Debugger</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Connection Status */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className={isConnected ? 'text-green-600' : isConnecting ? 'text-yellow-600' : 'text-red-600'}>
            {connectionStatus}
          </span>
        </div>
        
        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={runConnectionTest}
          disabled={isTesting}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <TestTube className="w-3 h-3" />
          {isTesting ? 'Testing...' : 'Test'}
        </button>
        
        <button
          onClick={checkHealth}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          <CheckCircle className="w-3 h-3" />
          Health
        </button>
        
        <button
          onClick={reconnect}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          <Info className="w-3 h-3" />
          Reconnect
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="mb-3 p-2 bg-muted rounded text-xs">
          <div className="flex items-center gap-1 mb-1">
            {testResult.success ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span className="font-medium">
              {testResult.success ? 'Test Passed' : 'Test Failed'}
            </span>
          </div>
          {testResult.error && (
            <div className="text-red-600">{testResult.error}</div>
          )}
          {testResult.details && (
            <div className="mt-1 text-muted-foreground">
              <pre className="text-xs">{JSON.stringify(testResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Connection Details */}
      {showDetails && (
        <div className="space-y-2 text-xs">
          <div><strong>URL:</strong> {connectionDetails.url}</div>
          <div><strong>Has Token:</strong> {connectionDetails.hasToken ? 'Yes' : 'No'}</div>
          <div><strong>Auth Status:</strong> {connectionDetails.authStatus}</div>
          <div><strong>Ready:</strong> {connectionDetails.isReady ? 'Yes' : 'No'}</div>
          {connectionDetails.lastAttempt && (
            <div><strong>Last Attempt:</strong> {connectionDetails.lastAttempt.toLocaleTimeString()}</div>
          )}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
          <div className="font-medium text-blue-800 mb-1">Connection Tips:</div>
          <ul className="space-y-1 text-blue-700">
            {tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
