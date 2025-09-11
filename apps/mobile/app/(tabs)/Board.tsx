import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  PanResponder,
  LayoutChangeEvent,
  KeyboardAvoidingView,
  Platform,
  Vibration
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolate,
  withTiming,
  useAnimatedReaction,
  measure,
  useAnimatedRef,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  Layout
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { 
  ArrowLeft, 
  Bell, 
  ChevronDown, 
  Search, 
  Plus, 
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  User,
  Clock,
  List,
  Grid3X3,
  CheckSquare,
  Paperclip,
  Users,
  MessageSquare,
  Activity,
  MapPin,
  Tag,
  FileText,
  Send,
  X,
  Check,
  CalendarDays,
  AtSign
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';

// Types
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Comment {
  id: string;
  text: string;
  author: { id: string; name: string; avatar?: string };
  createdAt: string;
  mentions?: string[];
}

interface ActivityLog {
  id: string;
  type: 'created' | 'updated' | 'moved' | 'commented' | 'assigned' | 'attachment' | 'checklist';
  description: string;
  user: { id: string; name: string; avatar?: string };
  timestamp: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'very high';
  dueDate?: string;
  startDate?: string;
  assignees: Array<{ id: string; name: string; avatar?: string }>;
  column: string;
  board: string;
  position: number;
  progress?: number;
  category?: string;
  coverColor?: string;
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  comments?: Comment[];
  activityLog?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

interface Column {
  _id: string;
  name: string;
  boardId: string;
  position: number;
  backgroundColor: string;
  icon?: string;
  taskIds: string[];
  settings: {
    wipLimit?: number;
  };
}

interface Board {
  _id: string;
  name: string;
  description?: string;
  spaceId: string;
}

function TasksScreen() {
  // State management
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Task details states
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [selectedMoveColumn, setSelectedMoveColumn] = useState<string>('');
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  
  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'very high'>('medium');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#F9FAFB');
  
  // Edit task form states
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high' | 'very high'>('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  
  // Enhanced drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number>(-1);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string>('');
  const [dropZoneColumn, setDropZoneColumn] = useState<string>('');
  const [dropZoneIndex, setDropZoneIndex] = useState<number>(-1);
  const [placeholderPosition, setPlaceholderPosition] = useState<{columnId: string, index: number} | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string>('');
  const [columnPositions, setColumnPositions] = useState<Record<string, {x: number, y: number, width: number, height: number}>>({});
  
  // Animated values for drag and drop
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const dragOpacity = useSharedValue(1);
  
  // Refs for measuring column positions
  const columnRefs = useRef<Record<string, any>>({});
  const taskRefs = useRef<Record<string, any>>({});
  const boardScrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef({ x: 0, y: 0 });
  
  // Mock board ID - in real app this would come from navigation params
  const boardId = 'mock-board-id';
  
  // Initialize with mock data
  useEffect(() => {
    loadMockData();
  }, []);
  
  const loadMockData = () => {
    setLoading(true);
    
    // Mock board
    setCurrentBoard({
      _id: boardId,
      name: 'Project Dashboard',
      description: 'Main project management board',
      spaceId: 'mock-space-id'
    });
    
    // Mock columns
    const mockColumns: Column[] = [
      {
        _id: 'col-1',
        name: 'To Do',
        boardId: boardId,
        position: 0,
        backgroundColor: '#FEF3C7',
        taskIds: ['task-1', 'task-2', 'task-3'],
        settings: { wipLimit: 5 }
      },
      {
        _id: 'col-2',
        name: 'In Progress',
        boardId: boardId,
        position: 1,
        backgroundColor: '#DBEAFE',
        taskIds: [],
        settings: { wipLimit: 3 }
      },
      {
        _id: 'col-3',
        name: 'Review',
        boardId: boardId,
        position: 2,
        backgroundColor: '#F3E8FF',
        taskIds: [],
        settings: { wipLimit: 2 }
      },
      {
        _id: 'col-4',
        name: 'Done',
        boardId: boardId,
        position: 3,
        backgroundColor: '#D1FAE5',
        taskIds: [],
        settings: {}
      }
    ];
    
    // Mock tasks with enhanced data
    const mockTasks: Task[] = [
      {
        _id: 'task-1',
        title: 'Log of dynamic progress … Creation of Layouts',
        description: 'Create comprehensive KPI metrics for quarterly review',
        status: 'todo',
        priority: 'very high',
        progress: 25,
        startDate: '2024-03-10',
        dueDate: '2024-03-15',
        category: 'Medium SaaS',
        coverColor: '#8B5CF6',
        assignees: [
          { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          { id: '2', name: 'Bob Smith', avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
        ],
        checklist: [
          { id: 'check-1', text: 'Create wireframes', completed: true },
          { id: 'check-2', text: 'Design mockups', completed: true },
          { id: 'check-3', text: 'Get client approval', completed: false },
          { id: 'check-4', text: 'Implement layouts', completed: false }
        ],
        attachments: [
          { id: 'att-1', name: 'wireframes.fig', size: '2.4 MB', type: 'figma', uploadedAt: '2024-03-02T10:00:00Z', uploadedBy: 'Alice Johnson' },
          { id: 'att-2', name: 'requirements.pdf', size: '156 KB', type: 'pdf', uploadedAt: '2024-03-01T10:00:00Z', uploadedBy: 'Bob Smith' }
        ],
        comments: [
          { 
            id: 'comm-1', 
            text: 'Created 4/4 given pages @alice', 
            author: { id: '2', name: 'Bob Smith', avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
            createdAt: '2024-03-03T14:30:00Z',
            mentions: ['alice']
          },
          { 
            id: 'comm-2', 
            text: 'Great progress! Let\'s review tomorrow @bob', 
            author: { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
            createdAt: '2024-03-03T15:00:00Z',
            mentions: ['bob']
          }
        ],
        activityLog: [
          { id: 'act-1', type: 'created', description: 'Task created', user: { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }, timestamp: '2024-03-01T10:00:00Z' },
          { id: 'act-2', type: 'assigned', description: 'Bob Smith assigned', user: { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }, timestamp: '2024-03-01T10:05:00Z' },
          { id: 'act-3', type: 'attachment', description: 'Added wireframes.fig', user: { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }, timestamp: '2024-03-02T10:00:00Z' },
          { id: 'act-4', type: 'checklist', description: 'Completed "Create wireframes"', user: { id: '2', name: 'Bob Smith', avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }, timestamp: '2024-03-03T09:00:00Z' },
          { id: 'act-5', type: 'commented', description: 'Added a comment', user: { id: '2', name: 'Bob Smith', avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }, timestamp: '2024-03-03T14:30:00Z' }
        ],
        column: 'col-1',
        board: boardId,
        position: 0,
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-03T15:00:00Z'
      },
      {
        _id: 'task-2',
        title: 'Budget Review Meeting',
        description: 'Quarterly budget analysis and planning session',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-03-18',
        category: 'Quarterly Planning',
        assignees: [
          { id: '3', name: 'Carol Davis', avatar: "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
        ],
        column: 'col-1',
        board: boardId,
        position: 1,
        createdAt: '2024-03-02T10:00:00Z',
        updatedAt: '2024-03-02T10:00:00Z'
      },
      {
        _id: 'task-3',
        title: 'Expense Report Analysis',
        description: 'Monthly expense tracking and categorization',
        status: 'todo',
        priority: 'low',
        progress: 60,
        dueDate: '2024-03-20',
        category: 'Monthly Review',
        assignees: [
          { id: '4', name: 'David Wilson', avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          { id: '5', name: 'Eva Brown', avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
        ],
        column: 'col-1',
        board: boardId,
        position: 2,
        createdAt: '2024-03-03T10:00:00Z',
        updatedAt: '2024-03-03T10:00:00Z'
      }
    ];
    
    setColumns(mockColumns);
    setTasks(mockTasks);
    setLoading(false);
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setRefreshing(false);
  };
  
  // Task management functions
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    const newTask: Task = {
      _id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'todo',
      priority: newTaskPriority,
      assignees: [],
      column: selectedColumn || columns[0]?._id || '',
      board: boardId,
      position: tasks.filter(t => t.column === (selectedColumn || columns[0]?._id)).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setIsAddTaskModalOpen(false);
  };
  
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      Alert.alert('Error', 'Please enter a column name');
      return;
    }
    
    const newColumn: Column = {
      _id: `col-${Date.now()}`,
      name: newColumnName,
      boardId: boardId,
      position: columns.length,
      backgroundColor: newColumnColor,
      taskIds: [],
      settings: {}
    };
    
    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setNewColumnColor('#F9FAFB');
    setIsAddColumnModalOpen(false);
  };
  
  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setNewColumnName(column.name);
    setNewColumnColor(column.backgroundColor);
    setIsEditColumnModalOpen(true);
  };
  
  const handleUpdateColumn = () => {
    if (!editingColumn || !newColumnName.trim()) return;
    
    setColumns(prev => prev.map(col => 
      col._id === editingColumn._id 
        ? { ...col, name: newColumnName, backgroundColor: newColumnColor }
        : col
    ));
    
    setIsEditColumnModalOpen(false);
    setEditingColumn(null);
    setNewColumnName('');
    setNewColumnColor('#F9FAFB');
  };
  
  const handleDeleteColumn = (columnId: string) => {
    Alert.alert(
      'Delete Column',
      'Are you sure you want to delete this column? All tasks will be moved to the first column.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Move tasks to first column
            const firstColumnId = columns[0]?._id;
            if (firstColumnId && firstColumnId !== columnId) {
              setTasks(prev => prev.map(task => 
                task.column === columnId 
                  ? { ...task, column: firstColumnId }
                  : task
              ));
            } else {
              // Delete tasks if no other column exists
              setTasks(prev => prev.filter(task => task.column !== columnId));
            }
            
            setColumns(prev => prev.filter(col => col._id !== columnId));
          }
        }
      ]
    );
  };
  
  // Stable drag and drop functions
  const moveTaskToColumn = (taskId: string, fromColumnId: string, toColumnId: string, insertIndex?: number) => {
    setTasks(prev => {
      const task = prev.find(t => t._id === taskId);
      if (!task || task.column === toColumnId) return prev;
      
      // Remove task from source column
      const withoutTask = prev.filter(t => t._id !== taskId);
      
      // Get target column tasks and determine insertion point
      const targetColumnTasks = withoutTask
        .filter(t => t.column === toColumnId)
        .sort((a, b) => a.position - b.position);
      
      const finalInsertIndex = insertIndex ?? targetColumnTasks.length;
      
      // Create updated task
      const updatedTask = {
        ...task,
        column: toColumnId,
        position: finalInsertIndex,
        updatedAt: new Date().toISOString()
      };
      
      // Reorder all tasks in target column
      const reorderedTargetTasks = targetColumnTasks.map((t, idx) => ({
        ...t,
        position: idx >= finalInsertIndex ? idx + 1 : idx
      }));
      
      // Combine all tasks
      const otherTasks = withoutTask.filter(t => t.column !== toColumnId);
      return [...otherTasks, ...reorderedTargetTasks, updatedTask];
    });
  };
  
  const reorderTasksInColumn = (columnId: string, fromIndex: number, toIndex: number) => {
    setTasks(prev => {
      const columnTasks = prev.filter(t => t.column === columnId);
      const otherTasks = prev.filter(t => t.column !== columnId);
      
      // Reorder within column
      const [movedTask] = columnTasks.splice(fromIndex, 1);
      columnTasks.splice(toIndex, 0, movedTask);
      
      // Update positions
      const updatedColumnTasks = columnTasks.map((task, index) => ({
        ...task,
        position: index,
        updatedAt: new Date().toISOString()
      }));
      
      return [...otherTasks, ...updatedColumnTasks];
    });
  };
  
  const findDropZone = useCallback((absoluteX: number, absoluteY: number) => {
    'worklet';
    try {
      // Find which column we're over
      let targetColumnId = '';
      let targetColumnIndex = -1;
      
      // Account for scroll offset
      const adjustedX = absoluteX + scrollOffset.current.x;
      
      // Find the column based on position
      Object.entries(columnPositions).forEach(([colId, pos], index) => {
        if (adjustedX >= pos.x && adjustedX <= pos.x + pos.width &&
            absoluteY >= pos.y && absoluteY <= pos.y + pos.height) {
          targetColumnId = colId;
          targetColumnIndex = index;
        }
      });
      
      if (targetColumnId) {
        // Highlight the column
        runOnJS(setHoveredColumn)(targetColumnId);
        runOnJS(setDropZoneColumn)(targetColumnId);
        
        // Calculate insertion index based on Y position within the column
        const columnTasks = tasks.filter(t => t.column === targetColumnId && t._id !== draggedTask?._id);
        const columnPos = columnPositions[targetColumnId];
        
        if (columnPos) {
          const relativeY = absoluteY - columnPos.y - 60; // Account for column header
          const taskHeight = 120; // Approximate task card height
          let insertIndex = Math.max(0, Math.floor(relativeY / taskHeight));
          insertIndex = Math.min(insertIndex, columnTasks.length);
          
          runOnJS(setDropZoneIndex)(insertIndex);
          runOnJS(setPlaceholderPosition)({ columnId: targetColumnId, index: insertIndex });
        }
      } else {
        runOnJS(setHoveredColumn)('');
        runOnJS(setDropZoneColumn)('');
        runOnJS(setDropZoneIndex)(-1);
        runOnJS(setPlaceholderPosition)(null);
      }
    } catch (error) {
      console.warn('Drop zone detection failed:', error);
      runOnJS(setHoveredColumn)('');
      runOnJS(setDropZoneColumn)('');
      runOnJS(setDropZoneIndex)(-1);
      runOnJS(setPlaceholderPosition)(null);
    }
  }, [columnPositions, tasks, draggedTask]);
  
  const handleDrop = useCallback(async (sourceColumnId: string, sourceIndex: number) => {
    try {
      if (dropZoneColumn && draggedTask) {
        // Haptic feedback on successful drop
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        if (dropZoneColumn === sourceColumnId) {
          // Same column reordering
          if (dropZoneIndex !== sourceIndex) {
            reorderTasksInColumn(sourceColumnId, sourceIndex, dropZoneIndex);
          }
        } else {
          // Cross-column move
          moveTaskToColumn(draggedTask._id, sourceColumnId, dropZoneColumn, dropZoneIndex);
        }
      }
    } catch (error) {
      console.warn('Drop failed:', error);
    } finally {
      resetDragState();
    }
  }, [dropZoneColumn, dropZoneIndex, draggedTask]);

  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDraggedTask(null);
    setDraggedTaskIndex(-1);
    setDraggedFromColumn('');
    setDropZoneColumn('');
    setDropZoneIndex(-1);
    setPlaceholderPosition(null);
    setHoveredColumn('');
  }, []);

  const handleTaskPress = (task: Task) => {
    // Open task details modal on tap
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || '');
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || '');
    setIsTaskDetailsModalOpen(false);
    setIsEditTaskModalOpen(true);
  };
  
  const handleUpdateTask = async () => {
    if (!selectedTask || !editTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    const updatedTask: Task = {
      ...selectedTask,
      title: editTaskTitle,
      description: editTaskDescription,
      priority: editTaskPriority,
      dueDate: editTaskDueDate || undefined,
      updatedAt: new Date().toISOString()
    };
    
    setTasks(prev => prev.map(t => t._id === selectedTask._id ? updatedTask : t));
    setEditTaskTitle('');
    setEditTaskDescription('');
    setEditTaskPriority('medium');
    setEditTaskDueDate('');
    setSelectedTask(null);
    setIsEditTaskModalOpen(false);
  };
  
  const closeTaskDetailsModal = () => {
    setSelectedTask(null);
    setIsTaskDetailsModalOpen(false);
  };
  
  const closeEditTaskModal = () => {
    setEditTaskTitle('');
    setEditTaskDescription('');
    setEditTaskPriority('medium');
    setEditTaskDueDate('');
    setSelectedTask(null);
    setIsEditTaskModalOpen(false);
  };
  
  const handleAddTaskToColumn = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddTaskModalOpen(true);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'kanban' ? 'list' : 'kanban');
  };
  
  // Group tasks by column with placeholder behavior
  const tasksByColumn = columns.reduce((acc, column) => {
    let columnTasks = tasks
      .filter(task => task.column === column._id)
      .sort((a, b) => a.position - b.position);
    
    // Remove dragged task from its original position to create gap
    if (isDragging && draggedTask && draggedTask.column === column._id) {
      columnTasks = columnTasks.filter(task => task._id !== draggedTask._id);
    }
    
    acc[column._id] = columnTasks;
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'done').length,
    inProgress: tasks.filter(task => task.status === 'in_progress').length,
    todo: tasks.filter(task => task.status === 'todo').length,
    review: tasks.filter(task => task.status === 'review').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'done';
    }).length
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'very high':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      default:
        return '#22c55e';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // List View Component
  const ListView = () => {
    const colors = useThemeColors();
    
    const getStatusDisplayName = (status: string) => {
      switch (status) {
        case 'todo': return 'To Do';
        case 'in_progress': return 'In Progress';
        case 'review': return 'Review';
        case 'done': return 'Done';
        default: return status;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'todo': return '#f59e0b';
        case 'in_progress': return '#3b82f6';
        case 'review': return '#8b5cf6';
        case 'done': return '#10b981';
        default: return colors['muted-foreground'];
      }
    };

    return (
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleTaskPress(task)}
          >
            <View style={styles.listItemHeader}>
              <Text style={[styles.listItemTitle, { color: colors.foreground }]} numberOfLines={1}>
                {task.title}
              </Text>
              <View style={[styles.listStatusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.listStatusText}>
                  {getStatusDisplayName(task.status)}
                </Text>
              </View>
            </View>
            
            {task.description && (
              <Text style={[styles.listItemDescription, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                {task.description}
              </Text>
            )}
            
            <View style={styles.listItemFooter}>
              <View style={styles.listItemMeta}>
                <View style={[styles.listPriorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.listPriorityText}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Text>
                </View>
                
                {task.dueDate && (
                  <View style={styles.listDueDateContainer}>
                    <Calendar color={colors['muted-foreground']} size={14} />
                    <Text style={[styles.listDueDate, { color: colors['muted-foreground'] }]}>
                      {formatDate(task.dueDate)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.listAssigneesContainer}>
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <Image
                    key={assignee.id}
                    source={{ uri: assignee.avatar || 'https://via.placeholder.com/24' }}
                    style={[
                      styles.listAssigneeAvatar,
                      { 
                        borderColor: colors.background,
                        marginLeft: idx > 0 ? -6 : 0 
                      }
                    ]}
                  />
                ))}
                {task.assignees.length > 3 && (
                  <View style={[
                    styles.listMoreAssignees,
                    { 
                      backgroundColor: colors.muted,
                      borderColor: colors.background 
                    }
                  ]}>
                    <Text style={[styles.listMoreAssigneesText, { color: colors.foreground }]}>
                      +{task.assignees.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors['muted-foreground'] }]}>
              No tasks found. Add your first task to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  // Draggable Task Card Component
  const DraggableTaskCard = ({ task, index, columnId }: { task: Task; index: number; columnId: string }) => {
    const colors = useThemeColors();
    
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const zIndex = useSharedValue(1);
    const shadowOpacity = useSharedValue(0.2);
    const elevation = useSharedValue(2);
    
    // Track if this specific card is being dragged
    const isThisCardDragging = draggedTask?._id === task._id;
    
    const longPressGesture = Gesture.LongPress()
      .minDuration(500) // 500ms for Trello-like feel
      .onStart(() => {
        'worklet';
        // Initial lift animation with shadow
        scale.value = withSpring(1.08, {
          damping: 15,
          stiffness: 350,
        });
        shadowOpacity.value = withTiming(0.4, { duration: 200 });
        elevation.value = withTiming(8, { duration: 200 });
        opacity.value = withTiming(0.95);
        zIndex.value = 1000;
        
        // Haptic feedback on pickup
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        
        runOnJS(() => {
          setIsDragging(true);
          setDraggedTask(task);
          setDraggedTaskIndex(index);
          setDraggedFromColumn(columnId);
        })();
      });
    
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        
        // Subtle rotation based on drag velocity
        const rotation = interpolate(
          event.velocityX,
          [-500, 0, 500],
          [-5, 0, 5],
          Extrapolate.CLAMP
        );
        
        // Update drop zone with debouncing
        runOnJS(findDropZone)(event.absoluteX, event.absoluteY);
      })
      .onEnd(() => {
        'worklet';
        // Smooth drop animation
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 350,
        });
        shadowOpacity.value = withTiming(0.2, { duration: 200 });
        elevation.value = withTiming(2, { duration: 200 });
        opacity.value = withTiming(1);
        zIndex.value = withTiming(1);
        
        runOnJS(handleDrop)(columnId, index);
      })
      .onFinalize(() => {
        'worklet';
        // Ensure everything is reset if gesture is cancelled
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        zIndex.value = 1;
        shadowOpacity.value = withTiming(0.2);
        elevation.value = withTiming(2);
      });
    
    const combinedGesture = Gesture.Simultaneous(longPressGesture, panGesture);
    
    const animatedStyle = useAnimatedStyle(() => {
      const shouldHide = isDragging && isThisCardDragging;
      
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
          { 
            rotate: `${interpolate(
              translateX.value,
              [-100, 0, 100],
              [-3, 0, 3],
              Extrapolate.CLAMP
            )}deg`
          }
        ],
        opacity: opacity.value,
        zIndex: zIndex.value,
        shadowOpacity: shadowOpacity.value,
        shadowRadius: elevation.value * 2,
        shadowOffset: {
          width: 0,
          height: elevation.value,
        },
        shadowColor: '#000',
        elevation: Platform.OS === 'android' ? elevation.value : undefined,
      };
    });
    
    // Animation for other cards shifting
    const shiftAnimatedStyle = useAnimatedStyle(() => {
      if (!isDragging || isThisCardDragging) return {};
      
      // Check if we need to shift this card
      if (placeholderPosition && 
          placeholderPosition.columnId === columnId &&
          index >= placeholderPosition.index) {
        return {
          transform: [
            { 
              translateY: withSpring(120, { // Height of a task card
                damping: 15,
                stiffness: 300,
              })
            }
          ]
        };
      }
      
      return {
        transform: [
          { translateY: withSpring(0) }
        ]
      };
    });
    
    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case 'very high':
          return '#ef4444';
        case 'high':
          return '#f97316';
        case 'medium':
          return '#eab308';
        default:
          return '#22c55e';
      }
    };
    
    return (
      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          ref={(ref) => {
            taskRefs.current[task._id] = ref;
          }}
          style={[
            styles.taskCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            animatedStyle,
            shiftAnimatedStyle
          ]}
        >
          <TouchableOpacity 
            style={styles.taskContent}
            onPress={() => handleTaskPress(task)}
            activeOpacity={0.7}
          >
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
                {task.title}
              </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>
          
          {task.description && (
            <Text style={[styles.taskDescription, { color: colors['muted-foreground'] }]} numberOfLines={2}>
              {task.description}
            </Text>
          )}
          
          {task.category && (
            <Text style={[styles.taskCategory, { color: colors['muted-foreground'] }]}>
              {task.category}
            </Text>
          )}
          
          {task.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${task.progress}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors['muted-foreground'] }]}>
                {task.progress}%
              </Text>
            </View>
          )}
          
          <View style={styles.taskFooter}>
            <View style={styles.assigneesContainer}>
              {task.assignees.slice(0, 3).map((assignee, idx) => (
                <Image
                  key={assignee.id}
                  source={{ uri: assignee.avatar || 'https://via.placeholder.com/24' }}
                  style={[
                    styles.assigneeAvatar,
                    { 
                      borderColor: colors.background,
                      marginLeft: idx > 0 ? -8 : 0 
                    }
                  ]}
                />
              ))}
              {task.assignees.length > 3 && (
                <View style={[
                  styles.moreAssignees,
                  { 
                    backgroundColor: colors.muted,
                    borderColor: colors.background 
                  }
                ]}>
                  <Text style={[styles.moreAssigneesText, { color: colors.foreground }]}>
                    +{task.assignees.length - 3}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.taskMeta}>
              {task.dueDate && (
                <View style={styles.dueDateContainer}>
                  <Calendar color={colors['muted-foreground']} size={12} />
                  <Text style={[styles.dueDate, { color: colors['muted-foreground'] }]}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    );
  };

  const colors = useThemeColors();
  const screenWidth = Dimensions.get('window').width;
  const columnWidth = screenWidth - 32; // Full width minus padding
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors['muted-foreground'] }]}>Loading board...</Text>
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadMockData}
        >
          <Text style={[styles.retryButtonText, { color: colors['primary-foreground'] }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Toggle Button */}
      <View style={styles.minimalHeader}>
        <Text style={[styles.boardTitle, { color: colors.foreground }]}>
          Task Board
        </Text>
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: colors.primary }]}
          onPress={toggleViewMode}
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

      {/* Conditional Rendering: Kanban or List View */}
      {viewMode === 'kanban' ? (
        <ScrollView
          ref={boardScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.boardContainer}
          contentContainerStyle={styles.boardContent}
          pagingEnabled={true}
          snapToInterval={columnWidth + 16}
          decelerationRate="fast"
          onScroll={(event) => {
            scrollOffset.current.x = event.nativeEvent.contentOffset.x;
            scrollOffset.current.y = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {columns.map((column) => {
            const columnTasks = tasksByColumn[column._id] || [];
            return (
              <Animated.View
                key={column._id}
                ref={(ref) => {
                  columnRefs.current[column._id] = ref;
                }}
                style={[
                  { width: columnWidth }, 
                  styles.column,
                  hoveredColumn === column._id && {
                    backgroundColor: colors.primary + '10',
                    borderColor: colors.primary,
                    borderWidth: 2,
                    borderRadius: 12,
                  }
                ]}
                onLayout={(event) => {
                  const { x, y, width, height } = event.nativeEvent.layout;
                  setColumnPositions(prev => ({
                    ...prev,
                    [column._id]: { x, y, width, height }
                  }));
                }}
              >
              {/* Column Header - No Background Color */}
              <View style={[styles.columnHeader, { backgroundColor: 'transparent' }]}>
                <View style={styles.columnTitleRow}>
                  <Text style={[styles.columnTitle, { color: colors.foreground }]}>{column.name}</Text>
                  {columnTasks.length > 0 && (
                    <View style={[styles.taskCount, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.taskCountText, { color: colors.foreground }]}>{columnTasks.length}</Text>
                    </View>
                  )}
                  {column.settings.wipLimit && (
                    <Text style={[styles.wipLimit, { color: colors['muted-foreground'] }]}>/{column.settings.wipLimit}</Text>
                  )}
                </View>
                <View style={styles.columnActions}>
                  <TouchableOpacity onPress={() => handleEditColumn(column)}>
                    <MoreVertical color={colors.foreground} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tasks */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.tasksContainer}
              >
                {columnTasks.map((task, taskIndex) => {
                  // Insert placeholder before this task if needed
                  const shouldShowPlaceholder = placeholderPosition && 
                    placeholderPosition.columnId === column._id && 
                    placeholderPosition.index === taskIndex;
                  
                  return (
                    <React.Fragment key={task._id}>
                      {shouldShowPlaceholder && (
                        <Animated.View 
                          entering={FadeIn.duration(200)}
                          exiting={FadeOut.duration(200)}
                          style={[
                            styles.placeholder,
                            { 
                              backgroundColor: colors.primary + '20',
                              borderColor: colors.primary,
                            }
                          ]}
                        >
                          <View style={styles.placeholderInner}>
                            <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                            <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                            <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                          </View>
                        </Animated.View>
                      )}
                      <DraggableTaskCard
                        task={task}
                        index={taskIndex}
                        columnId={column._id}
                      />
                    </React.Fragment>
                  );
                })}
                
                {/* Show placeholder at end of column if needed */}
                {placeholderPosition && 
                  placeholderPosition.columnId === column._id && 
                  placeholderPosition.index >= columnTasks.length && (
                  <Animated.View 
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={[
                      styles.placeholder,
                      { 
                        backgroundColor: colors.primary + '20',
                        borderColor: colors.primary,
                      }
                    ]}
                  >
                    <View style={styles.placeholderInner}>
                      <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                      <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                      <View style={[styles.placeholderDots, { backgroundColor: colors.primary }]} />
                    </View>
                  </Animated.View>
                )}
                
                {/* Add Task Button at bottom of column */}
                <TouchableOpacity 
                  style={[styles.addTaskInColumn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  onPress={() => handleAddTaskToColumn(column._id)}
                >
                  <View style={styles.addListContent}>
                    <Plus color={colors['muted-foreground']} size={16} />
                    <Text style={[styles.addListText, { color: colors['muted-foreground'] }]}>Add Task</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          );
        })}

        {/* Add Column Button */}
        <TouchableOpacity 
          style={[{ width: columnWidth }, styles.addListButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
          onPress={() => setIsAddColumnModalOpen(true)}
        >
          <View style={styles.addListContent}>
            <Plus color={colors['muted-foreground']} size={20} />
            <Text style={[styles.addListText, { color: colors['muted-foreground'] }]}>Add Column</Text>
          </View>
        </TouchableOpacity>
        </ScrollView>
      ) : (
        <ListView />
      )}

      {/* Add Task Modal */}
      <Modal
        visible={isAddTaskModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddTaskModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddTaskModalOpen(false)}>
              <Text style={[styles.modalCancelText, { color: colors['muted-foreground'] }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Task</Text>
            <TouchableOpacity onPress={handleAddTask}>
              <Text style={[styles.modalSaveText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Enter task description"
                placeholderTextColor={colors['muted-foreground']}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high', 'very high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      { backgroundColor: newTaskPriority === priority ? getPriorityColor(priority) : colors.muted }
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      { color: newTaskPriority === priority ? 'white' : colors.foreground }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Add Column Modal */}
      <Modal
        visible={isAddColumnModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddColumnModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddColumnModalOpen(false)}>
              <Text style={[styles.modalCancelText, { color: colors['muted-foreground'] }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Column</Text>
            <TouchableOpacity onPress={handleAddColumn}>
              <Text style={[styles.modalSaveText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Column Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newColumnName}
                onChangeText={setNewColumnName}
                placeholder="Enter column name"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Background Color</Text>
              <View style={styles.colorSelector}>
                {['#FEF3C7', '#DBEAFE', '#F3E8FF', '#D1FAE5', '#FEE2E2', '#F3F4F6'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color, borderColor: newColumnColor === color ? colors.primary : colors.border }
                    ]}
                    onPress={() => setNewColumnColor(color)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Edit Column Modal */}
      <Modal
        visible={isEditColumnModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditColumnModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditColumnModalOpen(false)}>
              <Text style={[styles.modalCancelText, { color: colors['muted-foreground'] }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Column</Text>
            <TouchableOpacity onPress={handleUpdateColumn}>
              <Text style={[styles.modalSaveText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Column Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newColumnName}
                onChangeText={setNewColumnName}
                placeholder="Enter column name"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Background Color</Text>
              <View style={styles.colorSelector}>
                {['#FEF3C7', '#DBEAFE', '#F3E8FF', '#D1FAE5', '#FEE2E2', '#F3F4F6'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color, borderColor: newColumnColor === color ? colors.primary : colors.border }
                    ]}
                    onPress={() => setNewColumnColor(color)}
                  />
                ))}
              </View>
            </View>
            
            {editingColumn && (
              <View style={styles.inputGroup}>
                <TouchableOpacity 
                  style={[styles.deleteButton, { backgroundColor: colors.destructive }]}
                  onPress={() => {
                    setIsEditColumnModalOpen(false);
                    handleDeleteColumn(editingColumn._id);
                  }}
                >
                  <Trash2 color="white" size={16} />
                  <Text style={styles.deleteButtonText}>Delete Column</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      
      {/* Enhanced Task Details Modal */}
      <Modal
        visible={isTaskDetailsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeTaskDetailsModal}
      >
        <KeyboardAvoidingView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {selectedTask && (
            <>
              {/* Task Cover */}
              {selectedTask.coverColor && (
                <View style={[styles.taskCover, { backgroundColor: selectedTask.coverColor }]} />
              )}
              
              {/* Modal Header */}
              <View style={[styles.modalHeader, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={closeTaskDetailsModal}>
                  <X color={colors['muted-foreground']} size={24} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {selectedTask.title}
                </Text>
                <TouchableOpacity onPress={() => handleEditTask(selectedTask)}>
                  <Edit3 color={colors.primary} size={20} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Board & Column Info */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <MapPin color={colors.primary} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.boardName, { color: colors.foreground }]}>
                      {currentBoard?.name || 'Project Board'}
                    </Text>
                    <Text style={[styles.columnIndicator, { color: colors['muted-foreground'] }]}>→</Text>
                    <TouchableOpacity 
                      style={[styles.columnBadge, { backgroundColor: colors.muted }]}
                      onPress={() => setShowMoveOptions(!showMoveOptions)}
                    >
                      <Text style={[styles.columnName, { color: colors.foreground }]}>
                        {columns.find(c => c._id === selectedTask.column)?.name || 'Unknown'}
                      </Text>
                      <ChevronDown color={colors['muted-foreground']} size={14} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Move Options */}
                  {showMoveOptions && (
                    <View style={styles.moveOptions}>
                      {columns.filter(c => c._id !== selectedTask.column).map(column => (
                        <TouchableOpacity
                          key={column._id}
                          style={[styles.moveOption, { backgroundColor: colors.muted }]}
                          onPress={() => {
                            moveTaskToColumn(selectedTask._id, selectedTask.column, column._id);
                            setSelectedTask({ ...selectedTask, column: column._id });
                            setShowMoveOptions(false);
                          }}
                        >
                          <Text style={[styles.moveOptionText, { color: colors.foreground }]}>
                            Move to {column.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setIsAddingChecklist(true)}
                  >
                    <CheckSquare color={colors.primary} size={20} />
                    <Text style={[styles.quickActionText, { color: colors.foreground }]}>Checklist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Paperclip color={colors.primary} size={20} />
                    <Text style={[styles.quickActionText, { color: colors.foreground }]}>Attach</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Users color={colors.primary} size={20} />
                    <Text style={[styles.quickActionText, { color: colors.foreground }]}>Members</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Members Assigned */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <Users color={colors.primary} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Members</Text>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                      <Plus color="white" size={14} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.membersList}>
                    {selectedTask.assignees.map((assignee) => (
                      <View key={assignee.id} style={styles.memberItem}>
                        <Image
                          source={{ uri: assignee.avatar || 'https://via.placeholder.com/40' }}
                          style={styles.memberAvatar}
                        />
                        <Text style={[styles.memberName, { color: colors.foreground }]}>
                          {assignee.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Description / Progress Log */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <FileText color={colors.primary} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description / Progress Log</Text>
                  </View>
                  <TextInput
                    style={[styles.descriptionInput, { color: colors.foreground, borderColor: colors.border }]}
                    value={selectedTask.description}
                    onChangeText={(text) => setSelectedTask({ ...selectedTask, description: text })}
                    placeholder="Add a description or progress update..."
                    placeholderTextColor={colors['muted-foreground']}
                    multiline
                    numberOfLines={4}
                  />
                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <View style={styles.progressLogs}>
                      {selectedTask.comments.slice(0, 2).map(comment => (
                        <View key={comment.id} style={[styles.logItem, { borderColor: colors.border }]}>
                          <Image
                            source={{ uri: comment.author.avatar || 'https://via.placeholder.com/24' }}
                            style={styles.logAvatar}
                          />
                          <View style={styles.logContent}>
                            <Text style={[styles.logText, { color: colors.foreground }]}>
                              {comment.text}
                            </Text>
                            <Text style={[styles.logTime, { color: colors['muted-foreground'] }]}>
                              {formatDate(comment.createdAt)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                {/* Checklist */}
                {(selectedTask.checklist && selectedTask.checklist.length > 0) || isAddingChecklist ? (
                  <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                      <CheckSquare color={colors.primary} size={18} />
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Checklist</Text>
                      <Text style={[styles.checklistProgress, { color: colors['muted-foreground'] }]}>
                        {selectedTask.checklist?.filter(item => item.completed).length || 0}/{selectedTask.checklist?.length || 0}
                      </Text>
                    </View>
                    <View style={styles.checklistItems}>
                      {selectedTask.checklist?.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.checklistItem}
                          onPress={() => {
                            const updatedChecklist = selectedTask.checklist?.map(check => 
                              check.id === item.id ? { ...check, completed: !check.completed } : check
                            );
                            setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
                          }}
                        >
                          <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: item.completed ? colors.primary : 'transparent' }]}>
                            {item.completed && <Check color="white" size={12} />}
                          </View>
                          <Text style={[
                            styles.checklistText, 
                            { 
                              color: item.completed ? colors['muted-foreground'] : colors.foreground,
                              textDecorationLine: item.completed ? 'line-through' : 'none'
                            }
                          ]}>
                            {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {isAddingChecklist && (
                        <View style={styles.addChecklistItem}>
                          <TextInput
                            style={[styles.checklistInput, { color: colors.foreground, borderColor: colors.border }]}
                            value={newChecklistItem}
                            onChangeText={setNewChecklistItem}
                            placeholder="Add an item..."
                            placeholderTextColor={colors['muted-foreground']}
                            onSubmitEditing={() => {
                              if (newChecklistItem.trim()) {
                                const newItem: ChecklistItem = {
                                  id: `check-${Date.now()}`,
                                  text: newChecklistItem,
                                  completed: false
                                };
                                setSelectedTask({
                                  ...selectedTask,
                                  checklist: [...(selectedTask.checklist || []), newItem]
                                });
                                setNewChecklistItem('');
                                setIsAddingChecklist(false);
                              }
                            }}
                            autoFocus
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ) : null}
                
                {/* Attachments */}
                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                      <Paperclip color={colors.primary} size={18} />
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Attachments</Text>
                    </View>
                    <View style={styles.attachmentsList}>
                      {selectedTask.attachments.map((attachment) => (
                        <TouchableOpacity
                          key={attachment.id}
                          style={[styles.attachmentItem, { backgroundColor: colors.muted }]}
                        >
                          <FileText color={colors['muted-foreground']} size={16} />
                          <View style={styles.attachmentInfo}>
                            <Text style={[styles.attachmentName, { color: colors.foreground }]}>
                              {attachment.name}
                            </Text>
                            <Text style={[styles.attachmentMeta, { color: colors['muted-foreground'] }]}>
                              {attachment.size} • {attachment.uploadedBy}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Dates */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <CalendarDays color={colors.primary} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dates</Text>
                  </View>
                  <View style={styles.datesContainer}>
                    {selectedTask.startDate && (
                      <View style={styles.dateItem}>
                        <Text style={[styles.dateLabel, { color: colors['muted-foreground'] }]}>Start Date</Text>
                        <TouchableOpacity style={[styles.dateValue, { backgroundColor: colors.muted }]}>
                          <Calendar color={colors['muted-foreground']} size={14} />
                          <Text style={[styles.dateText, { color: colors.foreground }]}>
                            {formatDate(selectedTask.startDate)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedTask.dueDate && (
                      <View style={styles.dateItem}>
                        <Text style={[styles.dateLabel, { color: colors['muted-foreground'] }]}>Due Date</Text>
                        <TouchableOpacity style={[styles.dateValue, { backgroundColor: colors.muted }]}>
                          <Calendar color={colors['muted-foreground']} size={14} />
                          <Text style={[styles.dateText, { color: colors.foreground }]}>
                            {formatDate(selectedTask.dueDate)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Activity Feed */}
                {selectedTask.activityLog && selectedTask.activityLog.length > 0 && (
                  <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                      <Activity color={colors.primary} size={18} />
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity</Text>
                    </View>
                    <View style={styles.activityList}>
                      {selectedTask.activityLog.map((activity) => (
                        <View key={activity.id} style={styles.activityItem}>
                          <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                          <View style={styles.activityContent}>
                            <View style={styles.activityHeader}>
                              <Image
                                source={{ uri: activity.user.avatar || 'https://via.placeholder.com/20' }}
                                style={styles.activityAvatar}
                              />
                              <Text style={[styles.activityUser, { color: colors.foreground }]}>
                                {activity.user.name}
                              </Text>
                              <Text style={[styles.activityAction, { color: colors['muted-foreground'] }]}>
                                {activity.description}
                              </Text>
                            </View>
                            <Text style={[styles.activityTime, { color: colors['muted-foreground'] }]}>
                              {formatDate(activity.timestamp)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Comments Section */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <MessageSquare color={colors.primary} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comments</Text>
                  </View>
                  
                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <View style={styles.commentsList}>
                      {selectedTask.comments.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                          <Image
                            source={{ uri: comment.author.avatar || 'https://via.placeholder.com/32' }}
                            style={styles.commentAvatar}
                          />
                          <View style={styles.commentContent}>
                            <View style={styles.commentHeader}>
                              <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
                                {comment.author.name}
                              </Text>
                              <Text style={[styles.commentTime, { color: colors['muted-foreground'] }]}>
                                {formatDate(comment.createdAt)}
                              </Text>
                            </View>
                            <Text style={[styles.commentText, { color: colors.foreground }]}>
                              {comment.text}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <View style={[styles.addCommentContainer, { borderColor: colors.border }]}>
                    <Image
                      source={{ uri: 'https://via.placeholder.com/32' }}
                      style={styles.currentUserAvatar}
                    />
                    <TextInput
                      style={[styles.commentInput, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Add a comment... Use @ to mention"
                      placeholderTextColor={colors['muted-foreground']}
                      multiline
                    />
                    <TouchableOpacity 
                      style={[styles.sendButton, { backgroundColor: newComment.trim() ? colors.primary : colors.muted }]}
                      disabled={!newComment.trim()}
                      onPress={() => {
                        if (newComment.trim()) {
                          const newCommentObj: Comment = {
                            id: `comm-${Date.now()}`,
                            text: newComment,
                            author: { id: 'current', name: 'You', avatar: 'https://via.placeholder.com/32' },
                            createdAt: new Date().toISOString(),
                            mentions: newComment.match(/@\w+/g)?.map(m => m.slice(1)) || []
                          };
                          setSelectedTask({
                            ...selectedTask,
                            comments: [...(selectedTask.comments || []), newCommentObj]
                          });
                          setNewComment('');
                        }
                      }}
                    >
                      <Send color="white" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal
        visible={isEditTaskModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditTaskModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditTaskModal}>
              <Text style={[styles.modalCancelText, { color: colors['muted-foreground'] }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Task</Text>
            <TouchableOpacity onPress={handleUpdateTask}>
              <Text style={[styles.modalSaveText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={editTaskTitle}
                onChangeText={setEditTaskTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={editTaskDescription}
                onChangeText={setEditTaskDescription}
                placeholder="Enter task description"
                placeholderTextColor={colors['muted-foreground']}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high', 'very high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      { backgroundColor: editTaskPriority === priority ? getPriorityColor(priority) : colors.muted }
                    ]}
                    onPress={() => setEditTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      { color: editTaskPriority === priority ? 'white' : colors.foreground }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Due Date</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={editTaskDueDate}
                onChangeText={setEditTaskDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchText: {
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  activeTab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inactiveTab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  activeTabText: {
    fontWeight: '600',
  },
  inactiveTabText: {
    fontWeight: '400',
  },
  boardContainer: {
    flex: 1,
  },
  boardContent: {
    paddingHorizontal: 16,
  },
  column: {
    marginRight: 16,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  columnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCount: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taskCountText: {
    fontSize: 12,
  },
  wipLimit: {
    fontSize: 12,
    marginLeft: 4,
  },
  columnActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tasksContainer: {
    flex: 1,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  taskCategory: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneesContainer: {
    flexDirection: 'row',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  dueDate: {
    fontSize: 12,
  },
  addListButton: {
    borderRadius: 12,
    height: 48,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addListContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addListText: {
    marginLeft: 8,
  },
  addTaskContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addTaskButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addTaskText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  
  // Task card additional styles
  moreAssigneesText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreAssignees: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    height: 60,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addTaskInColumn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Header styles
  minimalHeader: {
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
  
  // List View styles
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  listStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  listItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listPriorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  listDueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listDueDate: {
    fontSize: 12,
  },
  listAssigneesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listAssigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -4,
    borderWidth: 1,
    borderColor: 'white',
  },
  listMoreAssignees: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  listMoreAssigneesText: {
    fontSize: 8,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelText: {
    fontSize: 16,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Task Details Modal styles
  taskDetailText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  assigneeAvatarLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskContent: {
    flex: 1,
  },
  
  // Enhanced Task Details Modal Styles
  taskCover: {
    height: 80,
    width: '100%',
  },
  detailSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Location Section
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boardName: {
    fontSize: 14,
    fontWeight: '500',
  },
  columnIndicator: {
    fontSize: 14,
  },
  columnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  columnName: {
    fontSize: 14,
    fontWeight: '500',
  },
  moveOptions: {
    marginTop: 8,
    gap: 4,
  },
  moveOption: {
    padding: 10,
    borderRadius: 6,
  },
  moveOptionText: {
    fontSize: 14,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Members Section
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Description Section
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  progressLogs: {
    marginTop: 12,
    gap: 8,
  },
  logItem: {
    flexDirection: 'row',
    padding: 8,
    borderLeftWidth: 2,
    paddingLeft: 12,
    gap: 8,
  },
  logAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  logContent: {
    flex: 1,
  },
  logText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logTime: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Checklist Section
  checklistProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  checklistItems: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistText: {
    fontSize: 14,
    flex: 1,
  },
  addChecklistItem: {
    marginTop: 8,
  },
  checklistInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  
  // Attachments Section
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Dates Section
  datesContainer: {
    gap: 12,
  },
  dateItem: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  
  // Activity Section
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  activityAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityAction: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // Comments Section
  commentsList: {
    gap: 16,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  currentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    height: 100,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  placeholderInner: {
    flexDirection: 'row',
    gap: 8,
  },
  placeholderDots: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TasksScreen;