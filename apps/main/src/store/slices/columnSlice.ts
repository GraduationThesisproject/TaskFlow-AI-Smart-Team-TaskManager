import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Column, ColumnState } from '../../types/board.types';
import { BoardService } from '../../services/boardService';
import { TaskService } from '../../services/taskService';

// Async thunks for API calls
export const fetchColumnsByBoard = createAsyncThunk(
  'columns/fetchColumnsByBoard',
  async (boardId: string) => {
    console.log('🔄 fetchColumnsByBoard called with boardId:', boardId);
    
    const response = await BoardService.getColumnsByBoard(boardId);
    console.log('📋 Raw API response:', response);
    
    // Handle different possible response structures
    let columns: any[] = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        columns = response.data;
      } else if (response.data.columns && Array.isArray(response.data.columns)) {
        columns = response.data.columns;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        columns = response.data.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        columns = [];
      }
    }
    
    console.log('📋 Processed columns:', columns.length, columns);
    
    // Ensure columns is an array
    if (!Array.isArray(columns)) {
      console.error('Columns is not an array:', columns);
      columns = [];
    }
    
    // Fetch all tasks for the board at once (more efficient)
    let allTasks: any[] = [];
    try {
      const tasksResponse = await TaskService.getTasks({ boardId });
      console.log('📝 Raw tasks response:', tasksResponse);
      
      // Handle different possible response structures
      if (tasksResponse.data) {
        if (Array.isArray(tasksResponse.data)) {
          allTasks = tasksResponse.data;
        } else if (tasksResponse.data.data && Array.isArray(tasksResponse.data.data)) {
          allTasks = tasksResponse.data.data;
        } else if (tasksResponse.data.tasks && Array.isArray(tasksResponse.data.tasks)) {
          allTasks = tasksResponse.data.tasks;
        } else if (tasksResponse.data.tasks && tasksResponse.data.tasks.data && Array.isArray(tasksResponse.data.tasks.data)) {
          // Handle nested structure: data.tasks.data
          allTasks = tasksResponse.data.tasks.data;
        } else if (tasksResponse.data.items && Array.isArray(tasksResponse.data.items)) {
          allTasks = tasksResponse.data.items;
        } else {
          console.error('Unexpected tasks response structure:', tasksResponse.data);
          allTasks = [];
        }
      }
      
      console.log('📝 Processed tasks:', allTasks.length, allTasks);
      
      // Debug: Show task structure for first few tasks
      if (allTasks.length > 0) {
        console.log('🔍 Sample task structure:', allTasks[0]);
        console.log('🔍 Task column references:', allTasks.slice(0, 3).map(t => ({ 
          taskId: t._id, 
          column: t.column, 
          columnType: typeof t.column,
          columnId: typeof t.column === 'string' ? t.column : t.column?._id
        })));
      }
    } catch (error) {
      console.error(`Failed to fetch tasks for board ${boardId}:`, error);
    }
    
    // Ensure allTasks is an array
    if (!Array.isArray(allTasks)) {
      console.error('AllTasks is not an array:', allTasks);
      allTasks = [];
    }
    
    // Distribute tasks to their respective columns
    const columnsWithTasks = columns.map((column: Column) => {
      const columnTasks = allTasks.filter(task => {
        const taskColumnId = typeof task.column === 'string' ? task.column : task.column?._id;
        const matches = taskColumnId === column._id;
        if (matches) {
          console.log(`🎯 Task ${task._id} matches column ${column.name} (${column._id})`);
        }
        return matches;
      });
      console.log(`📊 Column ${column.name} (${column._id}) has ${columnTasks.length} tasks:`, columnTasks.map(t => t._id));
      return { ...column, tasks: columnTasks };
    });
    
    console.log('✅ Returning columns with tasks:', columnsWithTasks);
    return columnsWithTasks;
  }
);

export const createColumn = createAsyncThunk(
  'columns/createColumn',
  async ({ boardId, columnData }: { boardId: string; columnData: any }) => {
    console.log('🔄 Creating column:', { boardId, columnData });
    const response = await BoardService.createColumn({ ...columnData, boardId: boardId });
    console.log('✅ Column created:', response.data);
    return response.data;
  }
);

export const updateColumn = createAsyncThunk(
  'columns/updateColumn',
  async ({ columnId, columnData }: { columnId: string; columnData: any }) => {
    console.log('🔄 Updating column:', { columnId, columnData });
    const response = await BoardService.updateColumn(columnId, columnData);
    console.log('✅ Column updated:', response.data);
    return response.data;
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/deleteColumn',
  async (columnId: string) => {
    console.log('🔄 Deleting column:', columnId);
    await BoardService.deleteColumn(columnId);
    console.log('✅ Column deleted:', columnId);
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
        // Preserve existing tasks when updating column
        const existingColumn = state.columns[index];
        const updatedColumn = {
          ...action.payload,
          tasks: action.payload.tasks || existingColumn.tasks || []
        };
        state.columns[index] = updatedColumn;
      }
    },
    
    // Add column in real-time (for socket events)
    addColumnRealTime: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
    },

    // Add column only if it doesn't already exist (for board:state events)
    addColumnIfNotExists: (state, action: PayloadAction<Column>) => {
      const existingColumn = state.columns.find(col => col._id === action.payload._id);
      if (!existingColumn) {
        state.columns.push(action.payload);
      }
    },
    
    // Remove column in real-time (for socket events)
    removeColumnRealTime: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(col => col._id !== action.payload);
    },

    // Update column positions in real-time (for socket events)
    updateColumnPositionsRealTime: (state, action: PayloadAction<Array<{ columnId: string; position: number }>>) => {
      if (Array.isArray(action.payload)) {
        // Update positions for each column
        action.payload.forEach(({ columnId, position }) => {
          const column = state.columns.find(col => col._id === columnId);
          if (column) {
            column.position = position;
          }
        });
        // Sort columns by position to maintain order
        state.columns.sort((a, b) => (a.position || 0) - (b.position || 0));
      }
    },

    // Task operations within columns
    addTaskToColumn: (state, action: PayloadAction<{ columnId: string; task: any }>) => {
      const { columnId, task } = action.payload;
      console.log('📦 addTaskToColumn called with:', { columnId, taskId: task._id });
      console.log('📦 Available columns:', state.columns.map(col => ({ id: col._id, name: col.name })));
      
      const column = state.columns.find(col => col._id === columnId);
      if (column) {
        if (!column.tasks) {
          column.tasks = [];
        }
        column.tasks.push(task);
        // Update stats
        column.stats.totalTasks = column.tasks.length;
        console.log('📦 Added task to column in Redux state:', { columnId, columnName: column.name, taskId: task._id, totalTasks: column.tasks.length });
      } else {
        console.error('❌ Column not found for columnId:', columnId);
        console.error('❌ Available column IDs:', state.columns.map(col => col._id));
      }
    },

    updateTaskInColumn: (state, action: PayloadAction<{ columnId: string; taskId: string; taskData: any }>) => {
      const { columnId, taskId, taskData } = action.payload;
      const column = state.columns.find(col => col._id === columnId);
      if (column && column.tasks) {
        const taskIndex = column.tasks.findIndex(task => task._id === taskId);
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...taskData };
          console.log('📦 Updated task in column in Redux state:', { columnId, taskId, taskData });
        }
      }
    },

    removeTaskFromColumn: (state, action: PayloadAction<{ columnId: string; taskId: string }>) => {
      const { columnId, taskId } = action.payload;
      const column = state.columns.find(col => col._id === columnId);
      if (column && column.tasks) {
        column.tasks = column.tasks.filter(task => task._id !== taskId);
        // Update stats
        column.stats.totalTasks = column.tasks.length;
        console.log('📦 Removed task from column in Redux state:', { columnId, taskId, totalTasks: column.tasks.length });
      }
    },

    moveTaskBetweenColumns: (state, action: PayloadAction<{ 
      sourceColumnId: string; 
      targetColumnId: string; 
      taskId: string; 
      targetPosition: number 
    }>) => {
      const { sourceColumnId, targetColumnId, taskId, targetPosition } = action.payload;
      
      // Find source and target columns
      const sourceColumn = state.columns.find(col => col._id === sourceColumnId);
      const targetColumn = state.columns.find(col => col._id === targetColumnId);
      
      if (sourceColumn && targetColumn && sourceColumn.tasks) {
        // Find and remove task from source column
        const taskIndex = sourceColumn.tasks.findIndex(task => task._id === taskId);
        if (taskIndex !== -1) {
          const task = sourceColumn.tasks[taskIndex];
          sourceColumn.tasks.splice(taskIndex, 1);
          
          // Add task to target column
          if (!targetColumn.tasks) {
            targetColumn.tasks = [];
          }
          targetColumn.tasks.splice(targetPosition, 0, task);
          
          // Update stats
          sourceColumn.stats.totalTasks = sourceColumn.tasks.length;
          targetColumn.stats.totalTasks = targetColumn.tasks.length;
        }
      }
    },

    // Load tasks into columns
    loadTasksIntoColumns: (state, action: PayloadAction<{ columnId: string; tasks: any[] }>) => {
      const { columnId, tasks } = action.payload;
      const column = state.columns.find(col => col._id === columnId);
      if (column) {
        column.tasks = tasks;
        column.stats.totalTasks = tasks.length;
      }
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
        // The payload is already the columns with tasks array
        state.columns = action.payload || [];
        console.log('📦 Stored columns in Redux state:', state.columns.length, state.columns);
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
        // Handle nested column structure from API response
        const responseData = action.payload as any;
        const column = responseData.column || responseData;
        // Add tasks array to the new column
        const columnWithTasks = { ...column, tasks: [] };
        state.columns.push(columnWithTasks);
        console.log('📦 Added new column to Redux state:', columnWithTasks);
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
        // Handle nested column structure from API response
        const responseData = action.payload as any;
        const column = responseData.column || responseData;
        const index = state.columns.findIndex(col => col._id === column._id);
        if (index !== -1) {
          // Preserve existing tasks when updating column
          const existingTasks = state.columns[index].tasks || [];
          state.columns[index] = { ...column, tasks: existingTasks };
          console.log('📦 Updated column in Redux state:', state.columns[index]);
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
        const deletedColumnId = action.payload;
        state.columns = state.columns.filter(col => col._id !== deletedColumnId);
        console.log('📦 Removed column from Redux state:', deletedColumnId);
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
        state.columns = state.columns
          .sort((a, b) => {
            const aIndex = columnIds.indexOf(a._id);
            const bIndex = columnIds.indexOf(b._id);
            return aIndex - bIndex;
          })
          .map((column, index) => ({
            ...column,
            position: index
          }));
      })
      .addCase(reorderColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder columns';
      });
  }
});

// Export actions
export const {
  setSocketConnected,
  setDragState,
  startDraggingColumn,
  stopDraggingColumn,
  updateColumnRealTime,
  addColumnRealTime,
  addColumnIfNotExists,
  removeColumnRealTime,
  updateColumnPositionsRealTime,
  addTaskToColumn,
  updateTaskInColumn,
  removeTaskFromColumn,
  moveTaskBetweenColumns,
  loadTasksIntoColumns
} = columnSlice.actions;

// Export reducer
export default columnSlice.reducer;

// Selectors
export const selectColumns = (state: { columns: ColumnState }) => state.columns.columns;
export const selectColumnLoading = (state: { columns: ColumnState }) => state.columns.loading;
export const selectColumnError = (state: { columns: ColumnState }) => state.columns.error;
export const selectColumnSocketConnected = (state: { columns: ColumnState }) => state.columns.socketConnected;
export const selectColumnDragState = (state: { columns: ColumnState }) => state.columns.dragState;

// Computed selectors
export const selectColumnsByBoard = (state: { columns: ColumnState }, boardId: string) => {
  return state.columns.columns.filter(col => col.board === boardId);
};

export const selectSortedColumns = (state: { columns: ColumnState }) => {
  return [...state.columns.columns].sort((a, b) => a.position - b.position);
};
