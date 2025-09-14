import { useSelector, useDispatch } from 'react-redux';
import { useSocketContext } from '../contexts/SocketContext';
import type { Board, BoardTag } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchBoard,
  setCurrentBoard,
  addTagToBoard,
  updateBoardTag,
  removeTagFromBoard,
  fetchBoardTags
} from '../store/slices/boardSlice';

export const useBoard = () => {
  const dispatch = useDispatch();
  const { createBoardTag: socketCreateBoardTag, updateBoardTag: socketUpdateBoardTag, deleteBoardTag: socketDeleteBoardTag } = useSocketContext();
  
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

  // Tag operations - now using socket operations
  const createBoardTag = (boardId: string, tag: { name: string; color: string }) => {
    // Use socket operation for real-time updates
    socketCreateBoardTag(boardId, tag);
  };

  const updateTag = (boardId: string, tagName: string, updates: { name?: string; color?: string }) => {
    // Use socket operation for real-time updates
    socketUpdateBoardTag(boardId, tagName, updates);
  };

  const deleteTag = (boardId: string, tagName: string) => {
    // Use socket operation for real-time updates
    socketDeleteBoardTag(boardId, tagName);
  };

  const loadBoardTags = (boardId: string) => {
    return dispatch(fetchBoardTags(boardId) as any);
  };

  return {
    // State
    currentBoard,
    loading,
    error,

    // Actions
    loadBoard,
    selectBoard,

    // Tag operations
    createBoardTag,
    updateTag,
    deleteTag,
    loadBoardTags,
  };
};
