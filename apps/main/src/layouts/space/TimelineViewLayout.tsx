import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useTheme } from '../../hooks';
import type { Task } from '../../store/slices/taskSlice';
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
  const { theme } = useTheme();
  const {
    timelineTasks,
    loading,
    error,
    taskStats,
  } = useTasks();

  const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'review': return 'in-review';
      case 'in_progress': return 'in-progress';
      case 'done': return 'completed';
      case 'todo': return 'to-do';
      default: return 'default';
    }
  };

  const getProgressVariant = (status: Task['status']) => {
    switch (status) {
      case 'review': return 'info';
      case 'in_progress': return 'accent';
      case 'done': return 'success';
      case 'todo': return 'warning';
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

  const getTimelinePosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const projectStart = new Date('2024-01-01');
    const projectEnd = new Date('2024-06-30');

    const totalDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (start.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  if (loading) {
    return (
      <Loading
        fullScreen
        text="Loading timeline..."
        type="spinner"
      />
    );
  }

    if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="outlined" className="text-center">
          <CardContent className="p-8">
            <Typography variant="heading-large" className="text-error mb-4">
              {error}
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

  return (
    <div className="min-h-screen bg-transparent text-foreground w-full">
      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">


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
              <Typography variant="small">Project</Typography>
              {months.map((month) => (
                <Typography key={month} variant="small" className="text-center">
                  {month}
                </Typography>
              ))}
            </div>

            {/* Timeline Rows */}
            <Stack spacing="md">
              {timelineTasks.map((project) => {
                const position = getTimelinePosition(project.startDate!, project.dueDate!);

                return (
                  <div key={project._id} className="grid grid-cols-7 gap-4 items-center">
                    {/* Project Info */}
                    <Stack spacing="xs">
                      <Flex gap="sm" align="center">
                        <Badge variant={getStatusVariant(project.status)} size="sm" />
                                                 <Typography variant="body-medium" className="font-semibold">
                           {project.title}
                         </Typography>
                      </Flex>
                      <Typography variant="body-small" textColor="muted">
                        {project.priority}
                      </Typography>
                      <Typography variant="body-small" textColor="muted">
                        {project.estimatedHours || 0}h
                      </Typography>
                    </Stack>

                    {/* Timeline Bar */}
                    <div className="col-span-6">
                      <div className="relative h-8 bg-muted rounded">
                        {/* Progress Bar */}
                        <div
                          className={`absolute top-1 bottom-1 rounded ${getProgressVariant(project.status) === 'accent' ? 'bg-accent' : getProgressVariant(project.status) === 'info' ? 'bg-info' : getProgressVariant(project.status) === 'success' ? 'bg-success' : 'bg-warning'}`}
                          style={{
                            left: position.left,
                            width: position.width
                          }}
                        >
                          {/* Assignee Avatar */}
                          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                            {project.assignees.map((assignee, index) => (
                              <Avatar key={index} size="sm">
                                <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                                  {getInitials(assignee)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Date Range */}
                      <Typography variant="caption" textColor="muted" className="mt-1">
                        {formatDate(project.startDate!)} - {formatDate(project.dueDate!)}
                      </Typography>

                      {/* Assignee Count */}
                      <Typography variant="caption" textColor="muted">
                        {project.assignees.length} assignee{project.assignees.length !== 1 ? 's' : ''}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
