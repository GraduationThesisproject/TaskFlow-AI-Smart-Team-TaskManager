export interface User {
  id: string;
  email: string;
  name: string; // Changed from firstName/lastName to match backend
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string; // Changed from Date to string (ISO format)
  createdAt: string; // Changed from Date to string (ISO format)
  updatedAt: string; // Changed from Date to string (ISO format)
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

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string; // Changed from firstName/lastName
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
  success: boolean;
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
