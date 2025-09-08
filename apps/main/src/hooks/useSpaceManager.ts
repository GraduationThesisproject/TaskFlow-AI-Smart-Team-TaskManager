import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { Space } from '../types/space.types';
import type { Board } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchSpace,
  fetchSpacesByWorkspace,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceMembers,
  addSpaceMember,
  removeSpaceMember,
  setCurrentSpace
} from '../store/slices/spaceSlice';
import {
  fetchBoardsBySpace,
  fetchBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  setCurrentBoard
} from '../store/slices/boardSlice';

export const useSpaceManager = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    spaces,
    currentSpace,
    loading: spaceLoading,
    error: spaceError
  } = useSelector((state: RootState) => state.spaces);

  const {
    boards,
    currentBoard,
    loading: boardLoading,
    error: boardError
  } = useSelector((state: RootState) => state.boards);

  // Space API actions
  const loadSpace = useCallback((spaceId: string) => {
    dispatch(fetchSpace(spaceId) as any);
  }, [dispatch]);

  const loadSpacesByWorkspace = useCallback((workspaceId: string) => {
    dispatch(fetchSpacesByWorkspace(workspaceId) as any);
  }, [dispatch]);

  const addSpace = async (spaceData: any) => {
    try {
      await dispatch(createSpace(spaceData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create space:', error);
      throw error;
    }
  };

  const editSpace = async (spaceId: string, spaceData: any) => {
    try {
      await dispatch(updateSpace({ id: spaceId, spaceData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to edit space:', error);
      throw error;
    }
  };

  const removeSpace = async (spaceId: string) => {
    try {
      await dispatch(deleteSpace(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to remove space:', error);
      throw error;
    }
  };

  const loadSpaceMembers = async (spaceId: string) => {
    try {
      await dispatch(getSpaceMembers(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to load space members:', error);
      throw error;
    }
  };

  const addMember = async (spaceId: string, userId: string, role: string) => {
    try {
      await dispatch(addSpaceMember({ spaceId, userId, role }) as any).unwrap();
    } catch (error) {
      console.error('Failed to add space member:', error);
      throw error;
    }
  };

  const removeMember = async (spaceId: string, memberId: string) => {
    try {
      await dispatch(removeSpaceMember({ spaceId, memberId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to remove space member:', error);
      throw error;
    }
  };

  const selectSpace = useCallback((space: Space | null) => {
    dispatch(setCurrentSpace(space));
  }, [dispatch]);

  // Board API actions
  const loadBoard = useCallback((boardId: string) => {
    dispatch(fetchBoard(boardId) as any).then((result: any) => {
      // If the fetch was successful, also update the board slice's currentBoard
      if (result.meta.requestStatus === 'fulfilled' && result.payload) {
        const boardData = result.payload.board || result.payload;
        dispatch(setCurrentBoard(boardData));
      }
    });
  }, [dispatch]);

  const loadBoardsBySpace = useCallback((spaceId: string) => {
    dispatch(fetchBoardsBySpace(spaceId) as any);
  }, [dispatch]);

  const addBoard = async (boardData: any) => {
    try {
      await dispatch(createBoard(boardData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create board:', error);
      throw error;
    }
  };

  const editBoard = async (boardId: string, boardData: any) => {
    try {
      await dispatch(updateBoard({ id: boardId, boardData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update board:', error);
      throw error;
    }
  };

  const removeBoard = async (boardId: string) => {
    try {
      await dispatch(deleteBoard(boardId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  };

  const selectBoard = (board: Board | null) => {
    dispatch(setCurrentBoard(board));
  };

  // Computed values
  const activeSpaces = spaces.filter(space => space.isActive && !space.isArchived);
  const archivedSpaces = spaces.filter(space => space.isArchived);
  const activeBoards = boards.filter(board => board.isActive && !board.archived);
  const archivedBoards = boards.filter(board => board.archived);
  const templateBoards = boards.filter(board => board.isTemplate);

  const getSpacesByWorkspace = (workspaceId: string) => {
    return spaces.filter(space => space.workspace === workspaceId);
  };

  const getActiveSpacesByWorkspace = (workspaceId: string) => {
    return getSpacesByWorkspace(workspaceId).filter(space => space.isActive && !space.isArchived);
  };

  const getBoardsBySpace = (spaceId: string) => {
    const result = boards.filter(board => {
      // Handle both string and object space references
      let boardSpaceId: string;
      if (typeof board.space === 'string') {
        boardSpaceId = board.space;
      } else if (board.space && typeof board.space === 'object' && 'name' in board.space) {
        boardSpaceId = (board.space as { _id: string; name: string })._id;
      } else {
        boardSpaceId = '';
      }
      
      return boardSpaceId === spaceId;
    });
    
    return result;
  };

  const getActiveBoardsBySpace = (spaceId: string) => {
    const spaceBoards = getBoardsBySpace(spaceId);
    const activeBoards = spaceBoards.filter(board => {
      const isActive = board.isActive !== false; // Default to true if undefined
      const notArchived = board.archived !== true; // Default to false if undefined
      
      return isActive && notArchived;
    });
    
    return activeBoards;
  };

  return {
    // State
    spaces,
    currentSpace,
    boards,
    currentBoard,
    loading: spaceLoading || boardLoading,
    error: spaceError || boardError,
    spaceLoading,
    boardLoading,
    spaceError,
    boardError,

    // Computed values
    activeSpaces,
    archivedSpaces,
    activeBoards,
    archivedBoards,
    templateBoards,

    // Space actions
    loadSpace,
    loadSpacesByWorkspace,
    addSpace,
    editSpace,
    removeSpace,
    loadSpaceMembers,
    addMember,
    removeMember,
    selectSpace,

    // Board actions
    loadBoard,
    loadBoardsBySpace,
    addBoard,
    editBoard,
    removeBoard,
    selectBoard,

    // Computed selectors
    getSpacesByWorkspace,
    getActiveSpacesByWorkspace,
    getBoardsBySpace,
    getActiveBoardsBySpace,
  };
};
