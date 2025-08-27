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
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={checkHealth}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Health Check
        </button>
        
        {error && (
          <button
            onClick={reconnect}
            className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`text-xs p-2 rounded mb-3 ${
          testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className="flex items-center gap-1 mb-1">
            {testResult.success ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            <span className="font-medium">
              {testResult.success ? 'Test Passed' : 'Test Failed'}
            </span>
          </div>
          {testResult.error && <div>{testResult.error}</div>}
          {testResult.details && (
            <details className="mt-1">
              <summary className="cursor-pointer">Details</summary>
              <pre className="mt-1 text-xs overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>
            <strong>Socket URL:</strong> {env.SOCKET_URL}
          </div>
          <div>
            <strong>API URL:</strong> {env.API_BASE_URL}
          </div>
                                  <div>
              <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Environment:</strong> {env.NODE_ENV}
            </div>
            <div>
              <strong>Last Connection Attempt:</strong> {connectionDetails?.lastAttempt ? connectionDetails.lastAttempt.toLocaleTimeString() : 'Never'}
            </div>
            <div>
              <strong>Connection Details:</strong>
              <div className="ml-2 mt-1">
                <div>• URL: {connectionDetails?.url || 'N/A'}</div>
                <div>• Has Token: {connectionDetails?.hasToken ? 'Yes' : 'No'}</div>
                <div>• Auth Status: {connectionDetails?.authStatus || 'N/A'}</div>
                <div>• Is Ready: {connectionDetails?.isReady ? 'Yes' : 'No'}</div>
              </div>
            </div>
        </div>
      )}

      {/* Troubleshooting Tips */}
      {showDetails && (
        <div className="mt-3">
          <div className="flex items-center gap-1 mb-2 text-xs font-medium">
            <Info className="w-3 h-3" />
            Troubleshooting Tips
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground">
            {tips.slice(0, 3).map((tip, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-blue-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
