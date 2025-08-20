import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useTheme } from '../../hooks';
import type { Task } from '../../store/slices/taskSlice';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Typography, 
  Avatar, 
  AvatarFallback,
  Container,
  Flex,
  Stack,
  Loading,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';

export const KanbanViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    tasksByStatus,
    loading,
    error,
    taskStats,
  } = useTasks();

  const columns = ['To Do', 'In Progress', 'In Review', 'Completed'];

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'Very High': return 'very-high';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'To Do': return 'to-do';
      case 'In Progress': return 'in-progress';
      case 'In Review': return 'in-review';
      case 'Completed': return 'completed';
      default: return 'default';
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/space/task/${task.id}`);
  };

  if (loading) {
    return (
      <Loading 
        fullScreen 
        text="Loading tasks..." 
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
              <Button variant="ghost" className="border-b-2 border-primary pb-1">
                Kanban
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/space/list')}
              >
                List
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/space/timeline')}
              >
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
        </Stack>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 mt-6">
          {columns.map((column) => (
            <div key={column} className="flex-shrink-0 w-80">
              <Card variant="default" className="h-fit">
                <CardHeader>
                  <Flex justify="between" align="center">
                                         <CardTitle>
                       <Typography variant="body-large" className="font-semibold">
                         {column}
                       </Typography>
                     </CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tasksByStatus[column as keyof typeof tasksByStatus]?.length || 0}
                    </Badge>
                  </Flex>
                </CardHeader>
                
                <CardContent>
                  <Stack spacing="sm">
                    {tasksByStatus[column as keyof typeof tasksByStatus]?.map((task: Task) => (
                      <Card 
                        key={task.id}
                        variant="ghost" 
                        className="cursor-pointer hover:bg-muted/50 transition-colors border border-border"
                        onClick={() => handleTaskClick(task)}
                      >
                        <CardContent className="p-4">
                          {/* Task Header */}
                          <Flex justify="between" align="start" className="mb-2">
                            <Flex gap="sm" align="center">
                              <Badge variant="default" size="sm">
                                {task.category}
                              </Badge>
                              <Badge variant={getPriorityVariant(task.priority)} size="sm">
                                {task.priority}
                              </Badge>
                            </Flex>
                          </Flex>

                                                     {/* Task Title */}
                           <Typography variant="body-medium" className="mb-2 font-semibold">
                             {task.title}
                           </Typography>

                          {/* Task Description */}
                          <Typography variant="body-small" textColor="muted" className="mb-3 line-clamp-2">
                            {task.description || 'No description provided'}
                          </Typography>

                          {/* Task Footer */}
                          <Flex justify="between" align="center">
                            <Flex gap="xs" align="center">
                              {task.assignees.slice(0, 3).map((assignee: string, index: number) => (
                                <Avatar key={index} size="sm">
                                  <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                                    {getInitials(assignee)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignees.length > 3 && (
                                <Typography variant="caption" textColor="muted">
                                  +{task.assignees.length - 3} more
                                </Typography>
                              )}
                            </Flex>
                            <Typography variant="caption" textColor="muted">
                              {task.dueDate}
                            </Typography>
                          </Flex>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add Task Button */}
                    <Button 
                      variant="outline" 
                      className="w-full p-3 border-2 border-dashed border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add Task
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};
