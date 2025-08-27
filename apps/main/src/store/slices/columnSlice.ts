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
        state.columns = state.columns.sort((a, b) => {
          const aIndex = columnIds.indexOf(a._id);
          const bIndex = columnIds.indexOf(b._id);
          return aIndex - bIndex;
        });
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
  removeColumnRealTime
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
