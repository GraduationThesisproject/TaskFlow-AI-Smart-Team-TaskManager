import { useSelector, useDispatch } from 'react-redux';
import type { Board } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchBoard,
  setCurrentBoard
} from '../store/slices/boardSlice';

export const useBoard = () => {
  const dispatch = useDispatch();
  
  // Select current board from Redux store
  const {
    currentBoard,
    loading,
    error
  } = useSelector((state: RootState) => state.boards);

  // Load board by ID and set as current
  const loadBoard = (boardId: string) => {
    dispatch(fetchBoard(boardId) as any);
  };

  // Set current board directly
  const selectBoard = (board: Board | null) => {
    dispatch(setCurrentBoard(board));
  };

  return {
    // State
    currentBoard,
    loading,
    error,

    // Actions
    loadBoard,
    selectBoard,
  };
};
