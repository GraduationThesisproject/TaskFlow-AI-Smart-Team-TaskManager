import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';

export interface UserSession {
  deviceId: string;
  deviceInfo: {
    type: 'web' | 'mobile' | 'desktop';
    os?: string;
    browser?: string;
  };
  ipAddress: string;
  loginAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

interface UseSessionsReturn {
  sessions: UserSession[];
  isLoading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  endAllSessions: () => Promise<void>;
}

export const useSessions = (): UseSessionsReturn => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get or generate current device ID (consistent with login)
      let currentDeviceId = localStorage.getItem('deviceId');
      if (!currentDeviceId) {
        currentDeviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', currentDeviceId);
      }
      
      const response = await AuthService.getSessions(currentDeviceId);
      
      if (response.success && response.data) {
        setSessions(response.data.sessions || []);
      } else {
        throw new Error(response.message || 'Failed to fetch sessions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      await AuthService.endSession(sessionId);
      
      // Refresh sessions list after ending a session
      await fetchSessions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to end session';
      setError(errorMessage);
      console.error('Error ending session:', err);
    }
  }, [fetchSessions]);

  const endAllSessions = useCallback(async () => {
    try {
      setError(null);
      // End all sessions except current one
      const otherSessions = sessions.filter(session => !session.isCurrent);
      
      await Promise.all(
        otherSessions.map(session => AuthService.endSession(session.deviceId))
      );
      
      // Refresh sessions list
      await fetchSessions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to end all sessions';
      setError(errorMessage);
      console.error('Error ending all sessions:', err);
    }
  }, [sessions, fetchSessions]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    endSession,
    endAllSessions,
  };
};
