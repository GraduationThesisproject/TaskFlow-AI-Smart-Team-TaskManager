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
import type { Task } from '../../store/slices/taskSlice';
import type { DraggableTaskProps } from '../../types/interfaces/ui';

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  columnId,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Debug logging removed to prevent console spam



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
            className={`mb-2 transition-all duration-200 ${
              snapshot.isDragging ? 'opacity-50 scale-95 rotate-1' : ''
            }`}
            onClick={handleClick}
          >
            <Card className="cursor-pointer hover:border-primary/30 transition-all duration-200 border border-border/20 bg-card/95 backdrop-blur-sm rounded-xl overflow-hidden group">
              {/* Task Color Indicator */}
              {task.color && (
                <div 
                  className="h-1 w-full" 
                  style={{ backgroundColor: task.color }}
                />
              )}
              <CardContent className="p-3">
                {/* Compact Header with Priority and Status */}
                <div className="flex items-center justify-between mb-2">
                  {/* Priority Indicator */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'critical' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    {task.tags && task.tags.length > 0 && (
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  {task.status === 'done' && (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Task Title */}
                <Typography variant="body-small" className="font-medium mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                  {task.title}
                </Typography>

                {/* Compact Footer with Icons and Assignees */}
                <div className="flex items-center justify-between">
                  {/* Left side - Icons */}
                  <div className="flex items-center gap-2">
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">📎</span>
                        <span className="text-xs">{task.attachments.length}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">⏰</span>
                        <span className="text-xs">{formatTimeAgo(task.dueDate)}</span>
                      </div>
                    )}
                    {task.estimatedHours && task.estimatedHours > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">⏱️</span>
                        <span className="text-xs">{task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Right side - Assignees */}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center -space-x-1">
                      {task.assignees.slice(0, 2).map((assignee, index) => (
                        <Avatar key={index} size="xs" className="border-2 border-background">
                          <AvatarFallback
                            className={`text-xs ${getAvatarColor(assignee)}`}
                          >
                            {getInitials(assignee)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 2 && (
                        <div className="w-6 h-6 rounded-full bg-muted/80 flex items-center justify-center border-2 border-background">
                          <Typography variant="body-small" className="text-muted-foreground text-xs">
                            +{task.assignees.length - 2}
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags (if any) */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`text-xs px-1.5 py-0.5 ${getLabelColor(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-muted/60 text-muted-foreground">
                        +{task.tags.length - 2}
                      </Badge>
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
