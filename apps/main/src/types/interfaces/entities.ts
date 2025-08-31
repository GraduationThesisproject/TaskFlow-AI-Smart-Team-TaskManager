// Core entity interfaces used across the application
import type { TaskStatus, TaskPriority } from '../task.types';

// User-related interfaces
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

export interface User {
  user: UserBasic;
  preferences: UserPreferences;
  security: UserSecurity;
  roles: UserRoles;
}

// Workspace-related interfaces
export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: WorkspaceMember[];
  spaces: string[];
  settings: WorkspaceSettings;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  user?: UserBasic;
  role: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'disabled';
  lastActive?: string | Date;
  joinedAt: Date;
  addedBy?: string;
  permissions?: string[];
}

export interface WorkspaceSettings {
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

// Space-related interfaces
export interface Space {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  members: SpaceMember[];
  settings: SpaceSettings;
  stats: SpaceStats;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceMember {
  user: string;
  role: 'owner' | 'admin' | 'contributor' | 'member' | 'viewer';
  joinedAt: string;
  addedBy?: string;
  permissions: SpacePermissions;
}

export interface SpacePermissions {
  canViewBoards: boolean;
  canCreateBoards: boolean;
  canEditBoards: boolean;
  canDeleteBoards: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
  canEditSettings: boolean;
}

export interface SpaceSettings {
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

export interface SpaceStats {
  totalBoards: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeMembersCount: number;
  lastActivityAt: string;
}

// Board-related interfaces
export interface Board {
  _id: string;
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  visibility: 'private' | 'workspace' | 'public';
  space: string;
  owner: string;
  members: BoardMember[];
  columns: Column[];
  settings: BoardSettings;
  tags: BoardTag[];
  archived: boolean;
  isActive: boolean;
  isTemplate: boolean;
  templateSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  user: string;
  permissions: string[];
  addedAt: string;
}

export interface BoardSettings {
  allowComments: boolean;
  allowAttachments: boolean;
  allowTimeTracking: boolean;
  defaultTaskPriority: TaskPriority;
  autoArchive: boolean;
  archiveAfterDays: number;
}

export interface BoardTag {
  name: string;
  color: string;
}

export interface Column {
  _id: string;
  name: string;
  board: string;
  position: number;
  taskIds: ColumnTask[];
  limit?: number;
  settings: ColumnSettings;
  statusMapping?: TaskStatus;
  style: ColumnStyle;
  stats: ColumnStats;
  isDefault: boolean;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnTask {
  task: string;
  position: number;
  addedAt: string;
}

export interface ColumnSettings {
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

export interface ColumnStyle {
  color: string;
  backgroundColor: string;
  borderColor?: string;
  textColor?: string;
  icon?: string | null;
  customCss?: string;
}

export interface ColumnStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

// Task-related interfaces
export interface Task {
  _id: string;
  title: string;
  description?: string;
  board: string;
  space: string;
  column: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: string[];
  reporter: string;
  watchers: string[];
  tags: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours: number;
  position: number;
  movedAt?: string;
  timeEntries: TimeEntry[];
  attachments: string[];
  dependencies: TaskDependency[];
  aiGenerated: boolean;
  aiSuggestions?: AISuggestions;
  naturalLanguageInput?: string;
  isOverdue: boolean;
  archivedAt?: string;
  retentionPolicy: RetentionPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  user: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
}

export interface TaskDependency {
  task: string;
  type: 'blocks' | 'blocked_by' | 'related_to';
}

export interface AISuggestions {
  estimatedDeadline?: string;
  suggestedPriority?: string;
  complexity: 'simple' | 'medium' | 'complex';
  similarTasks: string[];
}

export interface RetentionPolicy {
  deleteAfterDays: number;
  autoArchive: boolean;
}

// Comment-related interfaces
export interface Comment {
  _id: string;
  content: string;
  author: string;
  taskId: string;
  mentions: string[];
  attachments: string[];
  reactions: CommentReaction[];
  isPinned: boolean;
  isResolved: boolean;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  user: string;
  emoji: string;
  createdAt: string;
}

// File-related interfaces
export interface File {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  extension: string;
  checksum: string;
  uploadedBy: string;
  space: string;
  attachedTo: {
    entityType: string;
    entityId: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tag-related interfaces
export interface Tag {
  _id: string;
  name: string;
  color: string;
  textColor: string;
  description?: string;
  scope: 'global' | 'workspace' | 'space' | 'board';
  space: string;
  workspace: string;
  createdBy: string;
  category?: string;
  usageCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat-related interfaces
export interface ChatMessage {
  _id: string;
  sender: {
    id: string;
    model: 'User' | 'Admin';
    name: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  attachments?: ChatAttachment[];
  isRead: boolean;
  readAt?: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface ChatParticipant {
  id: string;
  model: 'User' | 'Admin';
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Chat {
  _id: string;
  chatId: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'closed' | 'pending';
  category: 'general' | 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
    };
  };
  metrics: {
    totalMessages: number;
    responseTime: {
      firstResponse?: number;
      averageResponse?: number;
    };
    satisfaction?: {
      rating?: number;
      feedback?: string;
      timestamp?: Date;
    };
  };
  settings: {
    autoAssign: boolean;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Template-related interfaces
export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  downloads?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  _id: string;
  name: string;
  description?: string;
  type: TemplateType;
  content: Record<string, any>;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  status?: TemplateStatus;
  accessControl?: {
    allowedUsers?: string[];
    allowedWorkspaces?: string[];
    allowedRoles?: string[];
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likedBy?: string[];
}

export type TemplateType = 'task' | 'board' | 'space' | 'workflow' | 'checklist';
export type TemplateStatus = 'draft' | 'active' | 'archived' | 'deprecated';
export type CategoryKey = 'Marketing' | 'Development' | 'Design' | 'Sales' | 'Support' | 'Operations' | 'HR' | 'Finance' | 'General' | 'Custom';

// Notification-related interfaces
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  recipientId: string;
  relatedEntity: {
    type: string;
    id: string;
  };
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  deliveryMethods: {
    email?: boolean;
    push?: boolean;
    socket?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Activity-related interfaces
export interface ActivityItem {
  _id: string;
  user: ActivityUser | string;
  action: string;
  description: string;
  entity: {
    type: string;
    id: string;
    name?: string;
  };
  relatedEntities?: Array<{
    type: string;
    id: string;
    name?: string;
  }>;
  metadata?: Record<string, any>;
  workspace?: string;
  project?: string;
  space?: string;
  board?: string;
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  isSuccessful?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}
