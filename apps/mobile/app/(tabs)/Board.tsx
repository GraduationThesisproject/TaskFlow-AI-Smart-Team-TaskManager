import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated as RNAnimated
} from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
  Layout,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { 
  Plus, 
  MoreVertical,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  List,
  Grid3X3,
  GripVertical
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';

// Types
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignees: Array<{ id: string; name: string; avatar?: string }>;
  column: string;
  position: number;
  tags?: string[];
  attachments?: number;
  comments?: number;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  _id: string;
  name: string;
  boardId: string;
  position: number;
  color: string;
  tasks: Task[];
}

interface Board {
  _id: string;
  name: string;
  description?: string;
  spaceId: string;
  columns: Column[];
}

// Draggable Task Card Component
const DraggableTaskCard = ({ 
  task, 
  columnId, 
  index,
  onDragStart,
  onDragEnd,
  isDragging,
  onPress
}: {
  task: Task;
  columnId: string;
  index: number;
  onDragStart: (taskId: string) => void;
  onDragEnd: (toColumn: string, toIndex: number) => void;
  isDragging: boolean;
  onPress: () => void;
}) => {
  const colors = useThemeColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const elevation = useSharedValue(2);
  const [isBeingDragged, setIsBeingDragged] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  };

  const startDrag = useCallback(() => {
    setIsBeingDragged(true);
    onDragStart(task._id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [task._id, onDragStart]);

  const endDrag = useCallback((finalX: number, finalY: number) => {
    // Calculate which column we're over based on X position
    const screenWidth = Dimensions.get('window').width;
    const columnWidth = screenWidth - 32;
    const columnIndex = Math.floor((finalX + translateX.value) / (columnWidth + 16));
    const targetColumnId = columnIndex === 0 ? 'col-1' : 
                           columnIndex === 1 ? 'col-2' : 
                           columnIndex === 2 ? 'col-3' : 
                           columnIndex === 3 ? 'col-4' : columnId;
    
    // Calculate drop index based on Y position
    const dropIndex = Math.max(0, Math.floor((finalY + translateY.value) / 80));
    
    setIsBeingDragged(false);
    onDragEnd(targetColumnId, dropIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [columnId, onDragEnd, translateX, translateY]);

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      'worklet';
      scale.value = withSpring(1.08, { damping: 15 });
      zIndex.value = 1000;
      elevation.value = withSpring(10);
      opacity.value = withSpring(0.95);
      runOnJS(startDrag)();
    });

  const panGesture = Gesture.Pan()
    .enabled(isBeingDragged)
    .onChange((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onFinalize((event) => {
      'worklet';
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      zIndex.value = withTiming(0);
      elevation.value = withSpring(2);
      
      if (isBeingDragged) {
        runOnJS(endDrag)(event.absoluteX, event.absoluteY);
      }
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: zIndex.value,
    elevation: elevation.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.taskCard,
            {
              backgroundColor: colors.card,
              borderColor: isDragging ? colors.primary : colors.border,
              borderWidth: isDragging ? 2 : 1,
              shadowColor: isDragging ? colors.primary : '#000',
              shadowOpacity: isDragging ? 0.3 : 0.1,
              elevation: isDragging ? 8 : 2,
            },
          ]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          <View style={styles.dragHandle}>
            <GripVertical size={16} color={colors['muted-foreground']} />
          </View>
          
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>
                  {task.priority === 'urgent' ? '!' : task.priority[0].toUpperCase()}
                </Text>
              </View>
            </View>

            {task.description && (
              <Text style={[styles.taskDescription, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                {task.description}
              </Text>
            )}

            <View style={styles.taskFooter}>
              {task.assignees.length > 0 && (
                <View style={styles.assigneesContainer}>
                  {task.assignees.slice(0, 3).map((assignee, idx) => (
                    <View
                      key={assignee.id}
                      style={[
                        styles.assigneeAvatar,
                        {
                          backgroundColor: colors.primary,
                          marginLeft: idx > 0 ? -8 : 0,
                        },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {assignee.name[0].toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {task.assignees.length > 3 && (
                    <Text style={[styles.moreAssignees, { color: colors['muted-foreground'] }]}>
                      +{task.assignees.length - 3}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.taskMeta}>
                {task.dueDate && (
                  <View style={styles.metaItem}>
                    <Calendar size={12} color={colors['muted-foreground']} />
                    <Text style={[styles.metaText, { color: colors['muted-foreground'] }]}>
                      {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                )}
                {task.comments && task.comments > 0 && (
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaText, { color: colors['muted-foreground'] }]}>
                      💬 {task.comments}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

// Column Component with Drag and Drop
const DroppableColumn = ({
  column,
  onTaskMove,
  onTaskPress,
  onAddTask,
  draggedTaskId,
  onDragStart,
}: {
  column: Column;
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string, toIndex: number) => void;
  onTaskPress: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  draggedTaskId: string | null;
  onDragStart: (taskId: string) => void;
}) => {
  const colors = useThemeColors();
  const [localTasks, setLocalTasks] = useState(column.tasks);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const columnOpacity = useSharedValue(1);
  const columnScale = useSharedValue(1);

  useEffect(() => {
    setLocalTasks(column.tasks);
  }, [column.tasks]);

  const handleDragStart = useCallback((taskId: string) => {
    // Visual feedback when drag starts
    columnOpacity.value = withSpring(0.98);
  }, [columnOpacity]);

  const handleDragEnd = useCallback(
    (taskId: string, toColumnId: string, toIndex: number) => {
      columnOpacity.value = withSpring(1);
      if (toColumnId === column._id) {
        // Dropped in same column - just reorder
        columnScale.value = withSequence(
          withSpring(1.02),
          withSpring(1)
        );
      }
      onTaskMove(taskId, column._id, toColumnId, toIndex);
    },
    [column._id, onTaskMove, columnOpacity, columnScale]
  );

  const animatedColumnStyle = useAnimatedStyle(() => ({
    opacity: columnOpacity.value,
    transform: [{ scale: columnScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.column,
        animatedColumnStyle,
        {
          backgroundColor: colors.background,
          borderColor: isDraggedOver ? colors.primary : colors.border,
          borderWidth: isDraggedOver ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.columnHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.columnTitleRow}>
          <View style={[styles.columnDot, { backgroundColor: column.color }]} />
          <Text style={[styles.columnTitle, { color: colors.foreground }]}>
            {column.name}
          </Text>
          <View style={[styles.taskCount, { backgroundColor: colors.muted }]}>
            <Text style={[styles.taskCountText, { color: colors.foreground }]}>
              {localTasks.length}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreVertical size={18} color={colors['muted-foreground']} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.tasksContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tasksContent}
      >
        {localTasks.map((task, index) => (
          <DraggableTaskCard
            key={task._id}
            task={task}
            columnId={column._id}
            index={index}
            onDragStart={handleDragStart}
            onDragEnd={(toColumn, toIndex) => handleDragEnd(task._id, toColumn, toIndex)}
            isDragging={draggedTaskId === task._id}
            onPress={() => onTaskPress(task)}
          />
        ))}

        <TouchableOpacity
          style={[
            styles.addTaskButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onAddTask(column._id)}
        >
          <Plus size={16} color={colors['muted-foreground']} />
          <Text style={[styles.addTaskText, { color: colors['muted-foreground'] }]}>
            Add Task
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

// Task Details Modal
const TaskDetailsModal = ({
  visible,
  task,
  onClose,
  onUpdate,
}: {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}) => {
  const colors = useThemeColors();
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task || !editedTask) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Task Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors['muted-foreground'] }]}>Title</Text>
              <TextInput
                style={[styles.detailInput, { color: colors.foreground, borderColor: colors.border }]}
                value={editedTask.title}
                onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
                placeholder="Task title"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors['muted-foreground'] }]}>Description</Text>
              <TextInput
                style={[styles.detailTextArea, { color: colors.foreground, borderColor: colors.border }]}
                value={editedTask.description}
                onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                placeholder="Add a description..."
                placeholderTextColor={colors['muted-foreground']}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors['muted-foreground'] }]}>Priority</Text>
              <View style={styles.priorityOptions}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: editedTask.priority === priority ? colors.primary : colors.muted,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        {
                          color: editedTask.priority === priority
                            ? colors['primary-foreground']
                            : colors.foreground,
                        },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors['muted-foreground'] }]}>Due Date</Text>
              <TouchableOpacity
                style={[styles.detailInput, { borderColor: colors.border }]}
              >
                <Calendar size={16} color={colors['muted-foreground']} />
                <Text style={[styles.dateText, { color: colors.foreground }]}>
                  {editedTask.dueDate
                    ? new Date(editedTask.dueDate).toLocaleDateString()
                    : 'Set due date'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                onUpdate(editedTask);
                onClose();
              }}
            >
              <Text style={[styles.saveButtonText, { color: colors['primary-foreground'] }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


// Main Board Component
function TasksScreen() {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get('window').width;
  const columnWidth = screenWidth - 32;
  
  // State
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<string | null>(null);
  
  // Initialize with mock data
  useEffect(() => {
    loadMockData();
  }, []);
  
  const loadMockData = () => {
    setLoading(true);
    
    // Mock columns with tasks
    const mockColumns: Column[] = [
      {
        _id: 'col-1',
        name: 'To Do',
        boardId: 'board-1',
        position: 0,
        color: '#FEF3C7',
        tasks: [
          {
            _id: 'task-1',
            title: 'Design new dashboard layout',
            description: 'Create wireframes and mockups for the new dashboard',
            status: 'todo',
            priority: 'high',
            dueDate: '2024-03-15',
            assignees: [
              { id: '1', name: 'Alice Johnson' },
              { id: '2', name: 'Bob Smith' }
            ],
            column: 'col-1',
            position: 0,
            comments: 3,
            attachments: 2,
            createdAt: '2024-03-01T10:00:00Z',
            updatedAt: '2024-03-01T10:00:00Z'
          },
          {
            _id: 'task-2',
            title: 'Implement user authentication',
            description: 'Set up secure login and registration system',
            status: 'todo',
            priority: 'urgent',
            dueDate: '2024-03-20',
            assignees: [
              { id: '3', name: 'Carol Davis' }
            ],
            column: 'col-1',
            position: 1,
            comments: 5,
            createdAt: '2024-03-02T10:00:00Z',
            updatedAt: '2024-03-02T10:00:00Z'
          },
          {
            _id: 'task-3',
            title: 'Write API documentation',
            description: 'Document all REST API endpoints',
            status: 'todo',
            priority: 'medium',
            assignees: [],
            column: 'col-1',
            position: 2,
            createdAt: '2024-03-03T10:00:00Z',
            updatedAt: '2024-03-03T10:00:00Z'
          }
        ]
      },
      {
        _id: 'col-2',
        name: 'In Progress',
        boardId: 'board-1',
        position: 1,
        color: '#DBEAFE',
        tasks: []
      },
      {
        _id: 'col-3',
        name: 'Review',
        boardId: 'board-1',
        position: 2,
        color: '#F3E8FF',
        tasks: []
      },
      {
        _id: 'col-4',
        name: 'Done',
        boardId: 'board-1',
        position: 3,
        color: '#D1FAE5',
        tasks: []
      }
    ];
    
    setColumns(mockColumns);
    setLoading(false);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadMockData();
      setRefreshing(false);
    }, 1000);
  };
  
  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleTaskMove = useCallback((taskId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
    if (!taskId || !fromColumnId || !toColumnId) {
      setDraggedTaskId(null);
      return;
    }

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const fromColumn = newColumns.find(col => col._id === fromColumnId);
      const toColumn = newColumns.find(col => col._id === toColumnId);
      
      if (!fromColumn || !toColumn) return prevColumns;
      
      const taskIndex = fromColumn.tasks.findIndex(t => t._id === taskId);
      if (taskIndex === -1) return prevColumns;
      
      // If moving within same column, handle reordering
      if (fromColumnId === toColumnId) {
        const [movedTask] = fromColumn.tasks.splice(taskIndex, 1);
        fromColumn.tasks.splice(toIndex, 0, movedTask);
        
        // Update positions
        fromColumn.tasks.forEach((task, idx) => {
          task.position = idx;
        });
      } else {
        // Moving between columns
        const [movedTask] = fromColumn.tasks.splice(taskIndex, 1);
        movedTask.column = toColumnId;
        movedTask.position = toIndex;
        
        toColumn.tasks.splice(toIndex, 0, movedTask);
        
        // Update positions
        fromColumn.tasks.forEach((task, idx) => {
          task.position = idx;
        });
        toColumn.tasks.forEach((task, idx) => {
          task.position = idx;
        });
      }
      
      return newColumns;
    });
    
    setDraggedTaskId(null);
    setDraggedOverColumnId(null);
  }, []);
  
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const column = newColumns.find(col => col._id === updatedTask.column);
      if (column) {
        const taskIndex = column.tasks.findIndex(t => t._id === updatedTask._id);
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = updatedTask;
        }
      }
      return newColumns;
    });
  };
  
  const handleAddTask = (columnId: string) => {
    Alert.alert('Add Task', `Add a new task to column ${columnId}`);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors['muted-foreground'] }]}>Loading board...</Text>
      </View>
    );
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.boardTitle, { color: colors.foreground }]}>
            Task Board
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: colors.primary }]}
            onPress={() => setViewMode(prev => prev === 'kanban' ? 'list' : 'kanban')}
          >
            {viewMode === 'kanban' ? (
              <List color="white" size={16} />
            ) : (
              <Grid3X3 color="white" size={16} />
            )}
            <Text style={styles.toggleButtonText}>
              {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Board */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.boardContainer}
          contentContainerStyle={styles.boardContent}
          pagingEnabled={true}
          snapToInterval={columnWidth + 16}
          decelerationRate="fast"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {columns.map((column) => (
            <DroppableColumn
              key={column._id}
              column={column}
              onTaskMove={handleTaskMove}
              onTaskPress={handleTaskPress}
              onAddTask={handleAddTask}
              draggedTaskId={draggedTaskId}
              onDragStart={handleDragStart}
            />
          ))}
          
          {/* Add Column Button */}
          <TouchableOpacity 
            style={[{ width: columnWidth }, styles.addColumnButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => Alert.alert('Add Column', 'Add a new column to the board')}
          >
            <View style={styles.addColumnContent}>
              <Plus color={colors['muted-foreground']} size={20} />
              <Text style={[styles.addColumnText, { color: colors['muted-foreground'] }]}>Add Column</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Task Details Modal */}
        <TaskDetailsModal
          visible={showTaskDetails}
          task={selectedTask}
          onClose={() => {
            setShowTaskDetails(false);
            setSelectedTask(null);
          }}
          onUpdate={handleTaskUpdate}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  boardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonText: {
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
  column: {
    width: Dimensions.get('window').width - 32,
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    minHeight: 400,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  columnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  columnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  taskCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksContent: {
    paddingBottom: 8,
  },
  taskCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
  },
  dragHandle: {
    paddingRight: 8,
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  taskDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  moreAssignees: {
    marginLeft: 4,
    fontSize: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
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
  },
  addTaskText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  addColumnButton: {
    borderRadius: 12,
    height: 100,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addColumnContent: {
    alignItems: 'center',
  },
  addColumnText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TasksScreen;