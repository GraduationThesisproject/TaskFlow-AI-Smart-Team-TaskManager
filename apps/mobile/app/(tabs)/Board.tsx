import React, { useState, useEffect } from 'react';
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
  RefreshControl
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
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
  Clock
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import TaskCard from '@/components/cards/TaskCard';
import { TaskDragArea } from '@/components/cards/TaskDragContext';
import DraggingTaskCard from '@/components/cards/DraggingTaskCard';

// Types
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'very high';
  dueDate?: string;
  assignees: Array<{ id: string; name: string; avatar?: string }>;
  column: string;
  board: string;
  position: number;
  progress?: number;
  category?: string;
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

export default function TasksScreen() {
  // State management
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  
  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'very high'>('medium');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#F9FAFB');
  
  // Long press state for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  
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
    
    // Mock tasks
    const mockTasks: Task[] = [
      {
        _id: 'task-1',
        title: 'Define KPI list for Q2',
        description: 'Create comprehensive KPI metrics for quarterly review',
        status: 'todo',
        priority: 'very high',
        progress: 25,
        dueDate: '2024-03-15',
        category: 'Medium SaaS',
        assignees: [
          { id: '1', name: 'Alice Johnson', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          { id: '2', name: 'Bob Smith', avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
        ],
        column: 'col-1',
        board: boardId,
        position: 0,
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z'
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
  
  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string, newPosition?: number) => {
    setTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        return {
          ...task,
          column: toColumnId,
          position: newPosition ?? task.position,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  };
  
  const handleTaskLongPress = (task: Task) => {
    setDraggedTask(task);
    setIsDragging(true);
    
    // Show available columns for dropping
    Alert.alert(
      'Move Task',
      'Select a column to move this task to:',
      [
        ...columns.filter(col => col._id !== task.column).map(col => ({
          text: col.name,
          onPress: () => {
            moveTask(task._id, task.column, col._id);
            setIsDragging(false);
            setDraggedTask(null);
          }
        })),
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setIsDragging(false);
            setDraggedTask(null);
          }
        }
      ]
    );
  };
  
  const handleTaskPress = (task: Task) => {
    // Simple tap does nothing - only long press moves tasks
    return;
  };
  
  const handleAddTaskToColumn = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddTaskModalOpen(true);
  };
  
  // Group tasks by column
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column._id] = tasks.filter(task => task.column === column._id)
      .sort((a, b) => a.position - b.position);
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
    <TaskDragArea 
      updateItemPosition={(taskId, yPosition) => {
        console.log('Update item position:', taskId, yPosition);
        const task = tasks.find(t => t._id === taskId);
        if (task) {
          handleTaskLongPress(task);
        }
      }}
      renderDraggingItem={(taskId) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return null;
        return (
          <DraggingTaskCard
            id={task._id}
            title={task.title}
            description={task.description}
            status={task.status as 'todo' | 'in-progress' | 'done' | 'archived'}
            priority={task.priority as 'low' | 'medium' | 'high' | 'urgent'}
          />
        );
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Simplified Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <ArrowLeft color={colors.foreground} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Project Dashboard
            </Text>
          </View>
          <TouchableOpacity>
            <Bell color={colors.foreground} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Search color={colors['muted-foreground']} size={20} />
          <Text style={[styles.searchText, { color: colors['muted-foreground'] }]}>Search tasks...</Text>
        </View>
      </View>

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.activeTab, { backgroundColor: colors.primary }]}>
          <Text style={[styles.activeTabText, { color: colors['primary-foreground'] }]}>Kanban</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={[styles.inactiveTabText, { color: colors['muted-foreground'] }]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={[styles.inactiveTabText, { color: colors['muted-foreground'] }]}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Board Columns */}
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
        {columns.map((column) => {
          const columnTasks = tasksByColumn[column._id] || [];
          return (
            <View
              key={column._id}
              style={[{ width: columnWidth }, styles.column]}
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
                {columnTasks.map((task, taskIndex) => (
                  <TaskCard
                    key={task._id}
                    id={task._id}
                    title={task.title}
                    description={task.description}
                    status={task.status as 'todo' | 'in-progress' | 'done' | 'archived'}
                    priority={task.priority as 'low' | 'medium' | 'high' | 'urgent'}
                    assignee={task.assignees[0] ? {
                      id: task.assignees[0].id,
                      name: task.assignees[0].name,
                      avatar: task.assignees[0].avatar
                    } : undefined}
                    dueDate={task.dueDate}
                    tags={task.category ? [task.category] : []}
                    isDraggable={true}
                    index={taskIndex}
                    onPress={() => handleTaskPress(task)}
                    onLongPress={() => console.log('Long press detected on task:', task._id)}
                    onDragStart={(id) => {
                      console.log('Drag started for task:', id);
                      const dragTask = tasks.find(t => t._id === id);
                      if (dragTask) {
                        setDraggedTask(dragTask);
                        setIsDragging(true);
                      }
                    }}
                    onDragEnd={(id) => {
                      console.log('Drag ended for task:', id);
                      setIsDragging(false);
                      setDraggedTask(null);
                    }}
                    selected={draggedTask?._id === task._id}
                  />
                ))}
                
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
            </View>
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
      </View>
    </TaskDragArea>
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
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
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
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
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
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addTaskInColumn: {
    borderRadius: 12,
    height: 48,
    marginTop: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});