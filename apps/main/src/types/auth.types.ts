// Basic user information
export interface UserBasic {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string; // ISO format
  createdAt: string; // ISO format
  updatedAt: string; // ISO format
}

// User preferences
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

// User security settings
export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string; // ISO format
  loginAttempts: number;
  lockedUntil?: string; // ISO format
  passwordExpiresAt?: string; // ISO format
}

// User roles and permissions
export interface UserRoles {
  global: string[];
  workspaces: Record<string, string[]>; // workspaceId -> roles[]
  permissions: string[];
}

// Complete user object with all nested data
export interface User {
  user: UserBasic;
  preferences: UserPreferences;
  security: UserSecurity;
  roles: UserRoles;
}

// export type UserRole = 'admin' | 'user' | 'moderator';
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register data interface
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Auth response from backend
export interface AuthResponse {
  user: User;
  token: string;
  message: string;
  success: boolean;
  refreshToken?: string;
}

// Add device info for session management
export interface DeviceInfo {
  deviceId?: string;
  deviceInfo?: {
    type: 'web' | 'mobile' | 'desktop';
    os?: string;
    browser?: string;
  };
}

// OAuth-specific types
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

// Extended register data for OAuth
export interface OAuthRegisterData extends OAuthUserData {
  // Additional fields can be added here if needed
}
