/**
 * Column Component - Droppable column with optimized FlatList rendering
 * Includes drag-over detection and smooth animations
 */

import React, { memo, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
import { ColumnProps, DragTask, LayoutInfo } from '@/types/dragBoard.types';

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
  const flatListRef = useRef<FlatList<DragTask>>(null);
  
  // Animation values
  const columnScale = useSharedValue(1);
  const columnOpacity = useSharedValue(1);
  const borderWidth = useSharedValue(1);
  const [isCollapsed, setIsCollapsed] = React.useState(column.collapsed || false);

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

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: DragTask) => item._id, []);

  // Get item layout for optimization
  const getItemLayout = useCallback(
    (_: any, index: number): LayoutInfo => ({
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
          onTaskMove(item, targetColumnId, targetIndex);
        }}
        onPress={() => onTaskSelect(item)}
        isDragging={false}
        isPlaceholder={false}
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
          onPress={onAddTask}
        >
          <Plus size={16} color={colors['muted-foreground']} />
          <Text style={[styles.addTaskText, { color: colors['muted-foreground'] }]}>
            Add Task
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.footerSpacer} />
    </>
  ), [editable, colors, onAddTask, tasks.length]);

  // Empty component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors['muted-foreground'] }]}>
        No tasks yet
      </Text>
      {editable && (
        <TouchableOpacity
          style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
          onPress={onAddTask}
        >
          <Plus size={18} color="white" />
          <Text style={styles.emptyAddText}>Add First Task</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [editable, colors, onAddTask]);

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
    >
      {/* Column Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
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

        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={18} color={colors['muted-foreground']} />
        </TouchableOpacity>
      </View>

      {/* Column Stats */}
      {!isCollapsed && stats.total > 0 && (
        <View style={[styles.stats, { backgroundColor: colors.muted }]}>
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
        />
      )}

      {/* WIP Limit Warning */}
      {column.wipLimit && tasks.length >= column.wipLimit && !isCollapsed && (
        <View style={[styles.wipWarning, { backgroundColor: colors.destructive }]}>
          <Text style={styles.wipWarningText}>
            WIP limit reached ({tasks.length}/{column.wipLimit})
          </Text>
        </View>
      )}
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
