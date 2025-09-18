import { useCallback, useState } from 'react';
import { useAISocket } from './useAISocket';
import { useToast } from './useToast';

/**
 * Simplified AI hook for common AI operations
 */
export function useAI() {
  const aiSocket = useAISocket();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(false);

  // Generate board with simplified interface
  const generateBoard = useCallback(async (
    prompt: string,
    options: {
      includeChecklists?: boolean;
      includeTags?: boolean;
      maxTokens?: number;
    } = {}
  ) => {
    try {
      setIsLoading(true);
      const result = await aiSocket.generateBoard(prompt, {
        includeChecklists: true,
        includeTags: true,
        moderateContent: true,
        ...options
      });
      
      toast.success('Board generated successfully!', 'AI Generation');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate board';
      toast.error(errorMessage, 'AI Generation Error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [aiSocket, toast]);

  // Auto-complete prompt with simplified interface
  const autoComplete = useCallback(async (
    partialPrompt: string,
    context?: {
      category?: string;
      teamSize?: 'small' | 'medium' | 'large';
    }
  ) => {
    try {
      const result = await aiSocket.autoCompletePrompt(partialPrompt, context);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-completion failed';
      toast.error(errorMessage, 'Auto-completion Error');
      throw error;
    }
  }, [aiSocket, toast]);

  // Get smart suggestions
  const getSuggestions = useCallback(async (input: string) => {
    try {
      const result = await aiSocket.getSmartSuggestions(input, 'board');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get suggestions';
      toast.error(errorMessage, 'Suggestions Error');
      throw error;
    }
  }, [aiSocket, toast]);

  // Get quick templates
  const getTemplates = useCallback(async (category: string = 'general') => {
    try {
      const result = await aiSocket.getQuickTemplates(category, 5);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get templates';
      toast.error(errorMessage, 'Templates Error');
      throw error;
    }
  }, [aiSocket, toast]);

  // Moderate content
  const moderate = useCallback(async (text: string) => {
    try {
      const result = await aiSocket.moderateContent(text);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content moderation failed';
      toast.error(errorMessage, 'Moderation Error');
      throw error;
    }
  }, [aiSocket, toast]);

  // Check if AI is available
  const isAvailable = aiSocket.isConnected;

  return {
    // Status
    isLoading,
    isAvailable,
    
    // Functions
    generateBoard,
    autoComplete,
    getSuggestions,
    getTemplates,
    moderate,
  };
}
