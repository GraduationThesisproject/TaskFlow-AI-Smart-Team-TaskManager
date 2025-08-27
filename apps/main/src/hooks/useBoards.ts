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
  const loadBoard = (boardId: string) => {
    dispatch(fetchBoard(boardId) as any);
  };

  const loadBoardsBySpace = (spaceId: string) => {
    dispatch(fetchBoardsBySpace(spaceId) as any);
  };

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
