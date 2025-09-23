import { useCallback, useEffect, useState } from 'react';
import { useAISocket as useAISocketContext } from '../contexts/SocketContext';
import { useToast } from './useToast';

// Types for AI socket functionality
export interface AISocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface BoardGenerationOptions {
  maxTokens?: number;
  includeChecklists?: boolean;
  includeTags?: boolean;
  moderateContent?: boolean;
}

export interface AutoCompleteContext {
  category?: string;
  teamSize?: 'small' | 'medium' | 'large';
  industry?: string;
  urgency?: 'low' | 'medium' | 'high';
  previousBoards?: string[];
}

export interface BoardGenerationResult {
  board: {
    name: string;
    description: string;
    type: 'kanban' | 'list' | 'calendar' | 'timeline';
    visibility: 'private' | 'workspace' | 'public';
    settings: {
      allowComments: boolean;
      allowAttachments: boolean;
      allowTimeTracking: boolean;
      defaultTaskPriority: 'low' | 'medium' | 'high' | 'critical';
      autoArchive: boolean;
      archiveAfterDays: number;
    };
  };
  columns: Array<{
    name: string;
    position: number;
    color: string;
    backgroundColor: string;
    limit: number | null;
    settings: {
      wipLimit: {
        enabled: boolean;
        limit: number | null;
        strictMode: boolean;
      };
      sorting: {
        method: 'manual' | 'priority' | 'due_date' | 'created_date' | 'alphabetical';
        direction: 'asc' | 'desc';
        autoSort: boolean;
      };
    };
    style: {
      color: string;
      backgroundColor: string;
      icon: string | null;
    };
  }>;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    color: string;
    assignees: string[];
    tags: string[];
    dueDate: string | null;
    estimatedHours: number | null;
    position: number;
    column: string;
  }>;
  tags: Array<{
    name: string;
    color: string;
    textColor: string;
    category: 'priority' | 'status' | 'type' | 'department' | 'custom';
    description: string;
    scope: 'board';
  }>;
  checklists: Array<{
    title: string;
    items: Array<{
      text: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      position: number;
      estimatedMinutes: number | null;
    }>;
  }>;
}

export interface AutoCompleteSuggestion {
  prompt: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTasks: number;
  estimatedColumns: number;
}

export interface AutoCompleteResult {
  suggestions: AutoCompleteSuggestion[];
  keywords: string[];
  categories: string[];
}

export interface SmartSuggestionsResult {
  boardTypes: Array<{
    type: 'kanban' | 'list' | 'calendar' | 'timeline';
    name: string;
    description: string;
    icon: string;
  }>;
  templates: Array<{
    name: string;
    description: string;
    category: string;
    complexity: 'simple' | 'medium' | 'complex';
    estimatedTime: string;
  }>;
  features: Array<{
    feature: string;
    description: string;
    recommended: boolean;
  }>;
  columns: Array<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>;
  tags: Array<{
    name: string;
    color: string;
    category: 'priority' | 'status' | 'type' | 'department' | 'custom';
  }>;
}

export interface QuickTemplate {
  name: string;
  description: string;
  category: string;
  boardType: 'kanban' | 'list' | 'calendar' | 'timeline';
  prompt: string;
  columns: Array<{
    name: string;
    color: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    color: string;
    category: 'priority' | 'status' | 'type' | 'department' | 'custom';
  }>;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTasks: number;
  estimatedTime: string;
}

export interface ImprovementSuggestion {
  workflow: Array<{
    suggestion: string;
    reason: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  columns: Array<{
    columnName: string;
    suggestions: string[];
  }>;
  tasks: Array<{
    suggestion: string;
    reason: string;
  }>;
  tags: Array<{
    suggestion: string;
    reason: string;
  }>;
  settings: Array<{
    setting: string;
    suggestion: string;
    reason: string;
  }>;
}

export interface ContentModerationResult {
  flagged: boolean;
  categories: string[];
  confidence: number;
  reason: string;
}

export interface ModelInfo {
  available: boolean;
  models: {
    boardGenerator: string;
    promptAnalyzer: string;
    contentModerator: string;
  };
  features: string[];
}

/**
 * Custom hook for AI socket functionality
 */
export function useAISocket() {
  const aiSocket = useAISocketContext();
  const toast = useToast();
  
  // State for tracking operations
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [isGettingTemplates, setIsGettingTemplates] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  // Generate board using AI pipeline
  const generateBoard = useCallback((
    prompt: string, 
    options: BoardGenerationOptions = {}
  ): Promise<BoardGenerationResult> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      setIsGenerating(true);

      const handleSuccess = (response: AISocketResponse<BoardGenerationResult>) => {
        setIsGenerating(false);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Board generation failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        setIsGenerating(false);
        reject(new Error(response.error || 'Board generation failed'));
      };

      // Set up one-time listeners
      aiSocket.on('board_generated', handleSuccess);
      aiSocket.on('board_generation_error', handleError);

      // Emit the request
      aiSocket.emit('generate_board', { prompt, options });

      // Cleanup listeners after 30 seconds
      setTimeout(() => {
        aiSocket.off('board_generated', handleSuccess);
        aiSocket.off('board_generation_error', handleError);
        if (isGenerating) {
          setIsGenerating(false);
          reject(new Error('Board generation timeout'));
        }
      }, 30000);
    });
  }, [aiSocket, isGenerating]);

  // Auto-complete user prompts
  const autoCompletePrompt = useCallback((
    partialPrompt: string,
    context: AutoCompleteContext = {}
  ): Promise<AutoCompleteResult> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      setIsAutoCompleting(true);

      const handleSuccess = (response: AISocketResponse<AutoCompleteResult>) => {
        setIsAutoCompleting(false);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Auto-completion failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        setIsAutoCompleting(false);
        reject(new Error(response.error || 'Auto-completion failed'));
      };

      // Set up one-time listeners
      aiSocket.on('auto_complete_suggestions', handleSuccess);
      aiSocket.on('auto_complete_error', handleError);

      // Emit the request
      aiSocket.emit('auto_complete_prompt', { partialPrompt, context });

      // Cleanup listeners after 10 seconds
      setTimeout(() => {
        aiSocket.off('auto_complete_suggestions', handleSuccess);
        aiSocket.off('auto_complete_error', handleError);
        if (isAutoCompleting) {
          setIsAutoCompleting(false);
          reject(new Error('Auto-completion timeout'));
        }
      }, 10000);
    });
  }, [aiSocket, isAutoCompleting]);

  // Get smart suggestions
  const getSmartSuggestions = useCallback((
    input: string,
    type: 'board' | 'task' | 'column' = 'board'
  ): Promise<SmartSuggestionsResult> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      setIsGettingSuggestions(true);

      const handleSuccess = (response: AISocketResponse<SmartSuggestionsResult>) => {
        setIsGettingSuggestions(false);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Smart suggestions failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        setIsGettingSuggestions(false);
        reject(new Error(response.error || 'Smart suggestions failed'));
      };

      // Set up one-time listeners
      aiSocket.on('smart_suggestions', handleSuccess);
      aiSocket.on('smart_suggestions_error', handleError);

      // Emit the request
      aiSocket.emit('get_smart_suggestions', { input, type });

      // Cleanup listeners after 10 seconds
      setTimeout(() => {
        aiSocket.off('smart_suggestions', handleSuccess);
        aiSocket.off('smart_suggestions_error', handleError);
        if (isGettingSuggestions) {
          setIsGettingSuggestions(false);
          reject(new Error('Smart suggestions timeout'));
        }
      }, 10000);
    });
  }, [aiSocket, isGettingSuggestions]);

  // Get quick templates
  const getQuickTemplates = useCallback((
    category: string = 'general',
    count: number = 5
  ): Promise<QuickTemplate[]> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      setIsGettingTemplates(true);

      const handleSuccess = (response: AISocketResponse<QuickTemplate[]>) => {
        setIsGettingTemplates(false);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Quick templates failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        setIsGettingTemplates(false);
        reject(new Error(response.error || 'Quick templates failed'));
      };

      // Set up one-time listeners
      aiSocket.on('quick_templates', handleSuccess);
      aiSocket.on('quick_templates_error', handleError);

      // Emit the request
      aiSocket.emit('get_quick_templates', { category, count });

      // Cleanup listeners after 10 seconds
      setTimeout(() => {
        aiSocket.off('quick_templates', handleSuccess);
        aiSocket.off('quick_templates_error', handleError);
        if (isGettingTemplates) {
          setIsGettingTemplates(false);
          reject(new Error('Quick templates timeout'));
        }
      }, 10000);
    });
  }, [aiSocket, isGettingTemplates]);

  // Generate additional tasks for existing board
  const generateAdditionalTasks = useCallback((
    boardId: string,
    columnName: string,
    count: number = 3
  ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      const handleSuccess = (response: AISocketResponse<any[]>) => {
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Additional tasks generation failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        reject(new Error(response.error || 'Additional tasks generation failed'));
      };

      // Set up one-time listeners
      aiSocket.on('additional_tasks_generated', handleSuccess);
      aiSocket.on('additional_tasks_error', handleError);

      // Emit the request
      aiSocket.emit('generate_additional_tasks', { boardId, columnName, count });

      // Cleanup listeners after 15 seconds
      setTimeout(() => {
        aiSocket.off('additional_tasks_generated', handleSuccess);
        aiSocket.off('additional_tasks_error', handleError);
      }, 15000);
    });
  }, [aiSocket]);

  // Get board improvement suggestions
  const getImprovementSuggestions = useCallback((
    boardId: string
  ): Promise<ImprovementSuggestion> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      const handleSuccess = (response: AISocketResponse<ImprovementSuggestion>) => {
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Improvement suggestions failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        reject(new Error(response.error || 'Improvement suggestions failed'));
      };

      // Set up one-time listeners
      aiSocket.on('improvement_suggestions', handleSuccess);
      aiSocket.on('improvement_suggestions_error', handleError);

      // Emit the request
      aiSocket.emit('get_improvement_suggestions', { boardId });

      // Cleanup listeners after 15 seconds
      setTimeout(() => {
        aiSocket.off('improvement_suggestions', handleSuccess);
        aiSocket.off('improvement_suggestions_error', handleError);
      }, 15000);
    });
  }, [aiSocket]);

  // Moderate content
  const moderateContent = useCallback((
    text: string
  ): Promise<ContentModerationResult> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      setIsModerating(true);

      const handleSuccess = (response: AISocketResponse<ContentModerationResult>) => {
        setIsModerating(false);
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Content moderation failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        setIsModerating(false);
        reject(new Error(response.error || 'Content moderation failed'));
      };

      // Set up one-time listeners
      aiSocket.on('content_moderated', handleSuccess);
      aiSocket.on('content_moderation_error', handleError);

      // Emit the request
      aiSocket.emit('moderate_content', { text });

      // Cleanup listeners after 10 seconds
      setTimeout(() => {
        aiSocket.off('content_moderated', handleSuccess);
        aiSocket.off('content_moderation_error', handleError);
        if (isModerating) {
          setIsModerating(false);
          reject(new Error('Content moderation timeout'));
        }
      }, 10000);
    });
  }, [aiSocket, isModerating]);

  // Get model information
  const getModelInfo = useCallback((): Promise<ModelInfo> => {
    return new Promise((resolve, reject) => {
      if (!aiSocket) {
        reject(new Error('AI socket not available'));
        return;
      }

      const handleSuccess = (response: AISocketResponse<ModelInfo>) => {
        if (response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Model info retrieval failed'));
        }
      };

      const handleError = (response: AISocketResponse) => {
        reject(new Error(response.error || 'Model info retrieval failed'));
      };

      // Set up one-time listeners
      aiSocket.on('model_info', handleSuccess);
      aiSocket.on('model_info_error', handleError);

      // Emit the request
      aiSocket.emit('get_model_info');

      // Cleanup listeners after 5 seconds
      setTimeout(() => {
        aiSocket.off('model_info', handleSuccess);
        aiSocket.off('model_info_error', handleError);
      }, 5000);
    });
  }, [aiSocket]);

  // Join board room for real-time updates
  const joinBoardRoom = useCallback((boardId: string) => {
    if (aiSocket) {
      aiSocket.emit('join_board_room', { boardId });
    }
  }, [aiSocket]);

  // Leave board room
  const leaveBoardRoom = useCallback((boardId?: string) => {
    if (aiSocket) {
      aiSocket.emit('leave_board_room', { boardId });
    }
  }, [aiSocket]);

  // Listen for board generation progress
  useEffect(() => {
    if (!aiSocket) return;

    const handleGenerationStarted = (data: { prompt: string; timestamp: string }) => {
      toast.info('AI is generating your board...', 'Board Generation Started');
    };

    aiSocket.on('board_generation_started', handleGenerationStarted);

    return () => {
      aiSocket.off('board_generation_started', handleGenerationStarted);
    };
  }, [aiSocket, toast]);

  // Connection status
  const isConnected = aiSocket?.connected || false;
  const isConnecting = aiSocket?.connecting || false;
  const connectionError = aiSocket?.error || null;

  return {
    // Connection status
    isConnected,
    isConnecting,
    connectionError,
    
    // Operation states
    isGenerating,
    isAutoCompleting,
    isGettingSuggestions,
    isGettingTemplates,
    isModerating,
    
    // AI functions
    generateBoard,
    autoCompletePrompt,
    getSmartSuggestions,
    getQuickTemplates,
    generateAdditionalTasks,
    getImprovementSuggestions,
    moderateContent,
    getModelInfo,
    
    // Room management
    joinBoardRoom,
    leaveBoardRoom,
    
    // Raw socket for advanced usage
    socket: aiSocket,
  };
}
