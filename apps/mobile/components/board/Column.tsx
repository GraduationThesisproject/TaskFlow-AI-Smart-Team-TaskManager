/**
 * Column Component - Droppable column with optimized FlatList rendering
 * Includes drag-over detection and smooth animations
 */

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ListRenderItemInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import {
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TaskCard } from './TaskCard';
import { TaskCreateModal } from './TaskCreateModal';
import { ColumnProps, DragTask } from '@/types/dragBoard.types';
import { useAppDispatch, useAppSelector } from '@/store';
import { addTask, addTaskAsync, selectBoard, deleteColumn as deleteColumnAction, fetchBoard } from '@/store/slices/dragBoardSlice';
import { BoardService } from '@/services/boardService';

const COLUMN_WIDTH = Dimensions.get('window').width - 32;
const TASK_HEIGHT = 88; // TaskCard height + margin

// Memoized Column component
export const Column = memo<ColumnProps>(({
  column,
  tasks,
  onTaskMove,
  onTaskSelect,
  onAddTask,
  isDraggedOver,
  editable = true,
}) => {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const board = useAppSelector(selectBoard);
  const flatListRef = useRef<FlatList<DragTask>>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const scrollYRef = React.useRef(0);
  const [headerH, setHeaderH] = React.useState(0);
  const [statsH, setStatsH] = React.useState(0);
  const [columnTopY, setColumnTopY] = React.useState(0);
  const headerSpacerH = 8; // matches styles.headerSpacer
  
  // Animation values
  const columnScale = useSharedValue(1);
  const columnOpacity = useSharedValue(1);
  const borderWidth = useSharedValue(1);
  const [isCollapsed, setIsCollapsed] = React.useState(column.collapsed || false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle drag over animation
  React.useEffect(() => {
    if (isDraggedOver) {
      columnScale.value = withSequence(
        withSpring(1.02, { damping: 15 }),
        withSpring(1, { damping: 15 })
      );
      borderWidth.value = withSpring(2);
    } else {
      borderWidth.value = withSpring(1);
    }
  }, [isDraggedOver, columnScale, borderWidth]);

  // Animated column style
  const animatedColumnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: columnScale.value }],
    opacity: columnOpacity.value,
    borderWidth: borderWidth.value,
  }));

  // Key extractor for FlatList with safe fallback to index
  const keyExtractor = useCallback((item: DragTask, index?: number) => {
    const key = (item as any)?._id || (item as any)?.id;
    return key ? String(key) : `idx-${index}`;
  }, []);

  // Get item layout for optimization
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: TASK_HEIGHT,
      offset: TASK_HEIGHT * index,
      index,
    }),
    []
  );

  // Render task card
  const renderTask = useCallback(
    ({ item, index }: ListRenderItemInfo<DragTask>) => (
      <TaskCard
        task={item}
        columnId={column._id}
        index={index}
        onDragStart={() => {
          // Handled by parent board
        }}
        onDragEnd={(targetColumnId, targetIndex) => {
          const safeIndex = Math.min(Math.max(targetIndex, 0), Math.max(0, tasks.length - 1));
          console.log('[Drop]', { taskId: item._id, from: column._id, to: targetColumnId, index: safeIndex });
          onTaskMove(item, targetColumnId || column._id, safeIndex);
        }}
        onPress={() => onTaskSelect(item)}
        isDragging={true}
        isPlaceholder={false}
        // @ts-ignore - extra debug/indicator callback for live hover index
        onDragMoveForIndicator={(absX: number, absY: number) => {
          const slot = TASK_HEIGHT;
          // Convert absolute Y to list-local Y: subtract column's top Y and header/stat heights, add scroll offset
          const localY = absY - columnTopY - headerH - (statsH || 0) - headerSpacerH + scrollYRef.current;
          const idx = Math.max(0, Math.round(localY / slot));
          const clamped = Math.min(idx, Math.max(0, (tasks?.length ?? 0)));
          setHoverIndex(clamped);
          // Log for debugging across devices
          console.log('[DragMove]', {
            columnId: column._id,
            index,
            absX,
            absY,
            columnTopY,
            headerH,
            statsH,
            scrollY: scrollYRef.current,
            hoverIndex: clamped,
            slotHeight: slot,
          });
        }}
      />
    ),
    [column._id, onTaskMove, onTaskSelect]
  );

  // Calculate task stats
  const stats = useMemo(() => {
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    
    const highPriority = tasks.filter(t => 
      t.priority === 'high' || t.priority === 'urgent'
    ).length;

    return { total: tasks.length, overdue, highPriority };
  }, [tasks]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
    columnOpacity.value = withSpring(isCollapsed ? 1 : 0.95);
  }, [isCollapsed, columnOpacity]);

  // Handle task creation
  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleSaveTask = useCallback((task: Partial<DragTask>) => {
    const title = (task.title ?? '').trim() || 'Untitled Task';
    const priority = (task.priority as any) ?? 'medium';
    const position = tasks.length;

    if (board?._id) {
      // Persist to backend
      dispatch(
        addTaskAsync({
          boardId: String(board._id),
          columnId: column._id,
          title,
          priority: priority as any,
          position,
        })
      );
      // Ensure state matches server ordering right away
      dispatch(fetchBoard(String(board._id)) as any);
    } else {
      // Fallback to local optimistic add if board is missing
      dispatch(
        addTask({
          columnId: column._id,
          task: {
            title,
            description: task.description ?? '',
            priority: priority as any,
            assignees: task.assignees ?? [],
            tags: (task as any)?.tags ?? [],
            columnId: column._id,
            position,
            status: 'todo' as const,
            dueDate: task.dueDate,
          } as any,
        })
      );
    }

    setShowCreateModal(false);
  }, [dispatch, board?._id, column._id, tasks.length]);

  const handleDeleteColumn = useCallback(() => {
    if (!board?._id) return;
    if (deleting) return;
    Alert.alert(
      'Delete column',
      `Are you sure you want to delete "${column.name}" and all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await BoardService.deleteColumn(column._id, String(board._id));
              dispatch(deleteColumnAction(column._id));
            } catch (err) {
              console.error('Failed to delete column:', err);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [board?._id, column._id, column.name, dispatch, deleting]);

  // List header component
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.headerSpacer} />
  ), []);

  // List footer component - only show when there are tasks
  const ListFooterComponent = useMemo(() => (
    <>
      {editable && tasks.length > 0 && (
        <TouchableOpacity
          style={[
            styles.addTaskButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={handleOpenCreateModal}
        >
          <Plus size={16} color={colors['muted-foreground']} />
          <Text style={[styles.addTaskText, { color: colors['muted-foreground'] }]}> 
            {String('Add Task')}
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.footerSpacer} />
    </>
  ), [editable, colors, handleOpenCreateModal, tasks.length]);

  // Empty component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors['muted-foreground'] }]}> 
        {String('No tasks yet')}
      </Text>
      {editable && (
        <TouchableOpacity
          style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenCreateModal}
        >
          <Plus size={18} color="white" />
          <Text style={styles.emptyAddText}>{String('Add First Task')}</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [editable, colors, handleOpenCreateModal]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
      style={[
        styles.column,
        animatedColumnStyle,
        {
          backgroundColor: colors.background,
          borderColor: isDraggedOver ? colors.primary : colors.border,
          width: COLUMN_WIDTH,
        },
      ]}
      onLayout={(e) => {
        setColumnTopY(e.nativeEvent.layout.y);
      }}
    >
      {/* Column Header */}
      <View
        style={[styles.header, { borderBottomColor: colors.border }]}
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={toggleCollapse}
          activeOpacity={0.7}
        >
          <View style={[styles.colorDot, { backgroundColor: column.color }]} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {column.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.badgeText, { color: colors.foreground }]}>
              {stats.total}
            </Text>
          </View>
          {isCollapsed ? (
            <ChevronDown size={16} color={colors['muted-foreground']} />
          ) : (
            <ChevronUp size={16} color={colors['muted-foreground']} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleDeleteColumn} disabled={deleting}>
          <MoreVertical size={18} color={colors['muted-foreground']} />
        </TouchableOpacity>
      </View>

      {/* Column Stats */}
      {!isCollapsed && stats.total > 0 && (
        <View
          style={[styles.stats, { backgroundColor: colors.muted }]}
          onLayout={(e) => setStatsH(e.nativeEvent.layout.height)}
        >
          {stats.overdue > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.statText, { color: colors['muted-foreground'] }]}>
                {stats.overdue} overdue
              </Text>
            </View>
          )}
          {stats.highPriority > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#f97316' }]} />
              <Text style={[styles.statText, { color: colors['muted-foreground'] }]}>
                {stats.highPriority} high priority
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tasks List */}
      {!isCollapsed && (
        <FlatList
          ref={flatListRef}
          data={tasks}
          renderItem={renderTask}
          // @ts-ignore - RN types allow (item, index)
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
          initialNumToRender={5}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          onScroll={(e) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        />
      )}

      {/* Drop Indicator Line removed as requested */}

      {/* WIP Limit Warning */}
      {column.wipLimit && tasks.length >= column.wipLimit && !isCollapsed && (
        <View style={[styles.wipWarning, { backgroundColor: colors.destructive }]}>
          <Text style={styles.wipWarningText}>
            WIP limit reached ({tasks.length}/{column.wipLimit})
          </Text>
        </View>
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveTask}
        columnId={column._id}
        columnName={column.name}
      />
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.column._id === nextProps.column._id &&
    prevProps.column.name === nextProps.column.name &&
    prevProps.column.color === nextProps.column.color &&
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.isDraggedOver === nextProps.isDraggedOver &&
    prevProps.editable === nextProps.editable &&
    // Deep check first task to detect content changes
    JSON.stringify(prevProps.tasks[0]) === JSON.stringify(nextProps.tasks[0])
  );
});

Column.displayName = 'Column';

const styles = StyleSheet.create({
  column: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 400,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    fontSize: 11,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  headerSpacer: {
    height: 8,
  },
  footerSpacer: {
    height: 8,
  },
  addTaskButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addTaskText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  emptyAddText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  wipWarning: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    alignItems: 'center',
  },
  wipWarningText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
