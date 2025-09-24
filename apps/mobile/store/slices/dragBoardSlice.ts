/**
 * Redux slice for TaskFlow AI drag-and-drop board
 * Manages board state with optimistic updates and performance optimizations
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  DragBoardState,
  DragTask,
  DragColumn,
  DragBoard,
  MoveTaskPayload,
  UpdateTaskPayload,
  AddTaskPayload,
  ReorderTasksPayload,
  BoardViewMode,
  BoardFilters,
  DragState,
  TaskPriority,
  TaskStatus,
} from '../../types/dragBoard.types';
import { TaskService } from '../../services/taskService';
import { BoardService } from '../../services/boardService';
import type { Task } from '../../types/task.types';

// Initial state
const initialDragState: DragState = {
  isDragging: false,
  draggedTask: null,
  draggedTaskId: null,
  sourceColumnId: null,
  targetColumnId: null,
  dropPosition: null,
  dragOffset: { x: 0, y: 0 },
  isLongPressActive: false,
};

const initialState: DragBoardState = {
  board: null,
  columns: [],
  tasks: {},
  dragState: initialDragState,
  loading: false,
  error: null,
  selectedTask: null,
  isTaskDetailsOpen: false,
  optimisticUpdates: [],
};

// Async thunks for API calls
export const fetchBoard = createAsyncThunk(
  'dragBoard/fetchBoard',
  async (boardId: string) => {
    const boardRes = await BoardService.getBoard(boardId);
    const columnsRes = await BoardService.getColumnsByBoard(boardId);
    const tasksRes = await TaskService.getTasks({ boardId });

    // Unwrap board
    const boardData = (boardRes as any)?.data?.data?.board
      ?? (boardRes as any)?.data?.data
      ?? (boardRes as any)?.data
      ?? {};

    // Unwrap columns
    const columnsContainer = (columnsRes as any)?.data?.columns
      ?? (columnsRes as any)?.data?.data?.columns
      ?? (columnsRes as any)?.data
      ?? (boardData?.columns ?? []);
    const columnsData: any[] = Array.isArray(columnsContainer)
      ? (columnsContainer as any[])
      : Array.isArray((columnsContainer as any)?.items)
      ? ((columnsContainer as any).items as any[])
      : Array.isArray((columnsContainer as any)?.columns)
      ? ((columnsContainer as any).columns as any[])
      : [];

    // Unwrap tasks
    const tasksContainer = (tasksRes as any)?.data?.tasks
      ?? (tasksRes as any)?.data?.data?.tasks
      ?? (tasksRes as any)?.data
      ?? [];
    const tasksData: Task[] = Array.isArray(tasksContainer)
      ? (tasksContainer as Task[])
      : Array.isArray((tasksContainer as any)?.items)
      ? ((tasksContainer as any).items as Task[])
      : [];

    const columns: DragColumn[] = columnsData
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((c: any) => ({
        _id: String(c._id || c.id),
        name: c.name,
        boardId: String(c.board || c.boardId || boardId),
        position: c.position ?? 0,
        color: c.color || '#DBEAFE',
        tasks: [],
      }));

    const tasksByColumn: Record<string, DragTask[]> = {};
    for (const t of tasksData) {
      const rawColumn = (t as any).column;
      const colId = typeof rawColumn === 'object' && rawColumn
        ? String(rawColumn._id || rawColumn.id)
        : String(rawColumn);
      const dragTask: DragTask = {
        _id: String(t._id),
        title: t.title,
        description: t.description,
        status: (t.status as any) as TaskStatus,
        priority: (t.priority as any) as TaskPriority,
        dueDate: t.dueDate,
        assignees: (t.assignees || []).map((uid: string) => ({ id: uid, name: '' })),
        columnId: colId,
        position: t.position ?? 0,
        tags: t.tags || [],
        attachments: (t.attachments || []).length,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
      if (!tasksByColumn[colId]) tasksByColumn[colId] = [];
      tasksByColumn[colId].push(dragTask);
    }

    Object.keys(tasksByColumn).forEach((cid) => {
      tasksByColumn[cid].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });

    const board: DragBoard = {
      _id: String(boardData._id || boardId),
      name: boardData.name || 'Task Board',
      description: boardData.description,
      spaceId: String(boardData.space || boardData.spaceId || ''),
      columns: [],
      viewMode: 'kanban',
    };

    return { board, columns, tasks: tasksByColumn };
  }
);

export const saveTaskMove = createAsyncThunk(
  'dragBoard/saveTaskMove',
  async (payload: MoveTaskPayload) => {
    // Guard: skip server call for temporary client-only IDs or invalid payloads
    const isTempId = typeof payload.taskId === 'string' && payload.taskId.startsWith('task-');
    const hasValidTarget = typeof payload.targetColumnId === 'string' && payload.targetColumnId.length > 0;
    const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(String(payload.taskId));

    if (!hasValidTarget || isTempId || !looksLikeObjectId) {
      // Return optimistically without hitting the backend
      return payload;
    }

    await TaskService.moveTask(payload.taskId, {
      columnId: payload.targetColumnId,
      position: payload.targetIndex,
    });
    return payload;
  }
);

export const addTaskAsync = createAsyncThunk(
  'dragBoard/addTaskAsync',
  async ({ boardId, columnId, title, priority = 'medium' as TaskPriority, position = 0 }: { boardId: string; columnId: string; title: string; priority?: TaskPriority; position?: number }) => {
    const res = await TaskService.createTask({
      title,
      description: '',
      boardId,
      columnId,
      priority: priority as any,
      assignees: [],
      tags: [],
      position,
    });
    const t = res.data as any as Task;
    const dragTask: DragTask = {
      _id: String(t._id),
      title: t.title,
      description: t.description,
      status: (t.status as any) as TaskStatus,
      priority: (t.priority as any) as TaskPriority,
      dueDate: t.dueDate,
      assignees: (t.assignees || []).map((uid: string) => ({ id: uid, name: '' })),
      columnId: (() => {
        const rawCol = (t as any).column;
        if (typeof rawCol === 'object' && rawCol) return String(rawCol._id || rawCol.id || columnId);
        return String(rawCol || columnId);
      })(),
      position: t.position ?? position,
      tags: t.tags || [],
      attachments: (t.attachments || []).length,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
    return { columnId: dragTask.columnId, task: dragTask };
  }
);

export const createColumnAsync = createAsyncThunk(
  'dragBoard/createColumnAsync',
  async ({ boardId, name, position, color }: { boardId: string; name: string; position: number; color?: string }) => {
    const res = await BoardService.createColumn({ name, boardId, position, color });
    const colRaw = (res as any)?.data?.data ?? (res as any)?.data ?? res;
    const column: DragColumn = {
      _id: String(colRaw._id || colRaw.id),
      name: colRaw.name || name,
      boardId: String(colRaw.board || colRaw.boardId || boardId),
      position: colRaw.position ?? position,
      color: colRaw.color || color || '#DBEAFE',
      tasks: [],
    };
    return column;
  }
);

// Redux slice
const dragBoardSlice = createSlice({
  name: 'dragBoard',
  initialState,
  reducers: {
    // Drag state management
    startDrag: (state, action: PayloadAction<{ taskId: string; columnId: string }>) => {
      const { taskId, columnId } = action.payload;
      const task = state.tasks[columnId]?.find(t => t._id === taskId);
      
      if (task) {
        state.dragState = {
          ...state.dragState,
          isDragging: true,
          draggedTask: task,
          draggedTaskId: taskId,
          sourceColumnId: columnId,
          isLongPressActive: true,
        };
      }
    },

    updateDragPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.dragState.dragOffset = action.payload;
    },

    setDropTarget: (state, action: PayloadAction<{ columnId: string; position: number }>) => {
      state.dragState.targetColumnId = action.payload.columnId;
      state.dragState.dropPosition = action.payload.position;
    },

    endDrag: (state) => {
      state.dragState = initialDragState;
    },

    // Optimistic task movement
    moveTaskOptimistic: (state, action: PayloadAction<MoveTaskPayload>) => {
      const { taskId, sourceColumnId, targetColumnId, targetIndex } = action.payload;
      
      // Find the task in source column
      const sourceTaskIndex = state.tasks[sourceColumnId]?.findIndex(t => t._id === taskId);
      
      if (sourceTaskIndex !== undefined && sourceTaskIndex !== -1) {
        // Remove task from source column
        const [task] = state.tasks[sourceColumnId].splice(sourceTaskIndex, 1);
        
        // Update task's columnId and position
        task.columnId = targetColumnId;
        task.position = targetIndex;
        
        // Add task to target column
        if (!state.tasks[targetColumnId]) {
          state.tasks[targetColumnId] = [];
        }
        state.tasks[targetColumnId].splice(targetIndex, 0, task);
        
        // Update positions in both columns
        state.tasks[sourceColumnId].forEach((t, idx) => {
          t.position = idx;
        });
        state.tasks[targetColumnId].forEach((t, idx) => {
          t.position = idx;
        });
        
        // Add to optimistic updates
        state.optimisticUpdates.push({
          id: `move-${taskId}-${Date.now()}`,
          type: 'MOVE_TASK',
          timestamp: Date.now(),
          rollbackData: action.payload,
        });
      }
      
      // Reset drag state
      state.dragState = initialDragState;
    },

    // Reorder tasks within column
    reorderTasks: (state, action: PayloadAction<ReorderTasksPayload>) => {
      const { columnId, startIndex, endIndex } = action.payload;
      const tasks = state.tasks[columnId];
      
      if (tasks && startIndex !== endIndex) {
        const [removed] = tasks.splice(startIndex, 1);
        tasks.splice(endIndex, 0, removed);
        
        // Update positions
        tasks.forEach((task, idx) => {
          task.position = idx;
        });
      }
    },

    // Task management
    updateTask: (state, action: PayloadAction<UpdateTaskPayload>) => {
      const { taskId, columnId, updates } = action.payload;
      const task = state.tasks[columnId]?.find(t => t._id === taskId);
      
      if (task) {
        Object.assign(task, updates);
        task.updatedAt = new Date().toISOString();
      }
      
      // Update selected task if it's the same
      if (state.selectedTask?._id === taskId) {
        Object.assign(state.selectedTask, updates);
      }
    },

    addTask: (state, action: PayloadAction<AddTaskPayload>) => {
      const { columnId, task } = action.payload;
      
      const newTask: DragTask = {
        ...task,
        _id: `task-${Date.now()}`, // Temporary ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (!state.tasks[columnId]) {
        state.tasks[columnId] = [];
      }
      
      state.tasks[columnId].push(newTask);
      
      // Update positions
      state.tasks[columnId].forEach((t, idx) => {
        t.position = idx;
      });
    },

    deleteTask: (state, action: PayloadAction<{ taskId: string; columnId: string }>) => {
      const { taskId, columnId } = action.payload;
      const taskIndex = state.tasks[columnId]?.findIndex(t => t._id === taskId);
      
      if (taskIndex !== undefined && taskIndex !== -1) {
        state.tasks[columnId].splice(taskIndex, 1);
        
        // Update positions
        state.tasks[columnId].forEach((t, idx) => {
          t.position = idx;
        });
      }
      
      // Clear selected task if it was deleted
      if (state.selectedTask?._id === taskId) {
        state.selectedTask = null;
        state.isTaskDetailsOpen = false;
      }
    },

    // Task selection
    selectTask: (state, action: PayloadAction<DragTask>) => {
      state.selectedTask = action.payload;
      state.isTaskDetailsOpen = true;
    },

    closeTaskDetails: (state) => {
      state.isTaskDetailsOpen = false;
      // Keep selectedTask for animation purposes
    },

    // Column management
    addColumn: (state, action: PayloadAction<Omit<DragColumn, 'tasks'>>) => {
      const newColumn: DragColumn = {
        ...action.payload,
        tasks: [],
      };
      state.columns.push(newColumn);
      state.tasks[newColumn._id] = [];
    },

    updateColumn: (state, action: PayloadAction<{ columnId: string; updates: Partial<DragColumn> }>) => {
      const column = state.columns.find(c => c._id === action.payload.columnId);
      if (column) {
        Object.assign(column, action.payload.updates);
      }
    },

    deleteColumn: (state, action: PayloadAction<string>) => {
      const columnIndex = state.columns.findIndex(c => c._id === action.payload);
      if (columnIndex !== -1) {
        state.columns.splice(columnIndex, 1);
        delete state.tasks[action.payload];
      }
    },

    // View and filter management
    setViewMode: (state, action: PayloadAction<BoardViewMode>) => {
      if (state.board) {
        state.board.viewMode = action.payload;
      }
    },

    setFilters: (state, action: PayloadAction<BoardFilters>) => {
      if (state.board) {
        state.board.filters = action.payload;
      }
    },

    // Clear optimistic updates
    clearOptimisticUpdate: (state, action: PayloadAction<string>) => {
      state.optimisticUpdates = state.optimisticUpdates.filter(u => u.id !== action.payload);
    },

    // Reset board
    resetBoard: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.board = action.payload.board;
        state.columns = action.payload.columns;
        state.tasks = action.payload.tasks;
        state.error = null;
      })
      // Add task async
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        const { columnId, task } = action.payload as any;
        if (!state.tasks[columnId]) state.tasks[columnId] = [];
        // Avoid duplicates if the same task already exists
        const exists = state.tasks[columnId].some(t => t._id === task._id);
        if (!exists) {
          const dragTask: DragTask = {
            _id: String(task._id),
            title: task.title,
            description: task.description,
            status: ((task.status as any) ?? 'todo') as TaskStatus,
            priority: ((task.priority as any) ?? 'medium') as TaskPriority,
            dueDate: task.dueDate,
            assignees: (task.assignees || []).map((uid: any) => {
              const id = String(uid?.id || uid?._id || uid);
              const name: string = (uid?.name as string) || id?.slice(0, 2)?.toUpperCase() || 'U';
              return { id, name };
            }),
            columnId: (() => {
              const rawCol = (task as any).column;
              if (typeof rawCol === 'object' && rawCol) return String(rawCol._id || rawCol.id || columnId);
              return String(rawCol || columnId);
            })(),
            position: task.position ?? state.tasks[columnId].length,
            tags: task.tags || [],
            attachments: (task.attachments || []).length,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
          const targetCol = dragTask.columnId;
          if (!state.tasks[targetCol]) state.tasks[targetCol] = [];
          state.tasks[targetCol].push(dragTask);
          state.tasks[targetCol].forEach((t, idx) => { t.position = idx; });
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      })
      // Save task move
      .addCase(saveTaskMove.fulfilled, (state, action) => {
        // Clear the optimistic update for this move
        const updateId = `move-${action.payload.taskId}-`;
        state.optimisticUpdates = state.optimisticUpdates.filter(
          u => !u.id.startsWith(updateId)
        );
      })
      .addCase(saveTaskMove.rejected, (state, action) => {
        // Rollback on failure
        state.error = 'Failed to save task move';
        // In a real app, you'd rollback the optimistic update here
      })
      .addCase(createColumnAsync.fulfilled, (state, action) => {
        const column = action.payload;
        state.columns.push(column);
        state.tasks[column._id] = [];
        state.columns.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      });
  },
});

// Export actions
export const {
  startDrag,
  updateDragPosition,
  setDropTarget,
  endDrag,
  moveTaskOptimistic,
  reorderTasks,
  updateTask,
  addTask,
  deleteTask,
  selectTask,
  closeTaskDetails,
  addColumn,
  updateColumn,
  deleteColumn,
  setViewMode,
  setFilters,
  clearOptimisticUpdate,
  resetBoard,
} = dragBoardSlice.actions;

// Export reducer
export default dragBoardSlice.reducer;

// Selectors
export const selectBoard = (state: { dragBoard: DragBoardState }) => state.dragBoard.board;
export const selectColumns = (state: { dragBoard: DragBoardState }) => state.dragBoard.columns;
export const selectTasks = (state: { dragBoard: DragBoardState }) => state.dragBoard.tasks;
export const selectDragState = (state: { dragBoard: DragBoardState }) => state.dragBoard.dragState;
export const selectSelectedTask = (state: { dragBoard: DragBoardState }) => state.dragBoard.selectedTask;
export const selectIsTaskDetailsOpen = (state: { dragBoard: DragBoardState }) => state.dragBoard.isTaskDetailsOpen;
export const selectIsLoading = (state: { dragBoard: DragBoardState }) => state.dragBoard.loading;
export const selectError = (state: { dragBoard: DragBoardState }) => state.dragBoard.error;

// Memoized selectors for performance
export const selectTasksByColumn = (columnId: string) => (state: { dragBoard: DragBoardState }) => 
  state.dragBoard.tasks[columnId] || [];

export const selectColumnById = (columnId: string) => (state: { dragBoard: DragBoardState }) =>
  state.dragBoard.columns.find(c => c._id === columnId);
