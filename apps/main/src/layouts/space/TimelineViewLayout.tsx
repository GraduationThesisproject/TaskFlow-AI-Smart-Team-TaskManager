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
      case 'In Review': return 'in-review';
      case 'In Progress': return 'in-progress';
      case 'Completed': return 'completed';
      case 'To Do': return 'to-do';
      default: return 'default';
    }
  };

  const getProgressVariant = (status: Task['status']) => {
    switch (status) {
      case 'In Review': return 'info';
      case 'In Progress': return 'accent';
      case 'Completed': return 'success';
      case 'To Do': return 'warning';
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
      <Container size="lg" className="py-8">
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
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container size="7xl" className="py-6">
        {/* Header */}
        <Stack spacing="lg">
          <Typography variant="heading-xl">Finance Dashboard</Typography>

          {/* Navigation Tabs */}
          <Flex justify="between" align="center">
            <Flex gap="lg">
              <Button
                variant="ghost"
                onClick={() => navigate('/space/kanban')}
              >
                Kanban
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/space/list')}
              >
                List
              </Button>
              <Button variant="ghost" className="border-b-2 border-primary pb-1">
                Timeline
              </Button>
            </Flex>

            <Flex align="center" gap="md">
              <Button variant="default">
                + Add Task
              </Button>
              <Typography variant="body-small" textColor="muted">
                {taskStats.total} tasks
              </Typography>
            </Flex>
          </Flex>

          {/* Legend */}
          <Flex gap="lg" align="center">
            <Flex gap="sm" align="center">
              <div className="w-3 h-3 bg-info rounded-full"></div>
              <Typography variant="body-small">In review</Typography>
            </Flex>
            <Flex gap="sm" align="center">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <Typography variant="body-small">In Progress</Typography>
            </Flex>
            <Flex gap="sm" align="center">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <Typography variant="body-small">Completed</Typography>
            </Flex>
            <Flex gap="sm" align="center">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <Typography variant="body-small">To Do</Typography>
            </Flex>
          </Flex>
        </Stack>

        {/* Timeline */}
        <Card variant="default" className="mt-6">
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
                const position = getTimelinePosition(project.startDate!, project.endDate!);

                return (
                  <div key={project.id} className="grid grid-cols-7 gap-4 items-center">
                    {/* Project Info */}
                    <Stack spacing="xs">
                      <Flex gap="sm" align="center">
                        <Badge variant={getStatusVariant(project.status)} size="sm" />
                                                 <Typography variant="body-medium" className="font-semibold">
                           {project.title}
                         </Typography>
                      </Flex>
                      <Typography variant="body-small" textColor="muted">
                        {project.category}
                      </Typography>
                      <Typography variant="body-small" textColor="muted">
                        {project.progress}%
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
                        {formatDate(project.startDate!)} - {formatDate(project.endDate!)}
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
      </Container>
    </div>
  );
};
