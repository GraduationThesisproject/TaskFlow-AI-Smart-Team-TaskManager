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

// Tag operations
export const addTagToBoard = createAsyncThunk(
  'boards/addTagToBoard',
  async ({ boardId, tag }: { boardId: string; tag: { name: string; color: string } }) => {
    const response = await BoardService.addTagToBoard(boardId, tag);
    return response.data;
  }
);

export const updateBoardTag = createAsyncThunk(
  'boards/updateBoardTag',
  async ({ boardId, tagName, updates }: { boardId: string; tagName: string; updates: { name?: string; color?: string } }) => {
    const response = await BoardService.updateBoardTag(boardId, tagName, updates);
    return response.data;
  }
);

export const removeTagFromBoard = createAsyncThunk(
  'boards/removeTagFromBoard',
  async ({ boardId, tagName }: { boardId: string; tagName: string }) => {
    const response = await BoardService.removeTagFromBoard(boardId, tagName);
    return response.data;
  }
);

export const fetchBoardTags = createAsyncThunk(
  'boards/fetchBoardTags',
  async (boardId: string) => {
    const response = await BoardService.getBoardTags(boardId);
    return response.data;
  }
);

// Archive board
export const archiveBoard = createAsyncThunk(
  'boards/archiveBoard',
  async (boardId: string) => {
    const response = await BoardService.archiveBoard(boardId);
    return response.data;
  }
);

// Unarchive board
export const unarchiveBoard = createAsyncThunk(
  'boards/unarchiveBoard',
  async (boardId: string) => {
    const response = await BoardService.unarchiveBoard(boardId);
    return response.data;
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
    
    // Board tag real-time operations
    addBoardTagRealTime: (state, action: PayloadAction<{ boardId: string; tag: { name: string; color: string } }>) => {
      const { boardId, tag } = action.payload;
      
      const boardIndex = state.boards.findIndex(board => board._id === boardId);
      if (boardIndex !== -1) {
        if (!state.boards[boardIndex].tags) {
          state.boards[boardIndex].tags = [];
        }
        state.boards[boardIndex].tags.push(tag);
      }
      if (state.currentBoard?._id === boardId) {
        if (!state.currentBoard.tags) {
          state.currentBoard.tags = [];
        }
        state.currentBoard.tags.push(tag);
      }
    },
    
    updateBoardTagRealTime: (state, action: PayloadAction<{ boardId: string; oldTagName: string; tag: { name: string; color: string } }>) => {
      const { boardId, oldTagName, tag } = action.payload;
      const boardIndex = state.boards.findIndex(board => board._id === boardId);
      if (boardIndex !== -1 && state.boards[boardIndex].tags) {
        const tagIndex = state.boards[boardIndex].tags.findIndex(t => t.name === oldTagName);
        if (tagIndex !== -1) {
          state.boards[boardIndex].tags[tagIndex] = tag;
        }
      }
      if (state.currentBoard?._id === boardId && state.currentBoard.tags) {
        const tagIndex = state.currentBoard.tags.findIndex(t => t.name === oldTagName);
        if (tagIndex !== -1) {
          state.currentBoard.tags[tagIndex] = tag;
        }
      }
    },
    
    removeBoardTagRealTime: (state, action: PayloadAction<{ boardId: string; tagName: string }>) => {
      const { boardId, tagName } = action.payload;
      const boardIndex = state.boards.findIndex(board => board._id === boardId);
      if (boardIndex !== -1 && state.boards[boardIndex].tags) {
        state.boards[boardIndex].tags = state.boards[boardIndex].tags.filter(t => t.name !== tagName);
      }
      if (state.currentBoard?._id === boardId && state.currentBoard.tags) {
        state.currentBoard.tags = state.currentBoard.tags.filter(t => t.name !== tagName);
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
        // Remove columns from board data since they're managed separately in columnSlice
        const { columns, ...boardWithoutColumns } = action.payload;
        state.currentBoard = boardWithoutColumns;
        // Also add to boards array if not already present
        const existingIndex = state.boards.findIndex(board => board._id === action.payload._id);
        if (existingIndex === -1) {
          state.boards.push(boardWithoutColumns);
        } else {
          state.boards[existingIndex] = boardWithoutColumns;
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
        // Remove columns from each board since they're managed separately in columnSlice
        const boardsWithoutColumns = (responseData.boards || []).map((board: any) => {
          const { columns, ...boardWithoutColumns } = board;
          return boardWithoutColumns;
        });
        state.boards = boardsWithoutColumns;
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
          // Remove columns from board since they're managed separately in columnSlice
          const { columns, ...boardWithoutColumns } = board;
          state.boards.push(boardWithoutColumns);
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
        // Remove columns from board since they're managed separately in columnSlice
        const { columns, ...boardWithoutColumns } = action.payload;
        const index = state.boards.findIndex(board => board._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = boardWithoutColumns;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = boardWithoutColumns;
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
    
    // Tag operations
    builder
      .addCase(addTagToBoard.fulfilled, (state, action) => {
        const updatedBoard = action.payload;
        const index = state.boards.findIndex(board => board._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        if (state.currentBoard?._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(updateBoardTag.fulfilled, (state, action) => {
        const updatedBoard = action.payload;
        const index = state.boards.findIndex(board => board._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        if (state.currentBoard?._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(removeTagFromBoard.fulfilled, (state, action) => {
        const updatedBoard = action.payload;
        const index = state.boards.findIndex(board => board._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        if (state.currentBoard?._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      });

    // Archive board
    builder
      .addCase(archiveBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBoard = action.payload;
        const index = state.boards.findIndex(board => board._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        if (state.currentBoard?._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(archiveBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to archive board';
      });

    // Unarchive board
    builder
      .addCase(unarchiveBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unarchiveBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBoard = action.payload;
        const index = state.boards.findIndex(board => board._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        if (state.currentBoard?._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(unarchiveBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unarchive board';
      });
  }
});

// Export actions
export const {
  setCurrentBoard,
  setSocketConnected,
  updateBoardRealTime,
  addBoardRealTime,
  removeBoardRealTime,
  addBoardTagRealTime,
  updateBoardTagRealTime,
  removeBoardTagRealTime
} = boardSlice.actions;

// Export reducer
export default boardSlice.reducer;

// Selectors
export const selectBoards = (state: { boards: BoardState }) => state.boards.boards;
export const selectCurrentBoard = (state: { boards: BoardState }) => state.boards.currentBoard;
export const selectBoardLoading = (state: { boards: BoardState }) => state.boards.loading;
export const selectBoardError = (state: { boards: BoardState }) => state.boards.error;
export const selectBoardSocketConnected = (state: { boards: BoardState }) => state.boards.socketConnected;
