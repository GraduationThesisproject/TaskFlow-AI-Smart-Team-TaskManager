import React from 'react';
import { useSocketConnection } from '../../contexts/SocketContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import type { SocketStatusIndicatorProps } from '../../types/interfaces/ui';

export function SocketStatusIndicator({ showDetails = false, className = '' }: SocketStatusIndicatorProps) {
  const { isConnected, isConnecting, error, reconnect, connectionStatus } = useSocketConnection();

  const getStatusColor = () => {
    if (isConnected) return 'text-green-500';
    if (isConnecting) return 'text-yellow-500';
    if (error) return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="w-4 h-4" />;
    if (isConnecting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    if (error) return 'Disconnected';
    return 'Offline';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        {showDetails && (
          <span className="text-sm font-medium">
            {getStatusText()}
          </span>
        )}
      </div>
      
      {error && showDetails && (
        <button
          onClick={reconnect}
          className="text-xs text-blue-500 hover:text-blue-600 underline"
          title="Click to reconnect"
        >
          Reconnect
        </button>
      )}
      
      {showDetails && (
        <div className="text-xs text-gray-500">
          {connectionStatus}
        </div>
      )}
    </div>
  );
}

// Compact version for headers/navbars
export function SocketStatusDot({ className = '' }: { className?: string }) {
  const { isConnected, isConnecting, error } = useSocketConnection();
  
  const getDotColor = () => {
    if (isConnected) return 'bg-green-500';
    if (isConnecting) return 'bg-yellow-500';
    if (error) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div
      className={`w-2 h-2 rounded-full ${getDotColor()} ${className}`}
      title={isConnected ? 'Socket Connected' : isConnecting ? 'Socket Connecting' : 'Socket Disconnected'}
    />
  );
}
