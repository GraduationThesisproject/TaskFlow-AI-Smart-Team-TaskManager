import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks, useTheme } from '../../hooks';
import type { Task } from '../../types/task.types';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  Badge, 
  Typography, 
  Avatar, 
  AvatarFallback,
  Container,
  Flex,
  Stack,
  Loading,
  Input,
  Select,
  Checkbox,
  Progress,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';

// Define subtask interface since it's not in the main types
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

interface TaskDetailsLayoutProps {
  taskId?: string;
}

export const TaskDetailsLayout: React.FC<TaskDetailsLayoutProps> = ({ taskId: propTaskId }) => {
  const { taskId: paramTaskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const taskId = propTaskId || paramTaskId;
  
  const {
    currentTask,
    loading,
    error,
    loadTaskById,
    editTask,
    removeTask,
  } = useTasks();

  const [localTask, setLocalTask] = useState<Partial<Task & { subtasks?: Subtask[]; labels?: string[]; estimatedTime?: string; progress?: number }>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (taskId) {
      // Since loadTaskById doesn't take parameters, we'll need to handle this differently
      // For now, we'll just log the taskId
      console.log('Task ID to load:', taskId);
    }
  }, [taskId]);

  useEffect(() => {
    if (currentTask) {
      setLocalTask(currentTask);
    }
  }, [currentTask]);

  const handleSave = async () => {
    if (taskId && localTask) {
      try {
        await editTask(taskId, localTask);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (taskId && confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(taskId);
        navigate('/space');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    if (!localTask.subtasks) return;
    
    const updatedSubtasks = localTask.subtasks.map((subtask: Subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed } : subtask
    );
    
    setLocalTask({
      ...localTask,
      subtasks: updatedSubtasks,
      progress: updatedSubtasks.length > 0 
        ? (updatedSubtasks.filter((st: Subtask) => st.completed).length / updatedSubtasks.length) * 100
        : 0
    });
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'very-high';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Loading 
        fullScreen 
        text="Loading task details..." 
        type="spinner"
      />
    );
  }

  if (error || !currentTask) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" className="text-center">
          <CardContent className="p-8">
            <Typography variant="heading-large" className="text-error mb-4">
              {error || 'Task not found'}
            </Typography>
            <Button 
              variant="outline" 
              onClick={() => navigate('/space')}
            >
              Back to Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedSubtasks = localTask.subtasks?.filter((st: Subtask) => st.completed).length || 0;
  const totalSubtasks = localTask.subtasks?.length || 0;

  return (
    <div className="flex h-screen bg-background text-foreground w-full">
      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Flex justify="between" align="center" className="mb-6">
            <Typography variant="heading-xl">Task Details</Typography>
            <Flex gap="md" align="center">
              <Select
                value={localTask.status || ''}
                onChange={(e) => setLocalTask({ ...localTask, status: e.target.value as Task['status'] })}
                disabled={!isEditing}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </Select>
              <Badge variant={getPriorityVariant(localTask.priority!)} size="sm">
                {localTask.priority} Priority
              </Badge>
            </Flex>
          </Flex>

          {/* Assignees */}
          <Flex gap="sm" align="center" className="mb-6">
            {localTask.assignees?.map((assignee: string, index: number) => (
              <Avatar key={index} size="sm">
                <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                  {getInitials(assignee)}
                </AvatarFallback>
              </Avatar>
            ))}
            {isEditing && (
              <Button variant="outline" size="icon-sm" className="w-8 h-8">
                +
              </Button>
            )}
          </Flex>

          {/* Description */}
          <Card variant="default" className="mb-6">
            <CardHeader>
                             <CardTitle>
                 <Typography variant="body-large" className="font-semibold">Description</Typography>
               </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={localTask.description || ''}
                onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
                placeholder="Add task description..."
                disabled={!isEditing}
                className="w-full h-32 bg-background border border-border rounded p-3 resize-none"
              />
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card variant="default" className="mb-6">
            <CardHeader>
              <Flex justify="between" align="center">
                                 <CardTitle>
                   <Typography variant="body-large" className="font-semibold">Subtasks</Typography>
                 </CardTitle>
                <Flex gap="sm" align="center">
                  <Typography variant="body-small" textColor="muted">
                    {completedSubtasks} of {totalSubtasks} completed
                  </Typography>
                  <Progress 
                    value={totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}
                    className="w-16 h-2"
                  />
                </Flex>
              </Flex>
            </CardHeader>
            
            <CardContent>
              <Stack spacing="sm">
                {localTask.subtasks?.map((subtask: Subtask) => (
                  <Card key={subtask.id} variant="ghost" className="p-3">
                    <Flex justify="between" align="center">
                      <Flex gap="md" align="center">
                        <Checkbox
                          checked={subtask.completed}
                          onChange={(e) => handleSubtaskToggle(subtask.id, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <Typography 
                          variant="body-medium" 
                          className={subtask.completed ? 'line-through text-muted-foreground' : ''}
                        >
                          {subtask.title}
                        </Typography>
                      </Flex>
                      <Flex gap="sm" align="center">
                        <Typography variant="body-small" textColor="muted">
                          {subtask.dueDate}
                        </Typography>
                        <Avatar size="sm">
                          <AvatarFallback variant={getAvatarColor(subtask.assignee || '')} size="sm">
                            {getInitials(subtask.assignee || '')}
                          </AvatarFallback>
                        </Avatar>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Stack>
              
              {isEditing && (
                <Button variant="outline" className="mt-3">
                  + Add Subtask
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Comments & Activity */}
          <Card variant="default">
            <CardHeader>
                             <CardTitle>
                 <Typography variant="body-large" className="font-semibold">Comments & Activity</Typography>
               </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="md">
                {/* Mock comments - replace with real data */}
                <Flex gap="md">
                  <Avatar size="sm">
                    <AvatarFallback variant="primary" size="sm">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Typography variant="body-medium" className="mb-1">
                      Updated the wireframes based on client feedback. Ready for review.
                    </Typography>
                    <Typography variant="caption" textColor="muted">
                      2 hours ago
                    </Typography>
                  </div>
                </Flex>
                <Flex gap="md">
                  <Avatar size="sm">
                    <AvatarFallback variant="primary" size="sm">AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Typography variant="body-medium" className="mb-1">
                      Looks great! Just need to adjust the spacing on mobile.
                    </Typography>
                    <Typography variant="caption" textColor="muted">
                      1 hour ago
                    </Typography>
                  </div>
                </Flex>
              </Stack>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-card border-l border-border p-6">
        <div className="h-full overflow-y-auto">
          <Stack spacing="lg">
            {/* Due Date */}
                         <div>
               <Typography variant="small" className="mb-2">
                 Due Date
               </Typography>
              <Input
                type="date"
                value={localTask.dueDate || ''}
                onChange={(e) => setLocalTask({ ...localTask, dueDate: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {/* Labels */}
                         <div>
               <Typography variant="small" className="mb-2">
                 Labels
               </Typography>
               <Flex gap="sm" wrap="wrap">
                {localTask.labels?.map((label: string, index: number) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {label}
                  </Badge>
                ))}
              </Flex>
            </div>

            {/* Estimated Time */}
                         <div>
               <Typography variant="small" className="mb-2">
                 Estimated Time
               </Typography>
              <Flex gap="sm" align="center">
                <Input
                  type="number"
                  value={localTask.estimatedTime?.replace(/\D/g, '') || ''}
                  onChange={(e) => setLocalTask({ 
                    ...localTask, 
                    estimatedTime: `${e.target.value} days` 
                  })}
                  disabled={!isEditing}
                  className="w-16"
                />
                <Typography variant="body-small" textColor="muted">
                  days
                </Typography>
              </Flex>
            </div>

            {/* Dependencies */}
                         <div>
               <Typography variant="small" className="mb-2">
                 Dependencies
               </Typography>
              <Stack spacing="sm">
                {localTask.dependencies?.map((dep: any, index: number) => (
                  <Flex key={index} gap="sm" align="center">
                    <span>🔗</span>
                    <Typography variant="body-small">{dep.task || dep}</Typography>
                  </Flex>
                ))}
              </Stack>
            </div>

            {/* Action Buttons */}
            <Stack spacing="sm">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Task
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/space')}>
                    Back to Tasks
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete Task
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  );
};
