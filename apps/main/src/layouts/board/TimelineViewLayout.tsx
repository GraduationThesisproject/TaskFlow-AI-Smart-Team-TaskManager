import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks, useTheme, useSpaceManager } from '../../hooks';
import type { Task } from '../../types/task.types';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Typography,
  Avatar,
  AvatarFallback,
  Container,
  Flex,
  Stack,
  Loading,
  Progress,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';

export const TimelineViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { theme } = useTheme();
  const { currentBoard, boardLoading, boardError } = useSpaceManager();
  const {
    tasks,
    loading,
    error,
    loadTasks,
    loadColumnsByBoard,
  } = useTasks();

  // Load data when component mounts
  useEffect(() => {
    if (boardId) {
      loadTasks(boardId);
      loadColumnsByBoard(boardId);
    }
  }, [boardId, loadTasks, loadColumnsByBoard]);

  // Generate timeline data from tasks
  const timelineData = useMemo(() => {
    if (!tasks.length) return [];
    
    // Group tasks by month based on due date
    const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
    const monthData = months.map((month, monthIndex) => {
      const monthStart = new Date(2024, monthIndex, 1);
      const monthEnd = new Date(2024, monthIndex + 1, 0);
      
      const monthTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      });

      return {
        month,
        monthIndex,
        tasks: monthTasks,
        startDate: monthStart,
        endDate: monthEnd
      };
    });

    return monthData;
  }, [tasks]);

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'review': return 'in-review';
      case 'in_progress': return 'in-progress';
      case 'done': return 'completed';
      case 'todo': return 'to-do';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getProgressVariant = (status: Task['status']) => {
    switch (status) {
      case 'review': return 'info';
      case 'in_progress': return 'accent';
      case 'done': return 'success';
      case 'todo': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimelinePosition = (dueDate: string, estimatedHours: number = 0) => {
    const due = new Date(dueDate);
    const projectStart = new Date('2024-01-01');
    const projectEnd = new Date('2024-06-30');

    const totalDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    const dueOffset = (due.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate width based on estimated hours (1 hour = 0.1% of timeline)
    const width = Math.max(2, Math.min(20, estimatedHours * 0.1));
    const left = Math.max(0, Math.min(100 - width, (dueOffset / totalDays) * 100));

    return { left: `${left}%`, width: `${width}%` };
  };

  if (boardLoading || loading) {
    return (
      <Loading
        fullScreen
        text="Loading timeline..."
        type="spinner"
      />
    );
  }

  if (boardError || error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" className="text-center">
          <CardContent className="p-8">
            <Typography variant="heading-large" className="text-error mb-4">
              {boardError || error || 'Failed to load timeline'}
            </Typography>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" className="text-center">
          <CardContent className="p-8">
            <Typography variant="heading-large" className="text-muted mb-4">
              Board not found
            </Typography>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];

  return (
    <div className="min-h-screen bg-transparent text-foreground w-full">
      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">

        {/* Header */}
        <div className="mb-6">
          <Typography variant="heading-large" className="mb-2">
            {currentBoard.name} Timeline
          </Typography>
          <Typography variant="body-medium" textColor="muted">
            Project timeline from January to June 2024
          </Typography>
        </div>

        {/* Legend */}
        <div className="mb-6">
          <div className="flex gap-6 items-center">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-info rounded-full"></div>
              <Typography variant="body-small">In review</Typography>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <Typography variant="body-small">In Progress</Typography>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <Typography variant="body-small">Completed</Typography>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <Typography variant="body-small">To Do</Typography>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card variant="default" className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <Typography variant="heading-large" className="mb-6">
              Project Timeline Jan 2024 - Jun 2024
            </Typography>

            {/* Timeline Header */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              <Typography variant="small">Task</Typography>
              {months.map((month) => (
                <Typography key={month} variant="small" className="text-center">
                  {month}
                </Typography>
              ))}
            </div>

            {/* Timeline Rows */}
            <Stack spacing="md">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Typography variant="body-medium" textColor="muted" className="mb-4">
                    No tasks found for this timeline
                  </Typography>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/boards/${boardId}/tasks/new`)}
                  >
                    Create First Task
                  </Button>
                </div>
              ) : (
                tasks.map((task) => {
                  if (!task.dueDate) return null; // Skip tasks without due dates
                  
                  const position = getTimelinePosition(task.dueDate, task.estimatedHours);

                  return (
                    <div key={task._id} className="grid grid-cols-7 gap-4 items-center">
                      {/* Task Info */}
                      <Stack spacing="xs">
                        <Flex gap="sm" align="center">
                          <Badge variant={getStatusVariant(task.status)} size="sm" />
                          <Typography variant="body-medium" className="font-semibold">
                            {task.title}
                          </Typography>
                        </Flex>
                        <Typography variant="body-small" textColor="muted">
                          {task.priority}
                        </Typography>
                        <Typography variant="body-small" textColor="muted">
                          {task.estimatedHours || 0}h
                        </Typography>
                      </Stack>

                      {/* Timeline Bar */}
                      <div className="col-span-6">
                        <div className="relative h-8 bg-muted rounded">
                          {/* Progress Bar */}
                          <div
                            className={`absolute top-1 bottom-1 rounded ${getProgressVariant(task.status) === 'accent' ? 'bg-accent' : getProgressVariant(task.status) === 'info' ? 'bg-info' : getProgressVariant(task.status) === 'success' ? 'bg-success' : 'bg-warning'}`}
                            style={{
                              left: position.left,
                              width: position.width
                            }}
                          >
                            {/* Assignee Avatar */}
                            <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                              {task.assignees.length > 0 ? (
                                task.assignees.map((assignee, index) => (
                                  <Avatar key={index} size="sm">
                                    <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                                      {getInitials(assignee)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))
                              ) : (
                                <Avatar size="sm">
                                  <AvatarFallback variant="default" size="sm">
                                    ?
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Due Date */}
                        <Typography variant="caption" textColor="muted" className="mt-1">
                          Due: {formatDate(task.dueDate)}
                        </Typography>

                        {/* Assignee Count */}
                        <Typography variant="caption" textColor="muted">
                          {task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}
                        </Typography>
                      </div>
                    </div>
                  );
                })
              )}
            </Stack>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
