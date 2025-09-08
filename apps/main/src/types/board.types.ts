// Board-related types extracted from task.types.ts
export interface Board {
  _id: string;
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  visibility: 'private' | 'workspace' | 'public';
  space: string | { _id: string; name: string };
  owner: string;
  members: BoardMember[];
  columns?: Column[]; // Optional since columns are managed separately in columnSlice
  settings: BoardSettings;
  tags: BoardTag[];
  theme?: BoardTheme;
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

export interface BoardTheme {
  background?: {
    _id: string;
    filename: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
  } | null;
  color: string;
  opacity: number;
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

// State management types
export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

export interface ColumnState {
  columns: Column[];
  currentColumn: Column | null;
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

// Form types
export interface CreateBoardForm {
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  visibility: 'private' | 'workspace' | 'public';
  space: string;
  settings?: Partial<BoardSettings>;
}

export interface UpdateBoardForm {
  name?: string;
  description?: string;
  visibility?: 'private' | 'workspace' | 'public';
  settings?: Partial<BoardSettings>;
}

export interface CreateColumnForm {
  name: string;
  board: string;
  position: number;
  settings?: Partial<ColumnSettings>;
}

export interface UpdateColumnForm {
  name?: string;
  position?: number;
  settings?: Partial<ColumnSettings>;
}

// API Response types for boards
export interface BoardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface BoardPaginatedResponse<T> {
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
