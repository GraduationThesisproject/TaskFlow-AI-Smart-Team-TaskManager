// State management interfaces used across the application

// Base state interfaces
export interface BaseState {
  loading: boolean;
  error: string | null;
}

export interface PaginatedState<T> extends BaseState {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth state interfaces
export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User state interfaces
export interface UserState extends BaseState {
  currentUser: any | null;
  preferences: any | null;
  sessions: any[];
  activity: any[];
}

// Workspace state interfaces
export interface WorkspaceState extends BaseState {
  workspaces: any[];
  currentWorkspace: any | null;
  spaces: any[];
  selectedSpace: any | null;
  members: any[];
}

// Space state interfaces
export interface SpaceState extends BaseState {
  spaces: any[];
  currentSpace: any | null;
  socketConnected: boolean;
}

// Board state interfaces
export interface BoardState extends BaseState {
  boards: any[];
  currentBoard: any | null;
  socketConnected: boolean;
}

// Column state interfaces
export interface ColumnState extends BaseState {
  columns: any[];
  currentColumn: any | null;
  socketConnected: boolean;
  dragState: {
    isDragging: boolean;
    draggedColumn: any | null;
    sourcePosition: number | null;
    targetPosition: number | null;
  };
}

// Task state interfaces
export interface TaskState extends BaseState {
  tasks: any[];
  currentTask: any | null;
  currentBoard: any | null;
  currentSpace: any | null;
  columns: any[];
  boards: any[];
  spaces: any[];
  comments: Record<string, any[]>;
  filters: TaskFilters;
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
  searchQuery: string;
  socketConnected: boolean;
  dragState: {
    isDragging: boolean;
    draggedTask: any | null;
    draggedColumn: any | null;
    sourceColumn: string | null;
    targetColumn: string | null;
  };
}

export interface TaskFilters {
  status: string[];
  priority: string[];
  assignee: string[];
  tags: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

// Notification state interfaces
export interface NotificationState extends BaseState {
  notifications: any[];
  stats: NotificationStats | null;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

// Template state interfaces
export interface TemplatesState extends BaseState {
  items: any[];
  selected: any | null;
  filters: any;
}

// Permission state interfaces
export interface PermissionState extends BaseState {
  currentUserRole: string | null;
  workspacePermissions: Record<string, string>;
}

// Activity state interfaces
export interface ActivityState extends BaseState {
  activities: any[];
  lastFetched: number | null;
  count: number;
  total: number;
}

// Chat state interfaces
export interface ChatState extends BaseState {
  chats: any[];
  currentChat: any | null;
  messages: any[];
  participants: any[];
  isTyping: boolean;
  socketConnected: boolean;
}

// UI state interfaces
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  modals: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  notifications: {
    isOpen: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  search: {
    isOpen: boolean;
    query: string;
    results: any[];
  };
  dragAndDrop: {
    isDragging: boolean;
    draggedItem: any | null;
    dropTarget: any | null;
  };
}

// Form state interfaces
export interface FormState<T> {
  data: T;
  validation: {
    isValid: boolean;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
  };
  isSubmitting: boolean;
  isDirty: boolean;
  isPristine: boolean;
}

// Socket state interfaces
export interface SocketState extends BaseState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionDetails: {
    baseUrl: string;
    hasToken: boolean;
    authStatus: string;
    lastAttempt: Date | null;
    isReady: boolean;
    namespaces: string[];
  };
  namespaces: {
    board: SocketNamespaceState;
    notifications: SocketNamespaceState;
    system: SocketNamespaceState;
    chat: SocketNamespaceState;
    workspace: SocketNamespaceState;
  };
}

export interface SocketNamespaceState {
  socket: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Filter state interfaces
export interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  assignee: string[];
  tags: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
  workspace?: string;
  space?: string;
  board?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Selection state interfaces
export interface SelectionState<T> {
  selectedItems: T[];
  isMultiSelect: boolean;
  lastSelected: T | null;
  selectionMode: 'single' | 'multiple' | 'range';
}

// Loading state interfaces
export interface LoadingState {
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  error: string | null;
  errors: Record<string, string>;
}

// Cache state interfaces
export interface CacheState {
  data: Record<string, any>;
  timestamps: Record<string, number>;
  ttl: Record<string, number>;
  maxSize: number;
  currentSize: number;
}

// Error state interfaces
export interface ErrorState {
  hasError: boolean;
  errors: Record<string, string[]>;
  globalError: string | null;
  errorBoundary: {
    hasError: boolean;
    error: Error | null;
    errorInfo: any | null;
  };
}

// Analytics state interfaces
export interface AnalyticsState {
  events: any[];
  metrics: Record<string, number>;
  userBehavior: Record<string, any>;
  performance: Record<string, number>;
}

// Settings state interfaces
export interface SettingsState {
  user: {
    profile: any;
    preferences: any;
    security: any;
  };
  workspace: {
    general: any;
    members: any;
    integrations: any;
    billing: any;
  };
  system: {
    theme: string;
    language: string;
    timezone: string;
    notifications: any;
  };
}
