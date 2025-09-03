// API-related interfaces used across the application

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// Auth-related API interfaces
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: any;
  token: string;
  message: string;
  success: boolean;
  refreshToken?: string;
}

export interface DeviceInfo {
  deviceId?: string;
  deviceInfo?: {
    type: 'web' | 'mobile' | 'desktop';
    os?: string;
    browser?: string;
  };
}

export interface OAuthUserData {
  id: string;
  oauthId: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
}

export interface OAuthLoginData {
  id: string;
  provider: 'google' | 'github';
  oauthId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface OAuthCallbackData {
  code?: string;
  provider: 'google' | 'github';
}

export interface EmailVerificationData {
  email: string;
  code: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  email: string;
  newPassword: string;
}

// Form-related API interfaces
export interface CreateTaskForm {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: string[];
  tags: string[];
  estimatedHours?: number;
  dueDate?: string;
  position?: number;
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignees?: string[];
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface MoveTaskForm {
  columnId: string;
  position: number;
}

export interface CreateBoardForm {
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  visibility: 'private' | 'workspace' | 'public';
  space: string;
  settings?: any;
}

export interface UpdateBoardForm {
  name?: string;
  description?: string;
  visibility?: 'private' | 'workspace' | 'public';
  settings?: any;
}

export interface CreateColumnForm {
  name: string;
  board: string;
  position: number;
  settings?: any;
}

export interface UpdateColumnForm {
  name?: string;
  position?: number;
  settings?: any;
}

export interface CreateSpaceForm {
  name: string;
  description?: string;
  workspace: string;
  settings?: any;
}

export interface UpdateSpaceForm {
  name?: string;
  description?: string;
  settings?: any;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  isPublic?: boolean;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  settings?: any;
}

export interface InviteMemberData {
  email: string;
  role?: 'member' | 'admin';
  message?: string;
}

// Chat-related API interfaces
export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'file' | 'image' | 'system';
  attachments?: any[];
}

export interface CreateChatRequest {
  adminId: string;
  category?: string;
  priority?: string;
  initialMessage: string;
}

// Template-related API interfaces
export interface TemplatesFilters {
  workspaceId?: string;
  type?: string;
  category?: string;
  q?: string;
  isPublic?: boolean;
  status?: string;
  limit?: number;
  all?: boolean;
  scope?: 'all';
}
