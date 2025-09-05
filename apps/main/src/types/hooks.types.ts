// Hook-related types and interfaces

// Activity Hook Types
export interface FetchActivitiesParams {
  limit?: number;
  page?: number;
  workspaceId?: string;
  projectId?: string;
  spaceId?: string;
  boardId?: string;
  userId?: string;
}

export interface UseActivityReturn {
  activities: import('./store.types').ActivityItem[];
  loading: boolean;
  error: string | null;
  count: number;
  total: number;
  lastFetched: number | null;
  fetchActivities: (params?: FetchActivitiesParams) => void;
  addActivity: (activity: Omit<import('./store.types').ActivityItem, '_id' | 'createdAt' | 'updatedAt'>) => void;
  clearActivities: () => void;
  refetch: () => void;
}

// Auth Hook Types
export type UseOAuthReturn = {
  loginWithOAuth: (provider: 'google' | 'github') => void;
  signupWithOAuth: (provider: 'google' | 'github') => void;
};

export type UseOAuthCallbackReturn = {
  handleOAuthCallback: (provider: 'google' | 'github', code: string, state?: string) => Promise<any>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
};
