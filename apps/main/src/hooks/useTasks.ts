import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Task } from '../types/task.types';
import type { RootState } from '../store';
import { useSocketContext } from '../contexts/SocketContext';
import {
  fetchTasks,
  fetchBoard,
  fetchSpace,
  createTask,
  updateTask,
  deleteTask,
  fetchTasksByColumn,
  fetchTasksBySpace,
  fetchBoardsBySpace,
  setCurrentTask,
  updateFilters,
  updateSort,
  updateSearchQuery,
  clearFilters
} from '../store/slices/taskSlice';

export const useTasks = () => {
  const dispatch = useDispatch();
  const { createTask: createTaskSocket, updateTask: updateTaskSocket, deleteTask: deleteTaskSocket, moveTask: moveTaskSocket } = useSocketContext();
  
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

  // Compute derived state - Fixed at 2025-01-05
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  
  // Helper function to determine task status from column name
  const getTaskStatusFromColumn = (task: any) => {
    if (!task.column?.name) return 'todo';
    const columnName = task.column.name.toLowerCase();
    if (columnName.includes('done') || columnName.includes('complete')) return 'done';
    if (columnName.includes('review') || columnName.includes('testing')) return 'review';
    if (columnName.includes('progress') || columnName.includes('doing')) return 'in_progress';
    return 'todo';
  };

  // Group tasks by column-based status
  const tasksByStatus = {
    'col1': safeTasks.filter(t => getTaskStatusFromColumn(t) === 'todo'),
    'col2': safeTasks.filter(t => getTaskStatusFromColumn(t) === 'in_progress'),
    'col3': safeTasks.filter(t => getTaskStatusFromColumn(t) === 'review'),
    'col4': safeTasks.filter(t => getTaskStatusFromColumn(t) === 'done'),
  };

  const taskStats = {
    total: safeTasks.length,
    completed: safeTasks.filter(t => getTaskStatusFromColumn(t) === 'done').length,
    inProgress: safeTasks.filter(t => getTaskStatusFromColumn(t) === 'in_progress').length,
    inReview: safeTasks.filter(t => getTaskStatusFromColumn(t) === 'review').length,
    toDo: safeTasks.filter(t => getTaskStatusFromColumn(t) === 'todo').length,
    completionRate: safeTasks.length > 0 ? Math.round((safeTasks.filter(t => getTaskStatusFromColumn(t) === 'done').length / safeTasks.length) * 100) : 0,
  };

  const uniqueCategories = Array.from(new Set(safeTasks.flatMap(t => t.tags || [])));
  const uniqueAssignees = Array.from(new Set(safeTasks.flatMap(t => t.assignees || [])));
  const uniquePriorities = Array.from(new Set(safeTasks.map(t => t.priority)));
  const timelineTasks = safeTasks.filter(t => t.dueDate);
  const highPriorityTasks = safeTasks.filter(t => t.priority === 'high' || t.priority === 'critical');
  const overdueTasks = safeTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

  // API actions
  const loadTasks = useCallback((boardId: string) => {
    dispatch(fetchTasks(boardId) as any);
  }, [dispatch]);

  const loadTaskById = useCallback((taskId: string) => {
    // Find task in current tasks array
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      dispatch(setCurrentTask(task));
    }
  }, [tasks, dispatch]);

  const addTask = async (taskData: Partial<Task>) => {
    try {
      // Use socket for task creation
      const boardId = (taskData as any).boardId || taskData.board;
      if (boardId) {
        createTaskSocket(boardId, taskData);
      } else {
        // Fallback to HTTP if no boardId
        await dispatch(createTask(taskData as any) as any).unwrap();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const editTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      // Use socket for task updates
      const boardId = (taskData as any).boardId || taskData.board;
      if (boardId) {
        updateTaskSocket(taskId, taskData, boardId);
      } else {
        // Fallback to HTTP if no boardId
        await dispatch(updateTask({ id: taskId, taskData: taskData as any }) as any).unwrap();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const removeTask = async (taskId: string, boardId?: string) => {
    try {
      // Use socket for task deletion
      if (boardId) {
        deleteTaskSocket(taskId, boardId);
      } else {
        // Fallback to HTTP if no boardId
        await dispatch(deleteTask(taskId) as any).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const selectTask = (task: Task | null) => {
    dispatch(setCurrentTask(task));
  };

  const moveTask = async (taskId: string, sourceColumnId: string, targetColumnId: string, targetPosition: number, boardId: string) => {
    try {
      // Use socket for task movement
      moveTaskSocket(taskId, sourceColumnId, targetColumnId, targetPosition, boardId);
    } catch (error) {
      console.error('Failed to move task:', error);
      throw error;
    }
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


  const safeColumns = columns || [];
  const safeBoards = boards || [];
  const safeSpaces = spaces || [];

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
    addTask,
    editTask,
    removeTask,
    selectTask,
    moveTask,
    updateFilters: updateFiltersLocal,
    updateSortBy,
    updateSearchQuery: updateSearchQueryLocal,
    resetFilters: resetFiltersLocal,
  };
};
