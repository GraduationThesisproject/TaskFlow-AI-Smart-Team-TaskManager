import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardContent,
  Badge,
  Typography,
  Avatar,
  AvatarFallback,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import type { Task } from '../../store/slices/taskSlice';

interface DraggableTaskProps {
  task: Task;
  index: number;
  columnId: string;
  onClick: (task: Task) => void;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  columnId,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Debug logging
  console.log('DraggableTask render:', { 
    taskId: task._id, 
    taskTitle: task.title, 
    index,
    columnId 
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBars = (priority: string) => {
    const bars = [];
    const count = priority === 'critical' ? 5 : priority === 'high' ? 4 : priority === 'medium' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      bars.push(
        <div key={i} className={`w-1 h-4 rounded-full ${getPriorityColor(priority).replace('text-', 'bg-')}`} />
      );
    }
    return bars;
  };

  const getLabelColor = (tag: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800'];
    const index = tag.length % colors.length;
    return colors[index];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks`;
    return `${Math.floor(diffInDays / 30)} months`;
  };

  const progressPercentage = (task.estimatedHours || 0) > 0 ? (task.actualHours / (task.estimatedHours || 1)) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick(task);
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => {
        // Update dragging state
        if (snapshot.isDragging !== isDragging) {
          setIsDragging(snapshot.isDragging);
        }

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 transition-all duration-200 ${
              snapshot.isDragging ? 'opacity-50 scale-95 rotate-2' : ''
            }`}
            onClick={handleClick}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                {/* Header with Label and Priority */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1">
                    {task.tags && task.tags.slice(0, 2).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`text-xs px-2 py-1 ${getLabelColor(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {getPriorityBars(task.priority)}
                  </div>
                </div>

                {/* Task Title */}
                <Typography variant="body-medium" className="font-semibold mb-2 line-clamp-2">
                  {task.title}
                </Typography>

                {/* Progress Bar */}
                {(task.estimatedHours || 0) > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Progress
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        {Math.round(progressPercentage)}%
                      </Typography>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Task Details */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">📎</span>
                        <span>{task.attachments.length}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">⏰</span>
                        <span>{formatTimeAgo(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignees */}
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {task.assignees.slice(0, 3).map((assignee, index) => (
                        <Avatar key={index} size="sm" className="border-2 border-white dark:border-gray-800">
                          <AvatarFallback
                            className={`text-xs ${getAvatarColor(assignee)}`}
                          >
                            {getInitials(assignee)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <Typography variant="body-small" className="text-muted-foreground">
                            +{task.assignees.length - 3}
                          </Typography>
                        </div>
                      )}
                    </div>
                    
                    {/* Completion Status */}
                    {task.status === 'done' && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }}
    </Draggable>
  );
};
