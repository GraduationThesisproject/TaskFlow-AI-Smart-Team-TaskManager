/**
 * TaskCard Component - Draggable task card with smooth animations
 * Optimized with React.memo for performance
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  GripVertical,
  Clock,
  Paperclip,
  MessageSquare,
} from 'lucide-react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TaskCardProps, TaskPriority } from '@/types/dragBoard.types';

const LONG_PRESS_DURATION = 500;
const CARD_HEIGHT = 80;

// Priority color mapping
const getPriorityColor = (priority: TaskPriority): string => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[priority];
};

// Status color mapping
const getStatusColor = (status: string): string => {
  const colors = {
    todo: '#6b7280',
    in_progress: '#3b82f6',
    review: '#f59e0b',
    done: '#10b981',
  };
  return colors[status as keyof typeof colors] || colors.todo;
};

// Status display names
const getStatusDisplayName = (status: string): string => {
  const names = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  };
  return names[status as keyof typeof names] || status;
};

// Memoized TaskCard component for performance
export const TaskCard = memo<TaskCardProps & { onDragMoveForIndicator?: (absX: number, absY: number) => void }>(({ 
  task,
  columnId,
  index,
  onDragStart,
  onDragEnd,
  onPress,
  isDragging,
  isPlaceholder,
  onDragMoveForIndicator,
}) => {
  const colors = useThemeColors();
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);
  const rotateZ = useSharedValue(0);

  // Track drag state locally
  const isBeingDragged = useSharedValue(false);

  // Start drag handler
  const handleDragStart = useCallback(() => {
    'worklet';
    isBeingDragged.value = true;
    scale.value = withSpring(1.05, {
      damping: 15,
      stiffness: 300,
    });
    shadowOpacity.value = withSpring(0.3);
    opacity.value = withSpring(0.95);
    zIndex.value = 1000;
    rotateZ.value = withSpring(2); // Slight rotation for visual feedback
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    runOnJS(onDragStart)();
  }, [onDragStart]);

  // End drag handler
  const handleDragEnd = useCallback((absoluteX: number, absoluteY: number) => {
    'worklet';
    // Always drop back into the originating column; the parent decides cross-column moves
    const targetColumnId = columnId;

    // Calculate drop index based on Y position
    const dropIndex = Math.max(0, Math.floor((absoluteY + translateY.value) / CARD_HEIGHT));
    
    // Reset animations
    translateX.value = withSpring(0, { damping: 20 });
    translateY.value = withSpring(0, { damping: 20 });
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withSpring(1);
    shadowOpacity.value = withSpring(0.1);
    zIndex.value = withTiming(0, { duration: 200 });
    rotateZ.value = withSpring(0);
    isBeingDragged.value = false;
    
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onDragEnd)(targetColumnId, dropIndex);
  }, [onDragEnd]);

  // Create gesture handlers
  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart(handleDragStart)
    .shouldCancelWhenOutside(false);

  const panGesture = Gesture.Pan()
    .enabled(isDragging)
    .onUpdate((event) => {
      'worklet';
      if (isBeingDragged.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        
        // Add subtle rotation based on velocity
        const velocityRotation = interpolate(
          event.velocityX,
          [-500, 500],
          [-5, 5],
          Extrapolate.CLAMP
        );
        rotateZ.value = withSpring(2 + velocityRotation, {
          damping: 20,
        });
        if (onDragMoveForIndicator) {
          runOnJS(onDragMoveForIndicator)(event.absoluteX, event.absoluteY);
        }
      }
    })
    .onEnd((event) => {
      'worklet';
      if (isBeingDragged.value) {
        handleDragEnd(event.absoluteX, event.absoluteY);
      }
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    opacity: isPlaceholder ? 0.3 : opacity.value,
    zIndex: zIndex.value,
    shadowOpacity: shadowOpacity.value,
    elevation: interpolate(
      shadowOpacity.value,
      [0.1, 0.3],
      [2, 8],
      Extrapolate.CLAMP
    ),
  }));

  // Priority and Status with safe fallbacks
  const safePriority = (task.priority || 'medium') as TaskPriority;
  const safeStatus = task.status || 'todo';
  
  // Badge styles
  const priorityBadgeStyle = useMemo(() => ({
    backgroundColor: getPriorityColor(safePriority),
  }), [safePriority]);
  
  const statusBadgeStyle = useMemo(() => ({
    backgroundColor: getStatusColor(safeStatus),
  }), [safeStatus]);

  // Format due date
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return '';
    const date = new Date(task.dueDate);
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }, [task.dueDate]);

  // Check if task is overdue
  const isOverdue = useMemo(() => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }, [task.dueDate]);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={animatedCardStyle}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isDragging ? colors.primary : colors.border,
              borderWidth: isDragging ? 2 : 1,
              shadowColor: isDragging ? colors.primary : '#000',
            },
          ]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <GripVertical size={16} color={colors['muted-foreground']} />
          </View>

          {/* Task Content - Simplified and Safe */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text 
                style={[styles.title, { color: colors.foreground }]} 
                numberOfLines={2}
              >
                {String(task?.title || 'Untitled Task')}
              </Text>
              <View style={styles.badges}>
                <View style={[styles.statusBadge, statusBadgeStyle]}>
                  <Text style={styles.badgeText}>
                    {getStatusDisplayName(safeStatus)}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, priorityBadgeStyle]}>
                  <Text style={styles.badgeText}>
                    {String(safePriority).charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description - Only if exists */}
            {task?.description && String(task.description).length > 0 && (
              <Text 
                style={[styles.description, { color: colors['muted-foreground'] }]} 
                numberOfLines={1}
              >
                {String(task.description)}
              </Text>
            )}

            {/* Footer - Enhanced */}
            <View style={styles.footer}>
              <View style={styles.meta}>
                <Text style={[styles.metaText, { color: colors['muted-foreground'] }]}>
                  {String(safePriority).charAt(0).toUpperCase() + String(safePriority).slice(1)} Priority
                </Text>
                <Text style={[styles.metaText, { color: colors['muted-foreground'] }]}>
                  •
                </Text>
                <Text style={[styles.metaText, { color: getStatusColor(safeStatus) }]}>
                  {getStatusDisplayName(safeStatus)}
                </Text>
              </View>
              {formattedDueDate && (
                <View style={styles.metaItem}>
                  <Calendar size={12} color={isOverdue ? '#ef4444' : colors['muted-foreground']} />
                  <Text style={[styles.metaText, { 
                    color: isOverdue ? '#ef4444' : colors['muted-foreground'] 
                  }]}>
                    {formattedDueDate}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.task._id === nextProps.task._id &&
    prevProps.task.updatedAt === nextProps.task.updatedAt &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isPlaceholder === nextProps.isPlaceholder &&
    prevProps.index === nextProps.index &&
    prevProps.columnId === nextProps.columnId
  );
});

TaskCard.displayName = 'TaskCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  dragHandle: {
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
  },
  moreAssignees: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
  },
});
