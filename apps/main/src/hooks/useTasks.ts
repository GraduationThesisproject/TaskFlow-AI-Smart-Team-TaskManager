import { useSelector, useDispatch } from 'react-redux';
import type { Task } from '../types/task.types';
import type { Column, Board } from '../types/board.types';
import type { RootState } from '../store';
import {
  fetchTasks,
  fetchBoard,
  fetchSpace,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  fetchTasksByColumn,
  fetchTasksBySpace,
  fetchBoardsBySpace,
  fetchColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  setCurrentTask,
  updateFilters,
  updateSort,
  updateSearchQuery,
  clearFilters
} from '../store/slices/taskSlice';

export const useTasks = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    tasks,
    currentTask,
    loading,
    error,
    filters,
    sortBy,
    searchQuery,
    columns,
    boards,
    spaces,
    currentBoard,
    currentSpace,
    comments,
  } = useSelector((state: RootState) => state.tasks);

  // Compute derived state
  const tasksByStatus = {
    'col1': tasks.filter(t => t.status === 'todo'),
    'col2': tasks.filter(t => t.status === 'in_progress'),
    'col3': tasks.filter(t => t.status === 'review'),
    'col4': tasks.filter(t => t.status === 'done'),
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    inReview: tasks.filter(t => t.status === 'review').length,
    toDo: tasks.filter(t => t.status === 'todo').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
  };

  const uniqueCategories = Array.from(new Set(tasks.flatMap(t => t.tags || [])));
  const uniqueAssignees = Array.from(new Set(tasks.flatMap(t => t.assignees || [])));
  const uniquePriorities = Array.from(new Set(tasks.map(t => t.priority)));
  const timelineTasks = tasks.filter(t => t.dueDate);
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

  // API actions
  const loadTasks = (boardId: string) => {
    dispatch(fetchTasks(boardId) as any);
  };

  const loadTaskById = (taskId: string) => {
    // Find task in current tasks array
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      dispatch(setCurrentTask(task));
    }
  };

  const addTask = async (taskData: Partial<Task>) => {
    try {
      await dispatch(createTask(taskData as any) as any).unwrap();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const editTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: taskData as any }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const selectTask = (task: Task | null) => {
    dispatch(setCurrentTask(task));
  };

  const updateFiltersLocal = (newFilters: Partial<typeof filters>) => {
    dispatch(updateFilters(newFilters));
  };

  const updateSortBy = (field: keyof Task, direction: 'asc' | 'desc') => {
    dispatch(updateSort({ field, direction }));
  };

  const updateSearchQueryLocal = (query: string) => {
    dispatch(updateSearchQuery(query));
  };

  const resetFiltersLocal = () => {
    dispatch(clearFilters());
  };

  // Additional API actions
  const loadBoard = (boardId: string) => {
    dispatch(fetchBoard(boardId) as any);
  };

  const loadSpace = (spaceId: string) => {
    dispatch(fetchSpace(spaceId) as any);
  };

  const loadTasksByColumn = (columnId: string) => {
    dispatch(fetchTasksByColumn(columnId) as any);
  };

  const loadTasksBySpace = (spaceId: string) => {
    dispatch(fetchTasksBySpace(spaceId) as any);
  };

  const loadBoardsBySpace = (spaceId: string) => {
    dispatch(fetchBoardsBySpace(spaceId) as any);
  };

  const loadColumnsByBoard = (boardId: string) => {
    dispatch(fetchColumnsByBoard(boardId) as any);
  };

  const createColumnLocal = async (boardId: string, columnData: { 
    name: string; 
    position: number; 
    color?: string;
    settings?: any;
  }) => {
    try {
      await dispatch(createColumn({ boardId, columnData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to create column:', error);
      throw error;
    }
  };

  const updateColumnLocal = async (columnId: string, columnData: Partial<Column>) => {
    console.log('updateColumnLocal called with columnId:', columnId, 'columnData:', columnData);
    try {
      // We need to get the boardId from the current board or from the column data
      const boardId = currentBoard?._id;
      console.log('Current board ID:', boardId);
      if (!boardId) {
        throw new Error('No board ID available for column update');
      }
      const payload = { 
        columnId, 
        columnData: { ...columnData, boardId } as any 
      };
      console.log('Dispatching updateColumn with payload:', payload);
      await dispatch(updateColumn(payload) as any).unwrap();
      console.log('updateColumn dispatch completed successfully');
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  };

  const deleteColumnLocal = async (columnId: string) => {
    console.log('deleteColumnLocal called with columnId:', columnId);
    try {
      const boardId = currentBoard?._id;
      console.log('Current board ID for deletion:', boardId);
      if (!boardId) {
        throw new Error('No board ID available for column deletion');
      }
      const payload = { columnId, boardId };
      console.log('Dispatching deleteColumn with payload:', payload);
      await dispatch(deleteColumn(payload) as any).unwrap();
      console.log('deleteColumn dispatch completed successfully');
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  const reorderColumnsLocal = async (boardId: string, columnIds: string[]) => {
    try {
      await dispatch(reorderColumns({ boardId, columnOrder: columnIds }) as any).unwrap();
    } catch (error) {
      console.error('Failed to reorder columns:', error);
      throw error;
    }
  };

  const safeTasks = tasks;
  const safeColumns = columns;
  const safeBoards = boards;
  const safeSpaces = spaces;

  return {
    // State
    tasks: safeTasks,
    currentTask,
    loading,
    error,
    filters,
    sortBy,
    searchQuery,
    tasksByStatus,
    taskStats,
    uniqueCategories,
    uniqueAssignees,
    uniquePriorities,
    timelineTasks,
    highPriorityTasks,
    overdueTasks,
    columns: safeColumns,
    boards: safeBoards,
    spaces: safeSpaces,
    currentBoard,
    currentSpace,
    comments,

    // Actions
    loadTasks,
    loadTaskById,
    loadBoard,
    loadSpace,
    loadTasksByColumn,
    loadTasksBySpace,
    loadBoardsBySpace,
    loadColumnsByBoard,
    addTask,
    editTask,
    removeTask,
    selectTask,
    moveTask,
    createColumn: createColumnLocal,
    updateColumn: updateColumnLocal,
    deleteColumn: deleteColumnLocal,
    reorderColumns: reorderColumnsLocal,
    updateFilters: updateFiltersLocal,
    updateSortBy,
    updateSearchQuery: updateSearchQueryLocal,
    resetFilters: resetFiltersLocal,
  };
};
