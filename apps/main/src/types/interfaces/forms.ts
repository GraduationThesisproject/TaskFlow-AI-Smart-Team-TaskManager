// Form-related interfaces used across the application
import type { TaskStatus, TaskPriority } from '../task.types';

// Base form interfaces
export interface BaseFormData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

export interface FormState<T> {
  data: T;
  validation: FormValidation;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Task form interfaces
export interface TaskFormData extends BaseFormData {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  priority: TaskPriority;
  assignees: string[];
  tags: string[];
  estimatedHours?: number;
  dueDate?: string;
  position?: number;
}

export interface TaskFormValidation extends FormValidation {
  title?: string[];
  boardId?: string[];
  columnId?: string[];
  priority?: string[];
  dueDate?: string[];
}

// Board form interfaces
export interface BoardFormData extends BaseFormData {
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  visibility: 'private' | 'workspace' | 'public';
  space: string;
  settings?: BoardFormSettings;
}

export interface BoardFormSettings {
  allowComments: boolean;
  allowAttachments: boolean;
  allowTimeTracking: boolean;
  defaultTaskPriority: TaskPriority;
  autoArchive: boolean;
  archiveAfterDays: number;
}

export interface BoardFormValidation extends FormValidation {
  name?: string[];
  type?: string[];
  visibility?: string[];
  space?: string[];
}

// Column form interfaces
export interface ColumnFormData extends BaseFormData {
  name: string;
  board: string;
  position: number;
  settings?: ColumnFormSettings;
  style?: ColumnFormStyle;
}

export interface ColumnFormSettings {
  wipLimit: {
    enabled: boolean;
    limit?: number;
    strictMode: boolean;
  };
  sorting: {
    method: 'manual' | 'priority' | 'due_date' | 'created_date' | 'alphabetical';
    direction: 'asc' | 'desc';
    autoSort: boolean;
  };
  automation: {
    autoAssign: {
      enabled: boolean;
      assignTo?: string;
    };
    statusUpdate: {
      enabled: boolean;
      targetStatus?: TaskStatus;
    };
    notifications: {
      onTaskAdded: boolean;
      onTaskRemoved: boolean;
      onLimitReached: boolean;
    };
  };
  visibility: {
    isCollapsible: boolean;
    isCollapsed: boolean;
    showTaskCount: boolean;
    showProgressBar: boolean;
  };
}

export interface ColumnFormStyle {
  color: string;
  backgroundColor: string;
  borderColor?: string;
  textColor?: string;
  icon?: string | null;
  customCss?: string;
}

export interface ColumnFormValidation extends FormValidation {
  name?: string[];
  board?: string[];
  position?: string[];
}

// Space form interfaces
export interface SpaceFormData extends BaseFormData {
  name: string;
  description?: string;
  workspace: string;
  settings?: SpaceFormSettings;
}

export interface SpaceFormSettings {
  color: string;
  icon: string;
  isPrivate: boolean;
  allowGuestAccess: boolean;
  autoArchiveCompletedTasks: boolean;
  archiveAfterDays: number;
  defaultBoardTemplate?: string;
  features: {
    timeTracking: boolean;
    aiSuggestions: boolean;
    customFields: boolean;
    fileAttachments: boolean;
    voting: boolean;
    dependencies: boolean;
  };
  notifications: {
    newTaskNotifications: boolean;
    taskUpdatesNotifications: boolean;
    taskCompletedNotifications: boolean;
    dueDateReminders: boolean;
    memberJoinedNotifications: boolean;
  };
}

export interface SpaceFormValidation extends FormValidation {
  name?: string[];
  workspace?: string[];
}

// Workspace form interfaces
export interface WorkspaceFormData extends BaseFormData {
  name: string;
  description?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  isPublic?: boolean;
  settings?: WorkspaceFormSettings;
}

export interface WorkspaceFormSettings {
  theme?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  defaultView?: 'list' | 'board' | 'calendar';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  features: {
    timeTracking: boolean;
    fileAttachments: boolean;
    customFields: boolean;
  };
}

export interface WorkspaceFormValidation extends FormValidation {
  name?: string[];
  plan?: string[];
}

// User form interfaces
export interface UserProfileFormData extends BaseFormData {
  name: string;
  email: string;
  avatar?: File | null;
  preferences?: UserPreferencesFormData;
}

export interface UserPreferencesFormData {
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

export interface UserProfileFormValidation extends FormValidation {
  name?: string[];
  email?: string[];
}

// Comment form interfaces
export interface CommentFormData extends BaseFormData {
  content: string;
  taskId: string;
  mentions?: string[];
  attachments?: File[];
  parentCommentId?: string;
}

export interface CommentFormValidation extends FormValidation {
  content?: string[];
  taskId?: string[];
}

// Search and filter form interfaces
export interface SearchFormData {
  query: string;
  filters: SearchFiltersFormData;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SearchFiltersFormData {
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
}

// Template form interfaces
export interface TemplateFormData extends BaseFormData {
  name: string;
  description?: string;
  type: 'task' | 'board' | 'space' | 'workflow' | 'checklist';
  content: Record<string, any>;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  status?: 'draft' | 'active' | 'archived' | 'deprecated';
  accessControl?: {
    allowedUsers?: string[];
    allowedWorkspaces?: string[];
    allowedRoles?: string[];
  };
}

export interface TemplateFormValidation extends FormValidation {
  name?: string[];
  type?: string[];
  content?: string[];
}

// Invitation form interfaces
export interface InvitationFormData {
  email: string;
  role: 'member' | 'admin';
  message?: string;
  workspaceId: string;
  spaceId?: string;
}

export interface InvitationFormValidation extends FormValidation {
  email?: string[];
  role?: string[];
  workspaceId?: string[];
}

// File upload form interfaces
export interface FileUploadFormData {
  file: File;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  entityType: string;
  entityId: string;
}

export interface FileUploadFormValidation extends FormValidation {
  file?: string[];
  entityType?: string[];
  entityId?: string[];
}
