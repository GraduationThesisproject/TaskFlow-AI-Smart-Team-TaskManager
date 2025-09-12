import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
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
import type { DraggableTaskProps } from '../../types/interfaces/ui';

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getLabelColor = (tag: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800'];
    const index = tag.length % colors.length;
    return colors[index];
  };

  const getTagColor = (tag: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#84CC16', '#F97316'];
    const index = tag.length % colors.length;
    return colors[index];
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return '|||';
      case 'high':
      case 'medium':
        return '||';
      case 'low':
      case 'normal':
      default:
        return '|';
    }
  };

  const getTimeRemaining = () => {
    if (!task.startDate && !task.dueDate) return null;
    
    const now = new Date();
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    
    // If task hasn't started yet
    if (startDate && now < startDate) {
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Starts in ${diffDays}d`;
    }
    
    // If task has started and has due date
    if (dueDate && now >= (startDate || now)) {
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `${diffDays}d left`;
      } else if (diffDays === 0) {
        return 'Due today';
      } else {
        return `${Math.abs(diffDays)}d overdue`;
      }
    }
    
    return null;
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

  const handleClick = () => {
    if (!isDragging) {
      onClick(task);
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => {
        if (snapshot.isDragging !== isDragging) {
          setIsDragging(snapshot.isDragging);
        }

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-2 transition-all duration-200 ${
              snapshot.isDragging ? 'opacity-50 scale-95 rotate-1' : ''
            }`}
            onClick={handleClick}
          >
            <Card 
              className="cursor-pointer hover:border-primary/30 transition-all duration-200 bg-card/95 backdrop-blur-sm rounded-lg overflow-hidden group"
              style={{
                border: `3px solid ${task.color || '#D1D5DB'}`,
                borderColor: task.color || '#D1D5DB'
              }}
            >
              <CardContent className="p-3">
                {/* Top row with priority and time remaining */}
                <div className="flex items-center justify-between mb-2">
                  {/* Priority indicator */}
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-mono text-sm">
                      {getPriorityIndicator(task.priority || 'normal')}
                    </span>
                  </div>
                  
                  {/* Time remaining */}
                  {getTimeRemaining() && (
                    <div className="text-xs text-muted-foreground">
                      {getTimeRemaining()}
                    </div>
                  )}
                </div>

                {/* Task Title */}
                <Typography variant="body-small" className="font-medium mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                  {task.title}
                </Typography>

                {/* Bottom row with checklist count and tags */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Checklist count - only show if > 0 */}
                    {task.checklist && task.checklist.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">✓</span>
                        <span className="text-xs">{task.checklist.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Tag colors as dots */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {task.tags.slice(0, 3).map((tag: string, index: number) => (
                        <div
                          key={index}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getTagColor(tag) }}
                        />
                      ))}
                      {task.tags.length > 3 && (
                        <div className="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-xs text-white">+</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </Draggable>
  );
};


