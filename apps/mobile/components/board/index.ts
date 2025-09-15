/**
 * Board components barrel export
 * Provides clean imports for all board-related components
 */

export { Board } from './Board';
export { Column } from './Column';
export { TaskCard } from './TaskCard';
export { TaskDetails } from './TaskDetails';
export { TaskCreateModal } from './TaskCreateModal';

// Re-export types for convenience
export type {
  DragTask,
  DragColumn,
  DragBoard,
  DragBoardState,
  BoardProps,
  ColumnProps,
  TaskCardProps,
  TaskDetailsProps,
  TaskPriority,
  TaskStatus,
  BoardViewMode,
  MoveTaskPayload,
  UpdateTaskPayload,
} from '@/types/dragBoard.types';
