// ============================================================================
// FRONTEND COMPREHENSIVE FILE: SPACE, BOARD, COLUMN, TASK MANAGEMENT
// ============================================================================
// This file contains all frontend code related to Space, Board, Column, and Task
// management including Redux slices, hooks, services, components, and layouts.
// ============================================================================

// ============================================================================
// SECTION 1: REDUX SLICES
// ============================================================================

// ============================================================================
// 1.1 TASK SLICE
// ============================================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Task, 
  TaskState, 
  CreateTaskForm, 
  UpdateTaskForm, 
  MoveTaskForm,
  TaskFilters 
} from '../../types/task.types';
import type { Column, Board } from '../../types/board.types';
import type { Space } from '../../types/space.types';
import { TaskService } from '../../services/taskService';
import { BoardService } from '../../services/boardService';
import { SpaceService } from '../../services/spaceService';

// Async thunks for API calls
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (boardId: string) => {
    const response = await TaskService.getTasks({ boardId });
    return response.data?.items || response.data || [];
  }
);

export const fetchBoard = createAsyncThunk(
  'tasks/fetchBoard',
  async (boardId: string) => {
    const response = await BoardService.getBoard(boardId);
    return response.data;
  }
);

export const fetchSpace = createAsyncThunk(
  'tasks/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskForm) => {
    const response = await TaskService.createTask(taskData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: UpdateTaskForm }) => {
    const response = await TaskService.updateTask(id, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await TaskService.deleteTask(taskId);
    return taskId;
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ id, moveData }: { id: string; moveData: MoveTaskForm }) => {
    const response = await TaskService.moveTask(id, moveData);
    return response.data;
  }
);

export const fetchTasksByColumn = createAsyncThunk(
  'tasks/fetchTasksByColumn',
  async (columnId: string) => {
    const response = await TaskService.getTasks({ columnId });
    return response.data?.items || response.data || [];
  }
);

export const fetchTasksBySpace = createAsyncThunk(
  'tasks/fetchTasksBySpace',
  async (spaceId: string) => {
    const response = await TaskService.getTasks({ spaceId });
    return response.data?.items || response.data || [];
  }
);

export const fetchBoardsBySpace = createAsyncThunk(
  'tasks/fetchBoardsBySpace',
  async (spaceId: string) => {
    const response = await BoardService.getBoardsBySpace(spaceId);
    return response.data || [];
  }
);

export const fetchColumnsByBoard = createAsyncThunk(
  'tasks/fetchColumnsByBoard',
  async (boardId: string) => {
    const response = await BoardService.getColumnsByBoard(boardId);
    return response.data || [];
  }
);

export const createColumn = createAsyncThunk(
  'tasks/createColumn',
  async ({ boardId, columnData }: { boardId: string; columnData: any }) => {
    const response = await BoardService.createColumn(boardId, columnData);
    return response.data;
  }
);

export const updateColumn = createAsyncThunk(
  'tasks/updateColumn',
  async ({ columnId, columnData }: { columnId: string; columnData: any }) => {
    const response = await BoardService.updateColumn(columnId, columnData);
    return response.data;
  }
);

export const deleteColumn = createAsyncThunk(
  'tasks/deleteColumn',
  async (columnId: string) => {
    await BoardService.deleteColumn(columnId);
    return columnId;
  }
);

export const reorderColumns = createAsyncThunk(
  'tasks/reorderColumns',
  async ({ boardId, columnIds }: { boardId: string; columnIds: string[] }) => {
    const response = await BoardService.reorderColumns(boardId, columnIds);
    return { boardId, columnIds };
  }
);

// Initial state
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assignee: [],
    tags: [],
  },
  sortBy: {
    field: 'createdAt',
    direction: 'desc',
  },
  searchQuery: '',
  columns: [],
  boards: [],
  spaces: [],
  currentBoard: null,
  currentSpace: null,
  comments: [],
  dragState: {
    isDragging: false,
    draggedTask: null,
    draggedColumn: null,
    sourceColumn: null,
    targetColumn: null,
  },
  socketConnected: false
};

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Set current task
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: [],
        priority: [],
        assignee: [],
        tags: [],
      };
    },
    
    // Update sort
    updateSort: (state, action: PayloadAction<{ field: keyof Task; direction: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload;
    },
    
    // Update search query
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Drag and drop state
    setDragState: (state, action: PayloadAction<Partial<TaskState['dragState']>>) => {
      state.dragState = { ...state.dragState, ...action.payload };
    },
    
    // Update task in real-time (for socket events)
    updateTaskRealTime: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    
    // Add task in real-time (for socket events)
    addTaskRealTime: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    
    // Remove task in real-time (for socket events)
    removeTaskRealTime: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
      if (state.currentTask?._id === action.payload) {
        state.currentTask = null;
      }
    },
    
    // Update column in real-time (for socket events)
    updateColumnRealTime: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(col => col._id === action.payload._id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    
    // Add column in real-time (for socket events)
    addColumnRealTime: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
    },
    
    // Remove column in real-time (for socket events)
    removeColumnRealTime: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(col => col._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      });

    // Fetch board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload as any;
        state.currentBoard = responseData.board;
        state.columns = responseData.columns || [];
        state.tasks = responseData.tasks || [];
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      });

    // Fetch space
    builder
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSpace = action.payload;
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch space';
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      });

    // Move task
    builder
      .addCase(moveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move task';
      });

    // Create column
    builder
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns.push(action.payload);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create column';
      });

    // Update column
    builder
      .addCase(updateColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.columns.findIndex(col => col._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update column';
      });

    // Delete column
    builder
      .addCase(deleteColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.loading = false;
        console.log('deleteColumn.fulfilled - removing columnId:', action.payload);
        state.columns = state.columns.filter(col => col._id !== action.payload);
        console.log('Columns after removal:', state.columns.length);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete column';
      });

    // Reorder columns
    builder
      .addCase(reorderColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderColumns.fulfilled, (state, action) => {
        state.loading = false;
        // Update column positions based on the new order
        const { columnIds } = action.payload;
        columnIds.forEach((columnId, index) => {
          const column = state.columns.find(col => col._id === columnId);
          if (column) {
            column.position = index;
          }
        });
        // Sort columns by position
        state.columns.sort((a, b) => a.position - b.position);
      })
      .addCase(reorderColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder columns';
      });
  }
});

export const {
  setCurrentTask,
  updateFilters,
  clearFilters,
  updateSort,
  updateSearchQuery,
  setSocketConnected,
  setDragState,
  updateTaskRealTime,
  addTaskRealTime,
  removeTaskRealTime,
  updateColumnRealTime,
  addColumnRealTime,
  removeColumnRealTime
} = taskSlice.actions;

export default taskSlice.reducer;

// ============================================================================
// 1.2 BOARD SLICE
// ============================================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Board, 
  BoardState 
} from '../../types/board.types';
import { BoardService } from '../../services/boardService';

// Async thunks for API calls
export const fetchBoardsBySpace = createAsyncThunk(
  'boards/fetchBoardsBySpace',
  async (spaceId: string) => {
    const response = await BoardService.getBoardsBySpace(spaceId);
    return response.data || [];
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData: any) => {
    const response = await BoardService.createBoard(boardData);
    return response.data;
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, boardData }: { id: string; boardData: any }) => {
    const response = await BoardService.updateBoard(id, boardData);
    return response.data;
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId: string) => {
    await BoardService.deleteBoard(boardId);
    return boardId;
  }
);

// Initial state
const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
  socketConnected: false
};

// Board slice
const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    // Set current board
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Update board in real-time (for socket events)
    updateBoardRealTime: (state, action: PayloadAction<Board>) => {
      const index = state.boards.findIndex(board => board._id === action.payload._id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
      if (state.currentBoard?._id === action.payload._id) {
        state.currentBoard = action.payload;
      }
    },
    
    // Add board in real-time (for socket events)
    addBoardRealTime: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
    
    // Remove board in real-time (for socket events)
    removeBoardRealTime: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter(board => board._id !== action.payload);
      if (state.currentBoard?._id === action.payload) {
        state.currentBoard = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch boards by space
    builder
      .addCase(fetchBoardsBySpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardsBySpace.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload as any;
        state.boards = responseData.boards || [];
      })
      .addCase(fetchBoardsBySpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch boards';
      });

    // Create board
    builder
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create board';
      });

    // Update board
    builder
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex(board => board._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update board';
      });

    // Delete board
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(board => board._id !== action.payload);
        if (state.currentBoard?._id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete board';
      });
  }
});

export const {
  setCurrentBoard,
  setSocketConnected: setBoardSocketConnected,
  updateBoardRealTime,
  addBoardRealTime,
  removeBoardRealTime
} = boardSlice.actions;

export default boardSlice.reducer;

// ============================================================================
// 1.3 COLUMN SLICE
// ============================================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Column, ColumnState } from '../../types/board.types';
import { BoardService } from '../../services/boardService';

// Async thunks for API calls
export const fetchColumnsByBoard = createAsyncThunk(
  'columns/fetchColumnsByBoard',
  async (boardId: string) => {
    const response = await BoardService.getColumnsByBoard(boardId);
    return response.data || [];
  }
);

export const createColumn = createAsyncThunk(
  'columns/createColumn',
  async (columnData: any) => {
    const response = await BoardService.createColumn(columnData);
    return response.data;
  }
);

export const updateColumn = createAsyncThunk(
  'columns/updateColumn',
  async ({ id, columnData }: { id: string; columnData: any }) => {
    const response = await BoardService.updateColumn(id, columnData);
    return response.data;
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/deleteColumn',
  async (columnId: string) => {
    await BoardService.deleteColumn(columnId);
    return columnId;
  }
);

export const reorderColumns = createAsyncThunk(
  'columns/reorderColumns',
  async ({ boardId, columnIds }: { boardId: string; columnIds: string[] }) => {
    const response = await BoardService.reorderColumns(boardId, columnIds);
    return { boardId, columnIds };
  }
);

// Initial state
const initialState: ColumnState = {
  columns: [],
  currentColumn: null,
  loading: false,
  error: null,
  socketConnected: false,
  dragState: {
    isDragging: false,
    draggedColumn: null,
    sourcePosition: null,
    targetPosition: null
  }
};

// Column slice
const columnSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Drag and drop state
    setDragState: (state, action: PayloadAction<Partial<ColumnState['dragState']>>) => {
      state.dragState = { ...state.dragState, ...action.payload };
    },
    
    // Start dragging column
    startDraggingColumn: (state, action: PayloadAction<{ column: Column; position: number }>) => {
      state.dragState = {
        isDragging: true,
        draggedColumn: action.payload.column,
        sourcePosition: action.payload.position,
        targetPosition: null
      };
    },
    
    // Stop dragging column
    stopDraggingColumn: (state) => {
      state.dragState = {
        isDragging: false,
        draggedColumn: null,
        sourcePosition: null,
        targetPosition: null
      };
    },
    
    // Update column in real-time (for socket events)
    updateColumnRealTime: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(col => col._id === action.payload._id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    
    // Add column in real-time (for socket events)
    addColumnRealTime: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
    },
    
    // Remove column in real-time (for socket events)
    removeColumnRealTime: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(col => col._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch columns by board
    builder
      .addCase(fetchColumnsByBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumnsByBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload;
      })
      .addCase(fetchColumnsByBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch columns';
      });

    // Create column
    builder
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns.push(action.payload);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create column';
      });

    // Update column
    builder
      .addCase(updateColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.columns.findIndex(col => col._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update column';
      });

    // Delete column
    builder
      .addCase(deleteColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = state.columns.filter(col => col._id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete column';
      });

    // Reorder columns
    builder
      .addCase(reorderColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderColumns.fulfilled, (state, action) => {
        state.loading = false;
        // Update column positions based on the new order
        const { columnIds } = action.payload;
        columnIds.forEach((columnId, index) => {
          const column = state.columns.find(col => col._id === columnId);
          if (column) {
            column.position = index;
          }
        });
        // Sort columns by position
        state.columns.sort((a, b) => a.position - b.position);
      })
      .addCase(reorderColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder columns';
      });
  }
});

export const {
  setSocketConnected: setColumnSocketConnected,
  setDragState: setColumnDragState,
  startDraggingColumn,
  stopDraggingColumn,
  updateColumnRealTime: updateColumnRealTimeSlice,
  addColumnRealTime: addColumnRealTimeSlice,
  removeColumnRealTime: removeColumnRealTimeSlice
} = columnSlice.actions;

export default columnSlice.reducer;

// ============================================================================
// 1.4 SPACE SLICE
// ============================================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Space, 
  SpaceState 
} from '../../types/space.types';
import { SpaceService } from '../../services/spaceService';

// Async thunks for API calls
export const fetchSpace = createAsyncThunk(
  'spaces/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    return response.data;
  }
);

export const fetchSpacesByWorkspace = createAsyncThunk(
  'spaces/fetchSpacesByWorkspace',
  async (workspaceId: string) => {
    const response = await SpaceService.getSpacesByWorkspace(workspaceId);
    return response.data || [];
  }
);

export const createSpace = createAsyncThunk(
  'spaces/createSpace',
  async (spaceData: any) => {
    const response = await SpaceService.createSpace(spaceData);
    return response.data;
  }
);

export const updateSpace = createAsyncThunk(
  'spaces/updateSpace',
  async ({ id, spaceData }: { id: string; spaceData: any }) => {
    const response = await SpaceService.updateSpace(id, spaceData);
    return response.data;
  }
);

export const deleteSpace = createAsyncThunk(
  'spaces/deleteSpace',
  async (spaceId: string) => {
    await SpaceService.deleteSpace(spaceId);
    return spaceId;
  }
);

export const getSpaceMembers = createAsyncThunk(
  'spaces/getSpaceMembers',
  async (spaceId: string) => {
    const response = await SpaceService.getSpaceMembers(spaceId);
    return response.data || [];
  }
);

export const addSpaceMember = createAsyncThunk(
  'spaces/addSpaceMember',
  async ({ spaceId, userId, role }: { spaceId: string; userId: string; role: string }) => {
    const response = await SpaceService.addSpaceMember(spaceId, userId, role);
    return response.data;
  }
);

export const removeSpaceMember = createAsyncThunk(
  'spaces/removeSpaceMember',
  async ({ spaceId, memberId }: { spaceId: string; memberId: string }) => {
    await SpaceService.removeSpaceMember(spaceId, memberId);
    return { spaceId, memberId };
  }
);

// Initial state
const initialState: SpaceState = {
  spaces: [],
  currentSpace: null,
  loading: false,
  error: null,
  socketConnected: false
};

// Space slice
const spaceSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    // Set current space
    setCurrentSpace: (state, action: PayloadAction<Space | null>) => {
      state.currentSpace = action.payload;
    },
    
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Update space in real-time (for socket events)
    updateSpaceRealTime: (state, action: PayloadAction<Space>) => {
      const index = state.spaces.findIndex(space => space._id === action.payload._id);
      if (index !== -1) {
        state.spaces[index] = action.payload;
      }
      if (state.currentSpace?._id === action.payload._id) {
        state.currentSpace = action.payload;
      }
    },
    
    // Add space in real-time (for socket events)
    addSpaceRealTime: (state, action: PayloadAction<Space>) => {
      state.spaces.push(action.payload);
    },
    
    // Remove space in real-time (for socket events)
    removeSpaceRealTime: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space._id !== action.payload);
      if (state.currentSpace?._id === action.payload) {
        state.currentSpace = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch space
    builder
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSpace = action.payload;
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch space';
      });

    // Fetch spaces by workspace
    builder
      .addCase(fetchSpacesByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpacesByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload as any;
        state.spaces = responseData.spaces || [];
      })
      .addCase(fetchSpacesByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch spaces';
      });

    // Create space
    builder
      .addCase(createSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces.push(action.payload);
      })
      .addCase(createSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create space';
      });

    // Update space
    builder
      .addCase(updateSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSpace.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.spaces.findIndex(space => space._id === action.payload._id);
        if (index !== -1) {
          state.spaces[index] = action.payload;
        }
        if (state.currentSpace?._id === action.payload._id) {
          state.currentSpace = action.payload;
        }
      })
      .addCase(updateSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update space';
      });

    // Delete space
    builder
      .addCase(deleteSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces = state.spaces.filter(space => space._id !== action.payload);
        if (state.currentSpace?._id === action.payload) {
          state.currentSpace = null;
        }
      })
      .addCase(deleteSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete space';
      });
  }
});

export const {
  setCurrentSpace,
  setSocketConnected: setSpaceSocketConnected,
  updateSpaceRealTime,
  addSpaceRealTime,
  removeSpaceRealTime
} = spaceSlice.actions;

export default spaceSlice.reducer;

// ============================================================================
// SECTION 6: COMPONENTS
// ============================================================================

// ============================================================================
// 6.1 BOARD COMPONENTS
// ============================================================================

// KanbanViewLayout Component
export const KanbanViewLayout: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const {
    currentBoard,
    boardLoading,
    boardError,
    columns,
    tasks,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    moveTask
  } = useTasks();

  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [boardId, dispatch]);

  useEffect(() => {
    if (boardError) {
      navigate('/spaces');
    }
  }, [boardError, navigate]);

  const handleAddColumn = async (columnData: Partial<Column>) => {
    if (!boardId) return;
    
    try {
      await createColumn({
        ...columnData,
        board: boardId,
        position: columns.length
      });
      setIsAddColumnModalOpen(false);
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const handleEditColumn = async (columnData: Partial<Column>) => {
    if (!editingColumn || !boardId) return;
    
    try {
      await updateColumn({
        ...columnData,
        _id: editingColumn._id,
        boardId
      });
      setIsEditColumnModalOpen(false);
      setEditingColumn(null);
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!boardId) return;
    
    try {
      await deleteColumn({ columnId, boardId });
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const handleReorderColumns = async (result: DropResult) => {
    if (!result.destination || !boardId) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    try {
      await reorderColumns({
        columns: items.map((col, index) => ({ _id: col._id, position: index })),
        boardId
      });
    } catch (error) {
      console.error('Error reordering columns:', error);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!boardId) return;
    
    try {
      await createTask({
        ...taskData,
        boardId,
        columnId: selectedColumn || taskData.columnId
      });
      setIsAddTaskModalOpen(false);
      setSelectedColumn(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleMoveTask = async (result: DropResult) => {
    if (!result.destination || !boardId) return;

    const { draggableId, source, destination } = result;
    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;

    try {
      await moveTask({
        taskId: draggableId,
        sourceColumnId,
        destinationColumnId,
        destinationIndex: destination.index,
        boardId
      });
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to task detail page or open task modal
    console.log('Task clicked:', task);
  };

  const openEditColumnModal = (column: Column) => {
    setEditingColumn(column);
    setIsEditColumnModalOpen(true);
  };

  const openAddTaskModal = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddTaskModalOpen(true);
  };

  if (boardLoading) {
    return <Loading />;
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="h4">Board not found</Typography>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <Typography variant="h3">{currentBoard.name}</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            {currentBoard.description}
          </Typography>
        </div>
        <Button onClick={() => setIsAddColumnModalOpen(true)}>
          Add Column
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DragDropContext onDragEnd={handleReorderColumns}>
          <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4 h-full"
              >
                {columns.map((column, index) => (
                  <DraggableColumn
                    key={column._id}
                    column={column}
                    index={index}
                    tasks={tasks.filter(task => task.column === column._id)}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => openAddTaskModal(column._id)}
                    onEditColumn={() => openEditColumnModal(column)}
                    onDeleteColumn={() => handleDeleteColumn(column._id)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modals */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSubmit={handleAddColumn}
      />

      <EditColumnModal
        isOpen={isEditColumnModalOpen}
        onClose={() => {
          setIsEditColumnModalOpen(false);
          setEditingColumn(null);
        }}
        onSubmit={handleEditColumn}
        column={editingColumn}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setSelectedColumn(null);
        }}
        onSubmit={handleAddTask}
        selectedColumn={selectedColumn}
        selectedBoard={boardId}
        columns={columns}
      />
    </div>
  );
};

// DraggableColumn Component
interface DraggableColumnProps {
  column: Column;
  tasks: Task[];
  index: number;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
}

export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column, tasks, index, onTaskClick, onAddTask, onEditColumn, onDeleteColumn,
}) => {
  console.log('DraggableColumn render:', {
    columnId: column._id,
    columnName: column.name,
    index,
    tasksCount: tasks.length
  });

  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-80 flex-shrink-0 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <div className="bg-card border rounded-lg h-full flex flex-col">
            {/* Column Header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between p-3 border-b"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <Typography variant="h4" className="font-medium">
                  {column.name}
                </Typography>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditColumn}
                  className="h-8 w-8 p-0"
                >
                  ⚙️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteColumn}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  🗑️
                </Button>
              </div>
            </div>

            {/* Tasks */}
            <Droppable droppableId={column._id} type="TASK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-2 space-y-2 overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-muted/50' : ''
                  }`}
                >
                  {tasks.map((task, taskIndex) => (
                    <DraggableTask
                      key={task._id}
                      task={task}
                      index={taskIndex}
                      columnId={column._id}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Task Button */}
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddTask}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                + Add Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// DraggableTask Component
interface DraggableTaskProps {
  task: Task;
  index: number;
  columnId: string;
  onClick: () => void;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task, index, columnId, onClick,
}) => {
  console.log('DraggableTask render:', {
    taskId: task._id,
    taskTitle: task.title,
    index,
    columnId
  });

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-background border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'opacity-75 shadow-lg' : ''
          }`}
        >
          <Typography variant="body-medium" className="font-medium mb-2">
            {task.title}
          </Typography>
          
          {task.description && (
            <Typography variant="body-small" className="text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </Typography>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.priority && (
                <Badge
                  variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              )}
              {task.dueDate && (
                <Typography variant="body-small" className="text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              )}
            </div>
            
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                  >
                    {typeof assignee === 'string' ? assignee.charAt(0).toUpperCase() : 'U'}
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center border-2 border-background">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// ============================================================================
// 6.2 MODAL COMPONENTS
// ============================================================================

// AddColumnModal Component
interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (columnData: Partial<Column>) => Promise<void>;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen, onClose, onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#e2e8f0',
    wipLimit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', color: '#e2e8f0', wipLimit: 0 });
    } catch (error) {
      console.error('Error creating column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Column Name *
          </Typography>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter column name"
            required
          />
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Color
          </Typography>
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            WIP Limit (0 = no limit)
          </Typography>
          <Input
            type="number"
            min="0"
            value={formData.wipLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, wipLimit: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Column'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// EditColumnModal Component
interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (columnData: Partial<Column>) => Promise<void>;
  column: Column | null;
}

export const EditColumnModal: React.FC<EditColumnModalProps> = ({
  isOpen, onClose, onSubmit, column
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#e2e8f0',
    wipLimit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
        color: column.color,
        wipLimit: column.wipLimit || 0
      });
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !column) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error updating column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Column">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Column Name *
          </Typography>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter column name"
            required
          />
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Color
          </Typography>
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            WIP Limit (0 = no limit)
          </Typography>
          <Input
            type="number"
            min="0"
            value={formData.wipLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, wipLimit: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Column'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// AddTaskModal Component
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  selectedColumn?: string;
  selectedBoard?: string;
  columns?: Column[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen, onClose, onSubmit, selectedColumn, selectedBoard, columns = []
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    board: selectedBoard || '',
    column: selectedColumn || '',
    estimatedHours: 0,
    dueDate: '',
    tags: [],
    assignees: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (selectedColumn) {
      setFormData(prev => ({ ...prev, column: selectedColumn }));
    }
    if (selectedBoard) {
      setFormData(prev => ({ ...prev, board: selectedBoard }));
    }
  }, [selectedColumn, selectedBoard]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await UserService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    // Column validation - only required if no column is pre-selected
    if (!selectedColumn && !formData.column) {
      newErrors.column = 'Please select a column';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        title: formData.title || '',
        description: formData.description || '',
        boardId: formData.board || '', // Changed from formData.board
        columnId: formData.column || '', // Changed from formData.column
        priority: formData.priority || 'medium',
        status: formData.status || 'todo',
        estimatedHours: formData.estimatedHours || 0,
        dueDate: formData.dueDate || '',
        tags: formData.tags || [],
        assignees: formData.assignees || [],
      };
      await onSubmit(taskData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        board: selectedBoard || '',
        column: selectedColumn || '',
        estimatedHours: 0,
        dueDate: '',
        tags: [],
        assignees: [],
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Title *
          </Typography>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter task title"
            required
            className={errors.title ? 'border-error' : ''}
          />
          {errors.title && (
            <Typography variant="body-small" className="mt-1 text-error">
              {errors.title}
            </Typography>
          )}
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Description
          </Typography>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter task description"
            className="w-full p-2 border border-border rounded-lg resize-none h-20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Priority
            </Typography>
            <Select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <SelectOption value="low">Low</SelectOption>
              <SelectOption value="medium">Medium</SelectOption>
              <SelectOption value="high">High</SelectOption>
            </Select>
          </div>

          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Status
            </Typography>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <SelectOption value="todo">To Do</SelectOption>
              <SelectOption value="in_progress">In Progress</SelectOption>
              <SelectOption value="review">Review</SelectOption>
              <SelectOption value="done">Done</SelectOption>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Estimated Hours
            </Typography>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Due Date
            </Typography>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Assignees
          </Typography>
          <Select
            multiple
            value={formData.assignees}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              handleInputChange('assignees', values);
            }}
            disabled={isLoadingUsers}
          >
            {users.map(user => (
              <SelectOption key={user._id} value={user._id}>
                {user.name} ({user.email})
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Only show column selection if no column is pre-selected */}
        {!selectedColumn && (
          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Column *
            </Typography>
            <Select
              value={formData.column}
              onChange={(e) => handleInputChange('column', e.target.value)}
              required
              className={errors.column ? 'border-error' : ''}
            >
              <SelectOption value="">Select column</SelectOption>
              {columns.map(column => (
                <SelectOption key={column._id} value={column._id}>
                  {column.name}
                </SelectOption>
              ))}
            </Select>
            {errors.column && (
              <Typography variant="body-small" className="mt-1 text-error">
                {errors.column}
              </Typography>
            )}
          </div>
        )}
        
        {/* Show selected column info if column is pre-selected */}
        {selectedColumn && (
          <div>
            <Typography variant="body-small" className="mb-1 text-muted-foreground">
              Column
            </Typography>
            <div className="p-3 border border-border rounded-lg bg-muted/20">
              <Typography variant="body-medium" className="font-medium">
                {columns.find(col => col._id === selectedColumn)?.name || 'Unknown Column'}
              </Typography>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// SECTION 7: LAYOUTS
// ============================================================================

// ============================================================================
// 7.1 BOARD LAYOUTS
// ============================================================================

// ListViewLayout Component
export const ListViewLayout: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useAppDispatch();
  
  const {
    currentBoard,
    boardLoading,
    boardError,
    columns,
    tasks
  } = useTasks();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [boardId, dispatch]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(task => 
        task.assignees && task.assignees.includes(selectedAssignee)
      );
    }

    return filtered;
  }, [tasks, selectedStatus, selectedPriority, selectedAssignee]);

  if (boardLoading) {
    return <Loading />;
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="h4">Board not found</Typography>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <Typography variant="h3">{currentBoard.name}</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            {currentBoard.description}
          </Typography>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 border-b">
        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Status
          </Typography>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <SelectOption value="all">All Status</SelectOption>
            <SelectOption value="todo">To Do</SelectOption>
            <SelectOption value="in_progress">In Progress</SelectOption>
            <SelectOption value="review">Review</SelectOption>
            <SelectOption value="done">Done</SelectOption>
          </Select>
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Priority
          </Typography>
          <Select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <SelectOption value="all">All Priority</SelectOption>
            <SelectOption value="low">Low</SelectOption>
            <SelectOption value="medium">Medium</SelectOption>
            <SelectOption value="high">High</SelectOption>
          </Select>
        </div>

        <div>
          <Typography variant="body-small" className="mb-1 text-muted-foreground">
            Assignee
          </Typography>
          <Select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          >
            <SelectOption value="all">All Assignees</SelectOption>
            <SelectOption value="unassigned">Unassigned</SelectOption>
            {/* Add more assignee options */}
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                  <Typography variant="body-medium" className="font-medium">
                    {task.title}
                  </Typography>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.dueDate && (
                    <Typography variant="body-small" className="text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 3).map((assignee, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                        >
                          {typeof assignee === 'string' ? assignee.charAt(0).toUpperCase() : 'U'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {task.description && (
                <Typography variant="body-small" className="text-muted-foreground mt-2">
                  {task.description}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// TimelineViewLayout Component
export const TimelineViewLayout: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useAppDispatch();
  
  const {
    currentBoard,
    boardLoading,
    boardError,
    tasks
  } = useTasks();

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [boardId, dispatch]);

  if (boardLoading) {
    return <Loading />;
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="h4">Board not found</Typography>
      </div>
    );
  }

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const date = new Date(task.dueDate).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <Typography variant="h3">{currentBoard.name}</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            {currentBoard.description}
          </Typography>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(tasksByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateTasks]) => (
              <div key={date}>
                <Typography variant="h4" className="mb-3">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                
                <div className="space-y-2">
                  {dateTasks.map(task => (
                    <div
                      key={task._id}
                      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                          <Typography variant="body-medium" className="font-medium">
                            {task.title}
                          </Typography>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex -space-x-1">
                              {task.assignees.slice(0, 3).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                                >
                                  {typeof assignee === 'string' ? assignee.charAt(0).toUpperCase() : 'U'}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <Typography variant="body-small" className="text-muted-foreground mt-2">
                          {task.description}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7.2 SPACE LAYOUTS
// ============================================================================

// SpaceHeader Component
export const SpaceHeader: React.FC<{ spaceId: string }> = ({ spaceId }) => {
  const dispatch = useAppDispatch();
  const { currentSpace, spaceLoading } = useAppSelector((state) => state.space);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (spaceId) {
      dispatch(fetchSpace(spaceId));
    }
  }, [spaceId, dispatch]);

  if (spaceLoading || !currentSpace) {
    return <Loading />;
  }

  return (
    <div className="bg-card border-b p-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">{currentSpace.name}</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            {currentSpace.description}
          </Typography>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Space Members */}
          <div className="flex items-center gap-2">
            <Typography variant="body-small" className="text-muted-foreground">
              Members:
            </Typography>
            <div className="flex -space-x-1">
              {currentSpace.members?.slice(0, 5).map((member, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center border-2 border-background"
                  title={member.user?.name || 'Unknown User'}
                >
                  {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              ))}
              {currentSpace.members && currentSpace.members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center border-2 border-background">
                  +{currentSpace.members.length - 5}
                </div>
              )}
            </div>
          </div>
          
          {/* Add Member Button */}
          {user && currentSpace.owner === user._id && (
            <Button variant="outline" size="sm">
              Add Member
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// SpacePage Component
export const SpacePage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentSpace, spaceLoading, spaceError } = useAppSelector((state) => state.space);
  const { boards, boardsLoading } = useAppSelector((state) => state.board);

  useEffect(() => {
    if (spaceId) {
      dispatch(fetchSpace(spaceId));
      dispatch(fetchBoardsBySpace(spaceId));
    }
  }, [spaceId, dispatch]);

  useEffect(() => {
    if (spaceError) {
      navigate('/spaces');
    }
  }, [spaceError, navigate]);

  const handleCreateBoard = () => {
    // Navigate to board creation page or open modal
    navigate(`/spaces/${spaceId}/boards/new`);
  };

  const handleBoardClick = (board: Board) => {
    navigate(`/boards/${board._id}`);
  };

  if (spaceLoading) {
    return <Loading />;
  }

  if (!currentSpace) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="h4">Space not found</Typography>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <SpaceHeader spaceId={spaceId!} />
      
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h3">Boards</Typography>
          <Button onClick={handleCreateBoard}>
            Create Board
          </Button>
        </div>

        {boardsLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <div
                key={board._id}
                onClick={() => handleBoardClick(board)}
                className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Typography variant="h4" className="mb-2">
                  {board.name}
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground mb-3">
                  {board.description}
                </Typography>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {board.type}
                  </Badge>
                  <Typography variant="body-small" className="text-muted-foreground">
                    {board.columns?.length || 0} columns
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
