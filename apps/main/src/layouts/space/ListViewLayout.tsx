import React, { useState } from 'react';
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
  Input,
  Select,
  Progress,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';


export const ListViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    tasks,
    loading,
    error,
    filters,
    sortBy,
    searchQuery,
    taskStats,
    uniqueCategories,
    uniqueAssignees,
    uniquePriorities,
    updateFilters,
    updateSortBy,
    updateSearchQuery,
    resetFilters,
  } = useTasks();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'completed';
      case 'In Progress': return 'in-progress';
      case 'In Review': return 'in-review';
      case 'To Do': return 'to-do';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'Very High': return 'very-high';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'default';
    }
  };

  const getPriorityLevel = (priority: Task['priority']) => {
    switch (priority) {
      case 'Very High': return 5;
      case 'High': return 4;
      case 'Medium': return 3;
      case 'Low': return 1;
      default: return 1;
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


          {/* Controls */}
          <div className="flex gap-4 items-center mb-6">
            <div className="flex gap-3">
              <Select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  updateSortBy(field as keyof Task, direction as 'asc' | 'desc');
                }}
                className="bg-background border-border/50 focus:border-primary"
              >
                <option value="title-asc">Sort by Title (A-Z)</option>
                <option value="title-desc">Sort by Title (Z-A)</option>
                <option value="dueDate-asc">Sort by Date (Oldest)</option>
                <option value="dueDate-desc">Sort by Date (Newest)</option>
                <option value="priority-asc">Sort by Priority (Low-High)</option>
                <option value="priority-desc">Sort by Priority (High-Low)</option>
                <option value="status-asc">Sort by Status</option>
              </Select>
              
              <Select
                value={filters.status.length > 0 ? filters.status[0] : 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilters({ 
                    status: value === 'all' ? [] : [value] 
                  });
                }}
                className="bg-background border-border/50 focus:border-primary"
              >
                <option value="all">All Tasks</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50 focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
            </div>
          </div>

        {/* Task Table */}
        <Card variant="default" className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
                    {/* Table Header */}
                     <div className="grid grid-cols-6 gap-6 p-6 bg-gradient-to-r from-muted/20 to-muted/10 border-b border-border/30">
            <Typography variant="small" className="font-semibold text-muted-foreground">Task</Typography>
            <Typography variant="small" className="font-semibold text-muted-foreground">Status</Typography>
            <Typography variant="small" className="font-semibold text-muted-foreground">Progress</Typography>
            <Typography variant="small" className="font-semibold text-muted-foreground">Priority</Typography>
            <Typography variant="small" className="font-semibold text-muted-foreground">Assignees</Typography>
            <Typography variant="small" className="font-semibold text-muted-foreground">Due Date</Typography>
          </div>

          {/* Table Body */}
                     <div className="divide-y divide-border/20">
             {tasks.map((task) => (
               <div 
                 key={task.id} 
                 className="grid grid-cols-6 gap-6 p-6 hover:bg-muted/10 cursor-pointer transition-all duration-200 group"
                onClick={() => handleTaskClick(task)}
              >
                {/* Task Column */}
                <div className="space-y-2">
                  <Flex gap="sm" align="center">
                    <Badge variant="default" size="sm">
                      {task.category}
                    </Badge>
                    {task.status === 'Completed' && (
                      <span className="text-success">✓</span>
                    )}
                  </Flex>
                                     <Typography variant="body-medium" className="font-semibold">
                     {task.title}
                   </Typography>
                  <Flex gap="md" align="center">
                    <Typography variant="caption" textColor="muted">
                      💬 {task.comments}
                    </Typography>
                    <Typography variant="caption" textColor="muted">
                      📎 {task.attachments}
                    </Typography>
                    <Typography variant="caption" textColor="muted">
                      ⏱️ {task.estimatedTime}
                    </Typography>
                  </Flex>
                </div>

                {/* Status Column */}
                <Flex align="center">
                  <Badge variant={getStatusVariant(task.status)} size="sm">
                    {task.status}
                  </Badge>
                </Flex>

                {/* Progress Column */}
                <Flex align="center">
                  <Flex gap="sm" align="center">
                    <Typography variant="body-small">
                      {task.progress}% Done
                    </Typography>
                    <Progress 
                      value={task.progress} 
                      variant={task.progress > 50 ? 'warning' : 'default'}
                      className="w-16 h-2"
                    />
                  </Flex>
                </Flex>

                {/* Priority Column */}
                <Flex align="center">
                  <Badge variant={getPriorityVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </Flex>

                {/* Assignees Column */}
                <Flex align="center">
                  <Flex gap="xs" align="center">
                    {task.assignees.slice(0, 2).map((assignee, index) => (
                      <Avatar key={index} size="sm">
                        <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                          {getInitials(assignee)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assignees.length > 2 && (
                      <Typography variant="caption" textColor="muted">
                        +{task.assignees.length - 2}
                      </Typography>
                    )}
                  </Flex>
                </Flex>

                {/* Due Date Column */}
                <Flex align="center">
                  <Typography variant="body-small">
                    {task.dueDate}
                  </Typography>
                </Flex>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
