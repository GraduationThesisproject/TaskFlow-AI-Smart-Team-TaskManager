import { env } from '../config/env';

/**
 * Test socket connection to the backend
 * This utility helps debug connection issues
 */
export async function testSocketConnection(token?: string): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log('🔍 Testing socket connection...');
    console.log('📍 Socket URL:', env.SOCKET_URL);
    console.log('🔑 Has token:', !!token);

    // Test basic connectivity first
    const response = await fetch(`${env.SOCKET_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Backend server not responding: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }

    // Test WebSocket connection
    return new Promise((resolve) => {
      const ws = new WebSocket(`${env.SOCKET_URL.replace('http://', 'ws://').replace('https://', 'wss://')}${token ? `?token=${token}` : ''}`);
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          success: false,
          error: 'WebSocket connection timeout',
          details: { timeout: 5000 }
        });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          success: true,
          details: { protocol: ws.protocol, readyState: ws.readyState }
        });
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: 'WebSocket connection failed',
          details: { error }
        });
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          resolve({
            success: false,
            error: `WebSocket closed unexpectedly: ${event.code} ${event.reason}`,
            details: { code: event.code, reason: event.reason }
          });
        }
      };
    });

  } catch (error) {
    return {
      success: false,
      error: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    };
  }
}

/**
 * Check if the backend server is running
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${env.SOCKET_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get connection troubleshooting tips
 */
export function getConnectionTips(): string[] {
  return [
    'Ensure the backend server is running on port 3001',
    'Check if the backend server has CORS properly configured',
    'Verify the SOCKET_URL environment variable is correct',
    'Check browser console for CORS or network errors',
    'Ensure the authentication token is valid',
    'Try refreshing the page to reinitialize the connection',
    'Check if any firewall or proxy is blocking WebSocket connections'
  ];
}
