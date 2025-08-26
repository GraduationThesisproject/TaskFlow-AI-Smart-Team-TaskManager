// Updated types to match backend data model structure
import type { UserPreferences } from "./auth.types";
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

// export interface UserPreferences {
//   notifications?: {
//     email?: Record<string, boolean>;
//     push?: Record<string, boolean>;
//   };
//   theme?: string;
//   language?: string;
//   timezone?: string;
// }

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
  defaultTaskPriority: 'low' | 'medium' | 'high' | 'critical';
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
  statusMapping?: 'todo' | 'in_progress' | 'review' | 'done' | 'archived';
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
      targetStatus?: 'todo' | 'in_progress' | 'review' | 'done' | 'archived';
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
  icon?: string;
  customCss?: string;
}

export interface ColumnStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  averageTaskAge: number;
  lastTaskAdded?: string;
  lastTaskCompleted?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  board: string;
  space: string;
  column: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
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

export interface Checklist {
  _id: string;
  title: string;
  items: ChecklistItem[];
  taskId: string;
  createdBy: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

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

// State management types - Separated for different slices
export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  sortBy: {
    field: keyof Task;
    direction: 'asc' | 'desc';
  };
  searchQuery: string;
  socketConnected: boolean;
  dragState: {
    isDragging: boolean;
    draggedTask: Task | null;
    sourceColumn: string | null;
    targetColumn: string | null;
  };
}

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

export interface ColumnState {
  columns: Column[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  dragState: {
    isDragging: boolean;
    draggedColumn: Column | null;
    sourcePosition: number | null;
    targetPosition: number | null;
  };
}

export interface SpaceState {
  spaces: Space[];
  currentSpace: Space | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

// Legacy combined state for backward compatibility (will be removed)
export interface CombinedTaskState {
  tasks: Task[];
  columns: Column[];
  boards: Board[];
  spaces: Space[];
  currentTask: Task | null;
  currentBoard: Board | null;
  currentSpace: Space | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  sortBy: {
    field: keyof Task;
    direction: 'asc' | 'desc';
  };
  searchQuery: string;
  socketConnected: boolean;
  dragState: {
    isDragging: boolean;
    draggedTask: Task | null;
    draggedColumn: Column | null;
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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

// Socket event types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface SocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

// Form types
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

// Legacy types for backward compatibility (no enums due to erasableSyntaxOnly)
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  ARCHIVED: 'archived',
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;
export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}
