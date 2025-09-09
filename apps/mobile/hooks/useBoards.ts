import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Board } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchBoard,
  fetchBoardsBySpace,
  createBoard,
  updateBoard,
  deleteBoard,
  setCurrentBoard
} from '../store/slices/boardSlice';

export const useBoards = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    boards,
    currentBoard,
    loading,
    error
  } = useSelector((state: RootState) => state.boards);

  // API actions
  const loadBoard = useCallback((boardId: string) => {
    dispatch(fetchBoard(boardId) as any);
  }, [dispatch]);

  const loadBoardsBySpace = useCallback((spaceId: string) => {
    dispatch(fetchBoardsBySpace(spaceId) as any);
  }, [dispatch]);

  const addBoard = useCallback(async (boardData: any) => {
    try {
      await dispatch(createBoard(boardData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create board:', error);
      throw error;
    }
  }, [dispatch]);

  const editBoard = useCallback(async (boardId: string, boardData: any) => {
    try {
      await dispatch(updateBoard({ id: boardId, boardData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update board:', error);
      throw error;
    }
  }, [dispatch]);

  const removeBoard = useCallback(async (boardId: string) => {
    try {
      await dispatch(deleteBoard(boardId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  }, [dispatch]);

  const selectBoard = useCallback((board: Board | null) => {
    dispatch(setCurrentBoard(board));
  }, [dispatch]);

  // Computed values
  const activeBoards = boards.filter(board => board.isActive && !board.archived);
  const archivedBoards = boards.filter(board => board.archived);
  const templateBoards = boards.filter(board => board.isTemplate);

  return {
    // State
    boards,
    currentBoard,
    loading,
    error,
    activeBoards,
    archivedBoards,
    templateBoards,

    // Actions
    loadBoard,
    loadBoardsBySpace,
    addBoard,
    editBoard,
    removeBoard,
    selectBoard,
  };
};
