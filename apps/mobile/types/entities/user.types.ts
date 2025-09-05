// User-related types for core entities

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

export interface UserBasic {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor?: string;
    accentColor?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  loginAttempts: number;
  lockedUntil?: string;
  passwordExpiresAt?: string;
}

export interface UserRoles {
  global: string[];
  workspaces: Record<string, string[]>;
  permissions: string[];
}

export interface UserProfile {
  user: UserBasic;
  preferences: UserPreferences;
  security: UserSecurity;
  roles: UserRoles;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalBoards: number;
  totalWorkspaces: number;
  lastActivity: string;
  joinDate: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'web' | 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  version: string;
  isTrusted: boolean;
  fingerprint?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  invitedBy: string;
  workspaceId?: string;
  spaceId?: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  id: string;
  userId: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  metadata?: Record<string, any>;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface UserAudit {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  performedBy: string;
  performedAt: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

// User constants
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type UserTheme = typeof USER_THEMES[keyof typeof USER_THEMES];

export const USER_TIME_FORMATS = {
  HOURS_12: '12h',
  HOURS_24: '24h',
} as const;

export type UserTimeFormat = typeof USER_TIME_FORMATS[keyof typeof USER_TIME_FORMATS];

// User validation
export interface UserValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// User search and filter
export interface UserSearchFilters {
  query?: string;
  status?: UserStatus[];
  role?: UserRoleType[];
  workspaceId?: string;
  spaceId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  createdAtAfter?: string;
  createdAtBefore?: string;
}

// User import/export
export interface UserImportData {
  email: string;
  name: string;
  role?: string;
  workspaceId?: string;
  spaceId?: string;
  preferences?: Partial<UserPreferences>;
  metadata?: Record<string, any>;
}

export interface UserExportData {
  users: User[];
  total: number;
  exportedAt: string;
  format: 'csv' | 'json' | 'xlsx';
  metadata?: Record<string, any>;
}

// User bulk operations
export interface UserBulkOperation {
  operation: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'delete' | 'changeRole' | 'addToWorkspace' | 'removeFromWorkspace';
  userIds: string[];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserBulkOperationResult {
  operation: string;
  totalUsers: number;
  successful: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
  metadata?: Record<string, any>;
}
