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
    // Mock data for now - replace with actual API call
    const mockBoard: DragBoard = {
      _id: boardId,
      name: 'Task Board',
      description: 'Project task management board',
      spaceId: 'space-1',
      viewMode: 'kanban',
      columns: [],
    };
    
    const mockColumns: DragColumn[] = [
      {
        _id: 'col-1',
        name: 'To Do',
        boardId: boardId,
        position: 0,
        color: '#FEF3C7',
        tasks: [],
      },
      {
        _id: 'col-2',
        name: 'In Progress',
        boardId: boardId,
        position: 1,
        color: '#DBEAFE',
        tasks: [],
      },
      {
        _id: 'col-3',
        name: 'Review',
        boardId: boardId,
        position: 2,
        color: '#F3E8FF',
        tasks: [],
      },
      {
        _id: 'col-4',
        name: 'Done',
        boardId: boardId,
        position: 3,
        color: '#D1FAE5',
        tasks: [],
      },
    ];

    const mockTasks: Record<string, DragTask[]> = {
      'col-1': [
        {
          _id: 'task-1',
          title: 'Design new dashboard layout',
          description: 'Create wireframes and mockups for the new dashboard',
          status: 'todo',
          priority: 'high',
          dueDate: '2024-03-15',
          assignees: [
            { id: '1', name: 'Alice Johnson' },
            { id: '2', name: 'Bob Smith' },
          ],
          columnId: 'col-1',
          position: 0,
          comments: 3,
          attachments: 2,
          createdAt: '2024-03-01T10:00:00Z',
          updatedAt: '2024-03-01T10:00:00Z',
        },
        {
          _id: 'task-2',
          title: 'Implement user authentication',
          description: 'Set up secure login and registration system',
          status: 'todo',
          priority: 'urgent',
          dueDate: '2024-03-20',
          assignees: [{ id: '3', name: 'Carol Davis' }],
          columnId: 'col-1',
          position: 1,
          comments: 5,
          createdAt: '2024-03-02T10:00:00Z',
          updatedAt: '2024-03-02T10:00:00Z',
        },
      ],
      'col-2': [],
      'col-3': [],
      'col-4': [],
    };

    return { board: mockBoard, columns: mockColumns, tasks: mockTasks };
  }
);

export const saveTaskMove = createAsyncThunk(
  'dragBoard/saveTaskMove',
  async (payload: MoveTaskPayload) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return payload;
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
