import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  Card, 
  Typography, 
  Stack, 
  Badge, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import { useTaskSocket } from '../../hooks/socket/useTaskSocket';
import { TaskService, UserService } from '../../services';
import {
  fetchTasks,
  fetchBoard,
  fetchSpace,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  setCurrentTask,
  selectTasks,
  selectColumns,
  selectCurrentBoard,
  selectCurrentSpace,
  selectLoading,
  selectError,
  selectSocketConnected
} from '../../store/slices/taskSlice';
import type { Task, CreateTaskForm, UpdateTaskForm, MoveTaskForm, User } from '../../types/task.types';
import { getTestWorkspaceId, getTestSpaceId, getTestBoardId, getTestUserId } from '../../config/env';

export const TaskManagementExample: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const columns = useSelector(selectColumns);
  const currentBoard = useSelector(selectCurrentBoard);
  const currentSpace = useSelector(selectCurrentSpace);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const socketConnected = useSelector(selectSocketConnected);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize task socket
  const taskSocket = useTaskSocket({
    boardId: currentBoard?._id,
    spaceId: currentSpace?._id,
    workspaceId: getTestWorkspaceId()
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const usersResponse = await UserService.getUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
        }
        
        // Load space first
        await dispatch(fetchSpace(getTestSpaceId()) as any);
        
        // Load board
        await dispatch(fetchBoard(getTestBoardId()) as any);
        
        // Load tasks
        await dispatch(fetchTasks(getTestBoardId()) as any);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [dispatch]);

  // Handle task creation
  const handleCreateTask = async () => {
    const newTaskData: CreateTaskForm = {
      title: 'New Task from Example',
      description: 'This is a task created from the example component',
      boardId: getTestBoardId(),
      columnId: 'column_1', // This will need to be updated when you have real column IDs
      priority: 'medium',
      assignees: [getTestUserId()],
      tags: ['Example'],
      estimatedHours: 4,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      position: 0
    };

    try {
      // Use Redux thunk
      await dispatch(createTask(newTaskData) as any);
      
      // Also emit via socket for real-time updates
      taskSocket.createTask(newTaskData);
      
      console.log('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskId: string) => {
    const updates: UpdateTaskForm = {
      title: 'Updated Task Title',
      description: 'This task has been updated',
      priority: 'high',
      status: 'in_progress'
    };

    try {
      // Use Redux thunk
      await dispatch(updateTask({ taskId, updates }) as any);
      
      // Also emit via socket for real-time updates
      taskSocket.updateTask(taskId, updates);
      
      console.log('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle task movement
  const handleMoveTask = async (taskId: string, targetColumnId: string) => {
    const moveData: MoveTaskForm = {
      columnId: targetColumnId,
      position: 0
    };

    try {
      // Use Redux thunk
      await dispatch(moveTask({ taskId, moveData }) as any);
      
      // Also emit via socket for real-time updates
      taskSocket.moveTask(taskId, moveData);
      
      console.log('Task moved successfully');
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      // Use Redux thunk
      await dispatch(deleteTask(taskId) as any);
      
      // Also emit via socket for real-time updates
      taskSocket.deleteTask(taskId);
      
      console.log('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle task selection
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    dispatch(setCurrentTask(task));
  };

  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user._id === userId);
  };

  // Get tasks by column
  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.column === columnId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'review': return 'warning';
      case 'in_progress': return 'info';
      case 'todo': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Typography>Loading task management system...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Typography variant="h3" className="text-error mb-4">
          Error: {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="mb-2">
            Task Management Example
          </Typography>
          <Typography variant="body-medium" className="text-neutral-600">
            {currentSpace?.name} → {currentBoard?.name}
          </Typography>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={socketConnected ? 'default' : 'destructive'}>
            {socketConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          
          <Button onClick={handleCreateTask} variant="gradient">
            Create Task
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Typography variant="h4" className="text-primary">
            {tasks.length}
          </Typography>
          <Typography variant="body-small">Total Tasks</Typography>
        </Card>
        
        <Card className="p-4">
          <Typography variant="h4" className="text-success">
            {tasks.filter(t => t.status === 'done').length}
          </Typography>
          <Typography variant="body-small">Completed</Typography>
        </Card>
        
        <Card className="p-4">
          <Typography variant="h4" className="text-warning">
            {tasks.filter(t => t.status === 'in_progress').length}
          </Typography>
          <Typography variant="body-small">In Progress</Typography>
        </Card>
        
        <Card className="p-4">
          <Typography variant="h4" className="text-error">
            {tasks.filter(t => t.status === 'todo').length}
          </Typography>
          <Typography variant="body-small">To Do</Typography>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <Typography variant="h3">Tasks</Typography>
        
        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <Typography variant="body-medium" className="text-neutral-500">
              No tasks found. Create your first task to get started!
            </Typography>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const assignee = getUserById(task.assignees?.[0] || '');
              
              return (
                <Card 
                  key={task._id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="h4" className="font-medium">
                          {task.title}
                        </Typography>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <Typography variant="body-medium" className="text-neutral-600 mb-3">
                          {task.description}
                        </Typography>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        {assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarImage src={assignee.avatar} />
                              <AvatarFallback>
                                {getInitials(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{assignee.name}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <span>Due: {formatDate(task.dueDate)}</span>
                        )}
                        
                        {task.estimatedHours && (
                          <span>Est: {task.estimatedHours}h</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
