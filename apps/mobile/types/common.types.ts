export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}
