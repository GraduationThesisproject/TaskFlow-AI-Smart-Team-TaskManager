import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useDraggingContext } from './TaskDragContext';

export const TASK_CARD_HEIGHT = 120;

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  tags?: string[];
  onPress?: () => void;
  onLongPress?: () => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  selected?: boolean;
  isDraggable?: boolean;
  index?: number;
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  dueDate,
  tags = [],
  onPress,
  onLongPress,
  onDragStart,
  onDragEnd,
  selected = false,
  isDraggable = false,
  index = 0
}: TaskCardProps) {
  const colors = useThemeColors();
  
  // Get dragging context
  const { setDraggingTask, dragY, draggingTaskId, dragOffsetY } = useDraggingContext();
  
  // Animation values for drag feedback
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const marginTop = useSharedValue(0);
  const isDragging = useRef(false);

  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return colors['muted-foreground'];
      case 'in-progress':
        return colors.warning;
      case 'done':
        return colors.success;
      case 'archived':
        return colors.error;
      default:
        return colors['muted-foreground'];
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      case 'urgent':
        return colors.destructive;
      default:
        return colors['muted-foreground'];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'urgent':
        return 'Urgent';
      default:
        return priority;
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    isDragging.current = true;
    scale.value = withSpring(1.05);
    opacity.value = withSpring(0.8);
    onDragStart?.(id);
  };

  // Handle drag end
  const handleDragEnd = () => {
    isDragging.current = false;
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
    onDragEnd?.(id);
  };

  // Handle tap
  const handleTap = () => {
    if (!isDragging.current) {
      onPress?.();
    }
  };

  // Handle long press with drag context
  const handleLongPress = () => {
    onLongPress?.();
    if (isDraggable && setDraggingTask) {
      const yPosition = index * TASK_CARD_HEIGHT + 100; // Approximate header offset
      setDraggingTask(id, yPosition);
      handleDragStart();
    }
  };

  // Animated reactions for drop zone detection
  useAnimatedReaction(
    () => dragY?.value,
    (newDragY) => {
      if (!newDragY || !dragOffsetY) {
        marginTop.value = withTiming(0);
        return;
      }
      
      const itemY = index * TASK_CARD_HEIGHT + 100 - dragOffsetY.value;
      
      // If dragging above first item
      if (index === 0 && newDragY < itemY + TASK_CARD_HEIGHT) {
        marginTop.value = withTiming(TASK_CARD_HEIGHT);
        return;
      }
      
      // If dragging over current item
      const isOverItem = newDragY >= itemY && newDragY < itemY + TASK_CARD_HEIGHT;
      marginTop.value = withTiming(isOverItem ? TASK_CARD_HEIGHT : 0);
    },
    [index]
  );

  // Reset margins when drag ends
  useEffect(() => {
    if (!draggingTaskId) {
      marginTop.value = withTiming(0);
    }
  }, [draggingTaskId]);

  // Gesture configuration
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const composedGesture = Gesture.Race(longPressGesture, tapGesture);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      marginTop: marginTop.value,
    };
  });

  // Hide the original card when it's being dragged
  if (draggingTaskId === id) {
    return <Animated.View style={[styles.container, { height: TASK_CARD_HEIGHT, marginTop: marginTop }]} />;
  }

  const CardContent = () => (
    <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[TextStyles.body.small, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
            <Text style={[TextStyles.body.small, { color: getPriorityColor() }]}>
              {getPriorityText()}
            </Text>
          </View>
        </View>

        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginTop: 8 }]}>
          {title}
        </Text>

        {description && (
          <Text 
            style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 4 }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[TextStyles.caption.small, { color: colors['secondary-foreground'] }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                +{tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          {assignee && (
            <View style={styles.assigneeContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
                  {assignee.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                {assignee.name}
              </Text>
            </View>
          )}

          {dueDate && (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Due: {new Date(dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card>
  );

  if (isDraggable) {
    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.container,
            { minHeight: TASK_CARD_HEIGHT },
            selected && { borderColor: colors.primary, borderWidth: 2 },
            animatedStyle
          ]}
        >
          <CardContent />
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { minHeight: TASK_CARD_HEIGHT },
        selected && { borderColor: colors.primary, borderWidth: 2 },
        animatedStyle
      ]}
      onTouchEnd={handleTap}
    >
      <CardContent />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
});
