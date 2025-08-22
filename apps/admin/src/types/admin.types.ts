export interface Admin {
  id: string;
  userId?: string;
  email: string;
  name: string; // Backend returns 'name' instead of firstName/lastName
  role: AdminRole;
  permissions: Permission[];
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  isActive?: boolean;
  lastActivity?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AdminState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    admin: Admin;
    token: string;
  };
}
