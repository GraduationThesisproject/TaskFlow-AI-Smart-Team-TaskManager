import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Typography,
  Button,
  Flex,
  Stack
} from '@taskflow/ui';
import { DraggableTask } from './DraggableTask';
import type { Task } from '../../types/task.types';
import type { Column } from '../../types/board.types';
import type { DraggableColumnProps } from '../../types/interfaces/ui';

export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  tasks,
  index,
  onTaskClick,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
}) => {
  // Debug logging
  console.log('DraggableColumn render:', { 
    columnId: column._id, 
    columnName: column.name, 
    index,
    tasksCount: tasks.length 
  });
  const getColumnColor = (color?: string) => {
    // Handle semantic colors
    switch (color) {
      case 'primary': return 'bg-blue-500';
      case 'secondary': return 'bg-purple-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getColumnProgressColor = (color?: string) => {
    // Handle semantic colors
    switch (color) {
      case 'primary': return 'bg-blue-200';
      case 'secondary': return 'bg-purple-200';
      case 'success': return 'bg-green-200';
      case 'warning': return 'bg-yellow-200';
      case 'error': return 'bg-red-200';
      case 'info': return 'bg-cyan-200';
      default: return 'bg-gray-200';
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-80 transition-all duration-200 ${
            snapshot.isDragging ? 'opacity-50 rotate-2' : ''
          }`}
        >
          <Card 
            className="h-fit border-0 shadow-xl backdrop-blur-sm rounded-2xl transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: column.style?.backgroundColor || '#F9FAFB',
              boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              border: `1px solid ${column.style?.backgroundColor ? `${column.style.backgroundColor}20` : 'rgba(255, 255, 255, 0.1)'}`
            }}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${getColumnColor(column.style?.color || column.color)}`}
                    style={column.style?.color?.startsWith('#') ? { backgroundColor: column.style.color } : {}}
                    {...provided.dragHandleProps}
                  />
                  <Typography variant="h4" className="font-bold">
                    {column.name}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-muted/50">
                    {tasks.length} tasks
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditColumn(column._id)}
                      className="w-8 h-8 p-0"
                      title="Edit Column"
                    >
                      ⚙️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteColumn(column._id)}
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                      title="Delete Column"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body-small" className="text-muted-foreground">
                    {Math.round(progressPercentage)}% Done
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    {completedTasks}/{tasks.length}
                  </Typography>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getColumnProgressColor(column.style?.color || column.color)}`}
                    style={{ 
                      width: `${progressPercentage}%`,
                      backgroundColor: column.style?.color?.startsWith('#') ? column.style.color + '40' : undefined
                    }}
                  />
                </div>
              </div>

              {/* WIP Limit Warning */}
              {column.wipLimit && tasks.length > column.wipLimit && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Typography variant="body-small" className="text-red-600 dark:text-red-400">
                    ⚠️ WIP Limit exceeded ({tasks.length}/{column.wipLimit})
                  </Typography>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <Droppable droppableId={column._id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
                    }`}
                  >
                    {/* Tasks */}
                    <div>
                      {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                            <span className="text-2xl">📋</span>
                          </div>
                          <Typography variant="body-small" className="text-muted-foreground mb-2">
                            No tasks yet
                          </Typography>
                          <Typography variant="body-small" className="text-muted-foreground">
                            Add a task to get started
                          </Typography>
                        </div>
                      ) : (
                        tasks.map((task, taskIndex) => (
                          <DraggableTask
                            key={task._id}
                            task={task}
                            index={taskIndex}
                            columnId={column._id}
                            onClick={onTaskClick}
                          />
                        ))
                      )}
                    </div>
                    {provided.placeholder}

                    {/* Add Task Button */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => onAddTask(column._id)}
                        className="w-full h-12 border-2 border-dashed border-border/40 hover:border-primary/60 hover:text-primary transition-all duration-300 bg-muted/10 hover:bg-muted/30 rounded-xl flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">+</span>
                        <Typography variant="body-medium" className="font-medium">
                          Add Task
                        </Typography>
                      </Button>
                    </div>
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
