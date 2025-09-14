// Updated types to match backend data model structure
import type { UserPreferences } from "./auth.types";
import type { Board, Column } from "./board.types";
import type { Space } from "./space.types";

// Task priority types - defined first to avoid redeclaration errors

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
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





export interface Task {
  _id: string;
  title: string;
  description?: string;
  board: string;
  space: string;
  column: string;
  priority: TaskPriority;
  color: string;
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
  checklist?: string;
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

// State management types - cleaned up to remove data duplication
export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  currentBoard: Board | null;
  currentSpace: Space | null;
  columns: Column[];
  boards: Board[];
  spaces: Space[];
  comments: Record<string, Comment[]>; // Comments indexed by taskId
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
  column: string[];
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
  priority: TaskPriority;
  color?: string;
  assignees: string[];
  tags: string[];
  estimatedHours?: number;
  dueDate?: string;
  position?: number;
  checklist?: {
    title: string;
    items: {
      text: string;
      completed?: boolean;
    }[];
  };
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  color?: string;
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

// Legacy types removed - now defined at the top of the file

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}
