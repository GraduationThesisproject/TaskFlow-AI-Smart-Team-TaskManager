import { useState, useEffect, useCallback } from 'react';
import aiTokenService, { AiToken, CreateAiTokenData, AiTokenStats } from '../services/aiTokenService';

interface UseAiTokensOptions {
  autoLoad?: boolean;
  filters?: {
    provider?: string;
    status?: string;
    includeArchived?: boolean;
  };
}

interface UseAiTokensReturn {
  // State
  tokens: AiToken[];
  loading: boolean;
  error: string | null;
  stats: AiTokenStats[];
  
  // Actions
  loadTokens: () => Promise<void>;
  createToken: (tokenData: CreateAiTokenData) => Promise<boolean>;
  updateToken: (tokenId: string, updateData: Partial<CreateAiTokenData>) => Promise<boolean>;
  activateToken: (tokenId: string) => Promise<boolean>;
  archiveToken: (tokenId: string) => Promise<boolean>;
  deleteToken: (tokenId: string) => Promise<boolean>;
  testToken: (tokenId: string) => Promise<boolean>;
  loadStats: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  getActiveToken: (provider?: string) => AiToken | null;
  getTokensByProvider: (provider: string) => AiToken[];
  getTokensByStatus: (status: string) => AiToken[];
}

export const useAiTokens = (options: UseAiTokensOptions = {}): UseAiTokensReturn => {
  const { autoLoad = true, filters = {} } = options;
  
  // State
  const [tokens, setTokens] = useState<AiToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AiTokenStats[]>([]);

  // Load tokens
  const loadTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiTokenService.getTokens(filters);
      
      if (response.success) {
        setTokens(response.tokens || []);
      } else {
        setError(response.message || 'Failed to load AI tokens');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load AI tokens';
      setError(errorMessage);
      console.error('Error loading AI tokens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create token
  const createToken = useCallback(async (tokenData: CreateAiTokenData): Promise<boolean> => {
    try {
      setError(null);
      
      // Validate form data
      const validation = aiTokenService.validateTokenForm(tokenData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return false;
      }
      
      const response = await aiTokenService.createToken(tokenData);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to create AI token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create AI token';
      setError(errorMessage);
      console.error('Error creating AI token:', err);
      return false;
    }
  }, [loadTokens]);

  // Update token
  const updateToken = useCallback(async (tokenId: string, updateData: Partial<CreateAiTokenData>): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await aiTokenService.updateToken(tokenId, updateData);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to update AI token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update AI token';
      setError(errorMessage);
      console.error('Error updating AI token:', err);
      return false;
    }
  }, [loadTokens]);

  // Activate token
  const activateToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await aiTokenService.activateToken(tokenId);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to activate token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate token';
      setError(errorMessage);
      console.error('Error activating token:', err);
      return false;
    }
  }, [loadTokens]);

  // Archive token
  const archiveToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await aiTokenService.archiveToken(tokenId);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to archive token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive token';
      setError(errorMessage);
      console.error('Error archiving token:', err);
      return false;
    }
  }, [loadTokens]);

  // Delete token
  const deleteToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await aiTokenService.deleteToken(tokenId);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete token');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete token';
      setError(errorMessage);
      console.error('Error deleting token:', err);
      return false;
    }
  }, [loadTokens]);

  // Test token
  const testToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await aiTokenService.testToken(tokenId);
      
      if (response.success) {
        await loadTokens(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Token test failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test token';
      setError(errorMessage);
      console.error('Error testing token:', err);
      return false;
    }
  }, [loadTokens]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await aiTokenService.getTokenStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error loading token stats:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utility functions
  const getActiveToken = useCallback((provider: string = 'google'): AiToken | null => {
    return tokens.find(token => token.provider === provider && token.isActive && !token.isArchived) || null;
  }, [tokens]);

  const getTokensByProvider = useCallback((provider: string): AiToken[] => {
    return tokens.filter(token => token.provider === provider);
  }, [tokens]);

  const getTokensByStatus = useCallback((status: string): AiToken[] => {
    return tokens.filter(token => token.status === status);
  }, [tokens]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadTokens();
    }
  }, [autoLoad]);

  return {
    // State
    tokens,
    loading,
    error,
    stats,
    
    // Actions
    loadTokens,
    createToken,
    updateToken,
    activateToken,
    archiveToken,
    deleteToken,
    testToken,
    loadStats,
    
    // Utilities
    clearError,
    getActiveToken,
    getTokensByProvider,
    getTokensByStatus,
  };
};

export default useAiTokens;
