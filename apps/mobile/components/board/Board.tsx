/**
 * Board Component - Main container for the drag-and-drop board
 * Connected to Redux for state management with performance optimizations
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import {
  Plus,
  List,
  Grid3X3,
  Filter,
  Search,
  ArrowLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchBoard,
  moveTaskOptimistic,
  saveTaskMove,
  selectTask,
  closeTaskDetails,
  updateTask,
  deleteTask,
  addTask,
  addTaskAsync,
  setViewMode,
  selectBoard,
  selectColumns,
  selectTasks,
  selectDragState,
  selectSelectedTask,
  selectIsTaskDetailsOpen,
  selectIsLoading,
  selectError,
  startDrag,
  endDrag,
} from '@/store/slices/dragBoardSlice';
import { Column } from './Column';
import { ColumnCreateModal } from './ColumnCreateModal';
import { TaskDetails } from './TaskDetails';
import { BoardProps, DragTask, BoardViewMode } from '@/types/dragBoard.types';

const COLUMN_WIDTH = Dimensions.get('window').width - 32;

export const Board: React.FC<BoardProps> = ({
  boardId,
  onTaskSelect,
  onBoardUpdate,
  editable = true,
  showFilters = true,
}) => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Redux state
  const board = useAppSelector(selectBoard);
  const columns = useAppSelector(selectColumns);
  const tasks = useAppSelector(selectTasks);
  const dragState = useAppSelector(selectDragState);
  const selectedTask = useAppSelector(selectSelectedTask);
  const isTaskDetailsOpen = useAppSelector(selectIsTaskDetailsOpen);
  const loading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const [refreshing, setRefreshing] = React.useState(false);
  const [showCreateColumn, setShowCreateColumn] = React.useState(false);
  const [localViewMode, setLocalViewMode] = React.useState<BoardViewMode>('kanban');

  // Load board data on mount
  useEffect(() => {
    console.log('[Board] Fetching board with ID:', boardId);
    dispatch(fetchBoard(boardId));
  }, [boardId, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('[Board] State update:', {
      boardId,
      columnsCount: columns.length,
      tasksKeys: Object.keys(tasks),
      tasksCount: Object.values(tasks).reduce((sum, arr) => sum + arr.length, 0),
      loading,
      error,
      board: board ? { id: board._id, name: board.name } : null
    });
  }, [boardId, columns, tasks, loading, error, board]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchBoard(boardId)).finally(() => {
      setRefreshing(false);
    });
  }, [boardId, dispatch]);

  // Handle task move
  const handleTaskMove = useCallback(
    (task: DragTask, targetColumnId: string, targetIndex: number) => {
      const sourceColumnId = task.columnId;
      
      // Optimistic update
      dispatch(
        moveTaskOptimistic({
          taskId: task._id,
          sourceColumnId,
          targetColumnId,
          sourceIndex: task.position,
          targetIndex,
        })
      );

      // Save to backend
      dispatch(
        saveTaskMove({
          taskId: task._id,
          sourceColumnId,
          targetColumnId,
          sourceIndex: task.position,
          targetIndex,
        })
      );
    },
    [dispatch]
  );

  // Handle task selection
  const handleTaskSelect = useCallback(
    (task: DragTask) => {
      dispatch(selectTask(task));
      onTaskSelect?.(task);
    },
    [dispatch, onTaskSelect]
  );

  // Handle task update
  const handleTaskUpdate = useCallback(
    (updates: Partial<DragTask>) => {
      if (!selectedTask) return;
      
      dispatch(
        updateTask({
          taskId: selectedTask._id,
          columnId: selectedTask.columnId,
          updates,
        })
      );
    },
    [dispatch, selectedTask]
  );

  // Handle task delete
  const handleTaskDelete = useCallback(() => {
    if (!selectedTask) return;
    
    dispatch(
      deleteTask({
        taskId: selectedTask._id,
        columnId: selectedTask.columnId,
      })
    );
  }, [dispatch, selectedTask]);

  // Handle add task
  const handleAddTask = useCallback(
    (columnId: string) => {
      Alert.prompt(
        'New Task',
        'Enter task title:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: (title?: string) => {
              if (typeof title === 'string' && title.trim().length > 0) {
                const position = tasks[columnId]?.length || 0;
                dispatch(addTaskAsync({ boardId: boardId, columnId, title: title.trim(), position }));
              }
            },
          },
        ],
        'plain-text'
      );
    },
    [dispatch, tasks, boardId]
  );

  // Handle view mode change
  const handleViewModeChange = useCallback(() => {
    const nextMode: BoardViewMode = localViewMode === 'kanban' ? 'list' : 'kanban';
    setLocalViewMode(nextMode);
    dispatch(setViewMode(nextMode));
  }, [localViewMode, dispatch]);

  // Close task details
  const handleCloseTaskDetails = useCallback(() => {
    dispatch(closeTaskDetails());
  }, [dispatch]);

  // Memoized column rendering
  const renderColumns = useMemo(
    () =>
      columns.map((column) => (
        <Column
          key={column._id}
          column={column}
          tasks={tasks[column._id] || []}
          onTaskMove={handleTaskMove}
          onTaskSelect={handleTaskSelect}
          onAddTask={() => handleAddTask(column._id)}
          isDraggedOver={dragState.targetColumnId === column._id}
          editable={editable}
        />
      )),
    [
      columns,
      tasks,
      handleTaskMove,
      handleTaskSelect,
      handleAddTask,
      dragState.targetColumnId,
      editable,
    ]
  );

  // Loading state
  if (loading && !board) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors['muted-foreground'] }]}>
          Loading board...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Debug: Show if no columns or tasks
  if (!loading && columns.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          No columns found for board {boardId}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.header, { backgroundColor: colors.background }]}
        >
          <View>
            <Text style={[styles.boardTitle, { color: colors.foreground }]}>
              {board?.name || 'Task Board'}
            </Text>
            {board?.description && (
              <Text style={[styles.boardDescription, { color: colors['muted-foreground'] }]}>
                {board.description}
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Back to space">
              <ArrowLeft size={20} color={colors['muted-foreground']} />
            </TouchableOpacity>
            {showFilters && (
              <TouchableOpacity style={styles.iconButton}>
                <Filter size={20} color={colors['muted-foreground']} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.iconButton}>
              <Search size={20} color={colors['muted-foreground']} />
            </TouchableOpacity>

            {editable && (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.muted }]}
                onPress={() => setShowCreateColumn(true)}
                accessibilityLabel="Add Column"
              >
                <Plus size={18} color={colors['muted-foreground']} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.viewModeButton, { backgroundColor: colors.primary }]}
              onPress={handleViewModeChange}
            >
              {localViewMode === 'kanban' ? (
                <List size={16} color="white" />
              ) : (
                <Grid3X3 size={16} color="white" />
              )}
              <Text style={styles.viewModeText}>
                {localViewMode === 'kanban' ? 'List' : 'Board'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Board Content */}
        {localViewMode === 'kanban' ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={styles.boardContainer}
            contentContainerStyle={[styles.boardContent]}
            pagingEnabled
            snapToInterval={COLUMN_WIDTH + 16}
            decelerationRate="fast"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {renderColumns}

            {/* Add Column Button */}
            {editable && (
              <TouchableOpacity
                style={[
                  styles.addColumnButton,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    width: COLUMN_WIDTH,
                  },
                ]}
                onPress={() => setShowCreateColumn(true)}
              >
                <Plus size={20} color={colors['muted-foreground']} />
                <Text style={[styles.addColumnText, { color: colors['muted-foreground'] }]}>Add Column</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.boardContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {columns.map((column) => (
              <View key={column._id} style={{ marginBottom: 16 }}>
                <Column
                  column={column}
                  tasks={tasks[column._id] || []}
                  onTaskMove={handleTaskMove}
                  onTaskSelect={handleTaskSelect}
                  onAddTask={() => handleAddTask(column._id)}
                  isDraggedOver={dragState.targetColumnId === column._id}
                  editable={editable}
                  fullWidth
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Task Details Modal */}
        <TaskDetails
          task={selectedTask}
          visible={isTaskDetailsOpen}
          onClose={handleCloseTaskDetails}
          onUpdate={handleTaskUpdate}
          onDelete={editable ? handleTaskDelete : undefined}
        />

        {/* Create Column Modal */}
        <ColumnCreateModal
          visible={showCreateColumn}
          onClose={() => setShowCreateColumn(false)}
          onSave={({ name, color }) => {
            const position = columns.length;
            dispatch((require('@/store/slices/dragBoardSlice') as any).createColumnAsync({ boardId, name, position, color }));
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  boardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewModeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  boardContainer: {
    flex: 1,
  },
  boardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  addColumnButton: {
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addColumnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
