import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { Column } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} from '../store/slices/taskSlice';
import {
  startDraggingColumn,
  stopDraggingColumn
} from '../store/slices/columnSlice';

export const useColumns = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store - Use task slice since it contains the columns data
  const {
    columns,
    loading,
    error
  } = useSelector((state: RootState) => state.tasks);
  
  // Get drag state from column slice
  const { dragState } = useSelector((state: RootState) => state.columns);

  // API actions
  const loadColumnsByBoard = useCallback((boardId: string) => {
    dispatch(fetchColumnsByBoard(boardId) as any);
  }, [dispatch]);

  const addColumn = useCallback(async (columnData: { name: string; boardId: string; position: number; color?: string; backgroundColor?: string; icon?: string | null; settings?: any }) => {
    try {
      // Extract boardId from columnData if it exists, otherwise we need to get it from context
      const { boardId, ...columnDataWithoutBoardId } = columnData;
      if (!boardId) {
        throw new Error('boardId is required to create a column');
      }
      await dispatch(createColumn({ boardId, columnData: columnDataWithoutBoardId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to create column:', error);
      throw error;
    }
  }, [dispatch]);

  const editColumn = useCallback(async (columnId: string, columnData: any, boardId?: string) => {
    try {
      if (!boardId) {
        throw new Error('boardId is required to update a column');
      }
      await dispatch(updateColumn({ columnId, columnData: { ...columnData, boardId } }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  }, [dispatch]);

  const removeColumn = useCallback(async (columnId: string, boardId?: string) => {
    try {
      if (!boardId) {
        throw new Error('boardId is required to delete a column');
      }
      await dispatch(deleteColumn({ columnId, boardId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  }, [dispatch]);

  const reorderColumnsAction = useCallback(async (boardId: string, columnIds: string[]) => {
    try {
      await dispatch(reorderColumns({ boardId, columnOrder: columnIds }) as any).unwrap();
    } catch (error) {
      console.error('Failed to reorder columns:', error);
      throw error;
    }
  }, [dispatch]);

  const startDragging = useCallback((column: Column, position: number) => {
    dispatch(startDraggingColumn({ column, position }));
  }, [dispatch]);

  const stopDragging = useCallback(() => {
    dispatch(stopDraggingColumn());
  }, [dispatch]);

  // Computed values - Add defensive programming to handle null/undefined columns
  const columnsArray = Array.isArray(columns) ? columns : [];
  const sortedColumns = [...columnsArray].sort((a, b) => a.position - b.position);
  const activeColumns = columnsArray.filter(col => !col.isArchived);
  const archivedColumns = columnsArray.filter(col => col.isArchived);

  const getColumnsByBoard = useCallback((boardId: string) => {
    return columnsArray.filter(col => col.board === boardId);
  }, [columnsArray]);

  const getSortedColumnsByBoard = useCallback((boardId: string) => {
    return getColumnsByBoard(boardId).sort((a, b) => a.position - b.position);
  }, [getColumnsByBoard]);

  return {
    // State
    columns: columnsArray,
    loading,
    error,
    dragState,
    sortedColumns,
    activeColumns,
    archivedColumns,

    // Actions
    loadColumnsByBoard,
    addColumn,
    editColumn,
    removeColumn,
    reorderColumns: reorderColumnsAction,
    startDragging,
    stopDragging,

    // Computed selectors
    getColumnsByBoard,
    getSortedColumnsByBoard,
  };
};
