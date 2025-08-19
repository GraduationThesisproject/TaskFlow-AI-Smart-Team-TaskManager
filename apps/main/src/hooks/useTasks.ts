import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  setCurrentTask,
  setFilters,
  setSortBy,
  setSearchQuery,
  clearFilters,
  Task,
} from '../store/slices/taskSlice';
import {
  selectFilteredTasks,
  selectCurrentTask,
  selectTaskLoading,
  selectTaskError,
  selectTaskFilters,
  selectTaskSortBy,
  selectTaskSearchQuery,
  selectTasksByStatus,
  selectTaskStats,
  selectUniqueCategories,
  selectUniqueAssignees,
  selectUniquePriorities,
  selectTimelineTasks,
  selectHighPriorityTasks,
  selectOverdueTasks,
} from '../store/selectors/taskSelectors';

export const useTasks = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const tasks = useAppSelector(selectFilteredTasks);
  const currentTask = useAppSelector(selectCurrentTask);
  const loading = useAppSelector(selectTaskLoading);
  const error = useAppSelector(selectTaskError);
  const filters = useAppSelector(selectTaskFilters);
  const sortBy = useAppSelector(selectTaskSortBy);
  const searchQuery = useAppSelector(selectTaskSearchQuery);
  const tasksByStatus = useAppSelector(selectTasksByStatus);
  const taskStats = useAppSelector(selectTaskStats);
  const uniqueCategories = useAppSelector(selectUniqueCategories);
  const uniqueAssignees = useAppSelector(selectUniqueAssignees);
  const uniquePriorities = useAppSelector(selectUniquePriorities);
  const timelineTasks = useAppSelector(selectTimelineTasks);
  const highPriorityTasks = useAppSelector(selectHighPriorityTasks);
  const overdueTasks = useAppSelector(selectOverdueTasks);

  // Actions
  const loadTasks = useCallback(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const loadTaskById = useCallback((taskId: string) => {
    dispatch(fetchTaskById(taskId));
  }, [dispatch]);

  const addTask = useCallback((taskData: Partial<Task>) => {
    return dispatch(createTask(taskData));
  }, [dispatch]);

  const editTask = useCallback((taskId: string, taskData: Partial<Task>) => {
    return dispatch(updateTask({ taskId, taskData }));
  }, [dispatch]);

  const removeTask = useCallback((taskId: string) => {
    return dispatch(deleteTask(taskId));
  }, [dispatch]);

  const selectTask = useCallback((task: Task | null) => {
    dispatch(setCurrentTask(task));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const updateSortBy = useCallback((field: keyof Task, direction: 'asc' | 'desc') => {
    dispatch(setSortBy({ field, direction }));
  }, [dispatch]);

  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    // State
    tasks,
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

    // Actions
    loadTasks,
    loadTaskById,
    addTask,
    editTask,
    removeTask,
    selectTask,
    updateFilters,
    updateSortBy,
    updateSearchQuery,
    resetFilters,
  };
};
