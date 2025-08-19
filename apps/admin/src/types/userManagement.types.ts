export interface UserManagement {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: Pagination;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  workspaces: Workspace[];
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface UserFilters {
  role?: UserRole[];
  status?: UserStatus[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
}
