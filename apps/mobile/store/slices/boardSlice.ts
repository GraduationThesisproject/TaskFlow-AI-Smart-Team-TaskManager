import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Board, 
  BoardState 
} from '../../types/board.types';
import { BoardService } from '../../services/boardService';

// Async thunks for API calls
export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId: string) => {
    const response = await BoardService.getBoard(boardId);
    return response.data;
  }
);

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
    // Fetch single board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
        // Also add to boards array if not already present
        const existingIndex = state.boards.findIndex(board => board._id === action.payload._id);
        if (existingIndex === -1) {
          state.boards.push(action.payload);
        } else {
          state.boards[existingIndex] = action.payload;
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      });

    // Fetch boards by space
    builder
      .addCase(fetchBoardsBySpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardsBySpace.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload as any;
        // Support both shapes: array or { boards: [...] } or { data: [...] }
        if (Array.isArray(responseData)) {
          state.boards = responseData;
        } else if (responseData && Array.isArray(responseData.boards)) {
          state.boards = responseData.boards;
        } else if (responseData && Array.isArray(responseData.data)) {
          state.boards = responseData.data;
        } else {
          state.boards = [];
        }
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
        // The response might have a board property or be the board directly
        const responseData = action.payload as any;
        const board = responseData.board || responseData;
        if (board) {
          state.boards.push(board);
        }
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

// Export actions
export const {
  setCurrentBoard,
  setSocketConnected,
  updateBoardRealTime,
  addBoardRealTime,
  removeBoardRealTime
} = boardSlice.actions;

// Export reducer
export default boardSlice.reducer;

// Selectors
export const selectBoards = (state: { boards: BoardState }) => state.boards.boards;
export const selectCurrentBoard = (state: { boards: BoardState }) => state.boards.currentBoard;
export const selectBoardLoading = (state: { boards: BoardState }) => state.boards.loading;
export const selectBoardError = (state: { boards: BoardState }) => state.boards.error;
export const selectBoardSocketConnected = (state: { boards: BoardState }) => state.boards.socketConnected;
