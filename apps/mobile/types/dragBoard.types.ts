/**
 * TypeScript types for the TaskFlow AI drag-and-drop board
 * Optimized for performance and reusability
 */

// Core Task type for drag-and-drop board
export interface DragTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignees: TaskAssignee[];
  columnId: string;
  position: number;
  tags?: string[];
  attachments?: number;
  comments?: number;
  createdAt: string;
  updatedAt: string;
  // UI state
  isDragging?: boolean;
  isPlaceholder?: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

// Column type for drag-and-drop board
export interface DragColumn {
  _id: string;
  name: string;
  boardId: string;
  position: number;
  color: string;
  tasks: DragTask[];
  wipLimit?: number;
  collapsed?: boolean;
  // UI state
  isDraggedOver?: boolean;
  isDropZone?: boolean;
}

// Board type
export interface DragBoard {
  _id: string;
  name: string;
  description?: string;
  spaceId: string;
  columns: DragColumn[];
  viewMode: BoardViewMode;
  filters?: BoardFilters;
  sortBy?: BoardSortOptions;
}

export type BoardViewMode = 'kanban' | 'list' | 'grid';
export type BoardSortOptions = 'priority' | 'dueDate' | 'assignee' | 'created' | 'updated' | 'position';

export interface BoardFilters {
  priority?: TaskPriority[];
  assignees?: string[];
  tags?: string[];
  dueDateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

// Drag and Drop specific types
export interface DragState {
  isDragging: boolean;
  draggedTask: DragTask | null;
  draggedTaskId: string | null;
  sourceColumnId: string | null;
  targetColumnId: string | null;
  dropPosition: number | null;
  dragOffset: {
    x: number;
    y: number;
  };
  isLongPressActive: boolean;
}

export interface DropZone {
  columnId: string;
  position: number;
  height: number;
  y: number;
}

// Redux State type for the board
export interface DragBoardState {
  board: DragBoard | null;
  columns: DragColumn[];
  tasks: Record<string, DragTask[]>; // Indexed by columnId for performance
  dragState: DragState;
  loading: boolean;
  error: string | null;
  selectedTask: DragTask | null;
  isTaskDetailsOpen: boolean;
  optimisticUpdates: OptimisticUpdate[];
}

export interface OptimisticUpdate {
  id: string;
  type: 'MOVE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'ADD_TASK';
  timestamp: number;
  rollbackData?: any;
}

// Action payloads
export interface MoveTaskPayload {
  taskId: string;
  sourceColumnId: string;
  targetColumnId: string;
  sourceIndex: number;
  targetIndex: number;
}

export interface UpdateTaskPayload {
  taskId: string;
  columnId: string;
  updates: Partial<DragTask>;
}

export interface AddTaskPayload {
  columnId: string;
  task: Omit<DragTask, '_id' | 'createdAt' | 'updatedAt'>;
}

export interface ReorderTasksPayload {
  columnId: string;
  startIndex: number;
  endIndex: number;
}

// API Response types
export interface TaskApiResponse {
  success: boolean;
  data: DragTask;
  message?: string;
}

export interface ColumnApiResponse {
  success: boolean;
  data: DragColumn;
  message?: string;
}

export interface BoardApiResponse {
  success: boolean;
  data: DragBoard;
  message?: string;
}

// Component Props types
export interface BoardProps {
  boardId: string;
  onTaskSelect?: (task: DragTask) => void;
  onBoardUpdate?: (board: DragBoard) => void;
  editable?: boolean;
  showFilters?: boolean;
}

export interface ColumnProps {
  column: DragColumn;
  tasks: DragTask[];
  onTaskMove: (task: DragTask, targetColumnId: string, targetIndex: number) => void;
  onTaskSelect: (task: DragTask) => void;
  onAddTask: () => void;
  isDraggedOver: boolean;
  editable?: boolean;
}

export interface TaskCardProps {
  task: DragTask;
  columnId: string;
  index: number;
  onDragStart: () => void;
  onDragEnd: (targetColumnId: string, targetIndex: number) => void;
  onPress: () => void;
  isDragging: boolean;
  isPlaceholder?: boolean;
}

export interface TaskDetailsProps {
  task: DragTask | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<DragTask>) => void;
  onDelete?: () => void;
}

// Performance optimization types
export interface RenderItemInfo {
  item: DragTask;
  index: number;
  columnId: string;
}

export interface LayoutInfo {
  index: number;
  length: number;
  offset: number;
}

// Gesture types
export interface GestureState {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  absoluteX: number;
  absoluteY: number;
}

// Theme types for consistency
export interface BoardTheme {
  primary: string;
  background: string;
  card: string;
  border: string;
  text: string;
  mutedText: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
    urgent: string;
  };
  statusColors: {
    todo: string;
    in_progress: string;
    review: string;
    done: string;
  };
}
