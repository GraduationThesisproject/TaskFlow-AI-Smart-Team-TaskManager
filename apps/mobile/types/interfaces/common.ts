import type { ReactNode, CSSProperties, MouseEvent, KeyboardEvent, FocusEvent, ErrorInfo } from 'react';

// Common utility interfaces used across the application

// Base interface for all components
export interface BaseComponent {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Generic event handlers
export interface EventHandlers {
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

// Form-related interfaces
export interface FormField {
  name: string;
  value: any;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface FormValidation {
  [fieldName: string]: ValidationRule[];
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Loading and state interfaces
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
  lastUpdated?: Date;
}

// Search and filter interfaces
export interface SearchFilters {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

// Date and time interfaces
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

// File and media interfaces
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
  alt?: string;
}

// Notification interfaces
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Error boundary interfaces
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Permission-related interfaces
export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member';

// Route-related interfaces
export interface RouteConfig {
  path: string;
  requiredRole?: WorkspaceRole;
  requiredPermission?: string;
  redirectTo?: string;
  isPublic?: boolean;
}

// Navigation-related interfaces
export interface NavigationItem {
  name: string;
  hasDropdown: boolean;
  href?: string;
  dropdownItems?: Array<{
    name: string;
    href: string;
    description?: string;
  }>;
}

export interface NavbarConfig {
  type: 'landing' | 'auth' | 'dashboard';
  showLogo: boolean;
  showSearch: boolean;
  showUserProfile: boolean;
  showAuthButtons: boolean;
  showDashboardActions: boolean;
  showThemeToggle: boolean;
}

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// File-related interfaces
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}



// User-related interfaces
export interface UserMetadata {
  lastLogin?: string;
  loginCount: number;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string;
}
