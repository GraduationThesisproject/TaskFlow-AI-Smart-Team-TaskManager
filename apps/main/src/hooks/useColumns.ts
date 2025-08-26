import { useSelector, useDispatch } from 'react-redux';
import type { Column } from '../types/task.types';
import type { RootState } from '../store';
import {
  fetchColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  startDraggingColumn,
  stopDraggingColumn
} from '../store/slices/columnSlice';

export const useColumns = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    columns,
    loading,
    error,
    dragState
  } = useSelector((state: RootState) => state.columns);

  // API actions
  const loadColumnsByBoard = (boardId: string) => {
    dispatch(fetchColumnsByBoard(boardId) as any);
  };

  const addColumn = async (columnData: any) => {
    try {
      await dispatch(createColumn(columnData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create column:', error);
      throw error;
    }
  };

  const editColumn = async (columnId: string, columnData: any) => {
    try {
      await dispatch(updateColumn({ id: columnId, columnData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  };

  const removeColumn = async (columnId: string) => {
    try {
      await dispatch(deleteColumn(columnId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  const reorderColumnsAction = async (boardId: string, columnIds: string[]) => {
    try {
      await dispatch(reorderColumns({ boardId, columnIds }) as any).unwrap();
    } catch (error) {
      console.error('Failed to reorder columns:', error);
      throw error;
    }
  };

  const startDragging = (column: Column, position: number) => {
    dispatch(startDraggingColumn({ column, position }));
  };

  const stopDragging = () => {
    dispatch(stopDraggingColumn());
  };

  // Computed values
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const activeColumns = columns.filter(col => !col.isArchived);
  const archivedColumns = columns.filter(col => col.isArchived);

  const getColumnsByBoard = (boardId: string) => {
    return columns.filter(col => col.board === boardId);
  };

  const getSortedColumnsByBoard = (boardId: string) => {
    return getColumnsByBoard(boardId).sort((a, b) => a.position - b.position);
  };

  return {
    // State
    columns,
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
