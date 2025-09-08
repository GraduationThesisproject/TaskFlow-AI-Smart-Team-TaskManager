import { useEffect, useState, useCallback } from 'react';
import { useSystemSocket } from '../../contexts/SocketContext';

interface SystemMetrics {
  cpu: {
    usage: number;
    load: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  version: string;
  lastBackup?: string;
  maintenanceMode: boolean;
  errors: string[];
  warnings: string[];
}

export const useSystemMonitoring = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const systemSocket = useSystemSocket();
  const socket = systemSocket;
  const isConnected = socket?.connected || false;
  const emit = (event: string, data?: any) => socket?.emit(event, data);
  const on = (event: string, callback: (data?: any) => void) => socket?.on(event, callback);
  const off = (event: string) => socket?.off(event);

  // Request system health check
  const requestHealthCheck = useCallback(() => {
    if (isConnected) {
      emit('system:health-check', {});
    }
  }, [isConnected, emit]);

  // Request system metrics
  const requestMetrics = useCallback((metricTypes: string[] = ['cpu', 'memory', 'disk']) => {
    if (isConnected) {
      emit('system:get-metrics', { metrics: metricTypes });
    }
  }, [isConnected, emit]);

  // Toggle maintenance mode
  const toggleMaintenanceMode = useCallback((enabled: boolean) => {
    if (isConnected) {
      emit('system:maintenance-mode', { enabled });
    }
  }, [isConnected, emit]);

  // Initiate system backup
  const initiateBackup = useCallback(() => {
    if (isConnected) {
      emit('system:backup', {});
    }
  }, [isConnected, emit]);

  // Schedule system restart
  const scheduleRestart = useCallback((delay: number = 0) => {
    if (isConnected) {
      emit('system:restart', { delay });
    }
  }, [isConnected, emit]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleHealthStatus = (data: SystemHealth) => {
      setHealth(data);
    };

    const handleMetrics = (data: SystemMetrics) => {
      setMetrics(data);
    };

    const handleStatus = (data: SystemHealth) => {
      setHealth(data);
    };

    const handleError = (error: { message: string }) => {
      console.error('System socket error:', error.message);
    };

    // Register event listeners
    on('system:health-status', handleHealthStatus);
    on('system:metrics', handleMetrics);
    on('system:status', handleStatus);
    on('error', handleError);

    // Cleanup
    return () => {
      off('system:health-status');
      off('system:metrics');
      off('system:status');
      off('error');
    };
  }, [socket, on, off]);

  // Start monitoring when connected
  useEffect(() => {
    if (isConnected) {
      setIsMonitoring(true);
      // Request initial data
      requestHealthCheck();
      requestMetrics();
    } else {
      setIsMonitoring(false);
    }
  }, [isConnected, requestHealthCheck, requestMetrics]);

  return {
    // Connection status
    isConnected,
    isMonitoring,
    
    // Data
    metrics,
    health,
    
    // Actions
    requestHealthCheck,
    requestMetrics,
    toggleMaintenanceMode,
    initiateBackup,
    scheduleRestart,
  };
};
