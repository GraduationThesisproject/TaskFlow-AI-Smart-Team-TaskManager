import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Typography,
  Button,
} from '@taskflow/ui';
import { DraggableTask } from './DraggableTask';
import { useTheme } from '../../hooks';
import type { DraggableColumnProps } from '../../types/interfaces/ui';


export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  tasks,
  index,
  onTaskClick,
  onAddTask,
  onEditColumn,
}) => {

  const getColumnColor = (color?: string) => {
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



  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return (
    <Draggable draggableId={column._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-80 ${
            snapshot.isDragging ? 'opacity-50 rotate-1' : ''
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
                <div 
                  className="flex items-center justify-between mb-3 cursor-move rounded-lg p-2 -m-2 transition-all duration-200"
                  style={{
                    background: column.style?.backgroundColor ? `${column.style.backgroundColor}15` : 'rgba(255, 255, 255, 0.05)'
                  }}
                  {...provided.dragHandleProps}
                >
                  <div className="flex items-center gap-3">
                    {column.style?.icon && (
                      <span className="text-2xl drop-shadow-sm">{column.style.icon}</span>
                    )}
                    <div 
                      className={`w-3 h-3 rounded-full shadow-sm ${getColumnColor(column.style?.color || column.color)}`}
                      style={column.style?.color?.startsWith('#') ? { backgroundColor: column.style.color } : {}}
                    />
                    <Typography variant="h4" className="font-bold drop-shadow-sm">
                      {column.name}
                    </Typography>
                    <span className="text-muted-foreground text-sm opacity-60">⋮⋮</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="backdrop-blur-sm border-0 shadow-sm"
                      style={{
                        backgroundColor: column.style?.backgroundColor ? `${column.style.backgroundColor}25` : 'rgba(255, 255, 255, 0.1)',
                        color: column.style?.backgroundColor ? '#374151' : 'inherit'
                      }}
                    >
                      {tasks.length} tasks
                    </Badge>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditColumn(column._id)}
                        className="w-8 h-8 p-0 hover:scale-110 transition-transform duration-200"
                        style={{
                          backgroundColor: column.style?.backgroundColor ? `${column.style.backgroundColor}20` : 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        ⚙️
                      </Button>
                    </div>
                  </div>
                </div>

                                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body-small" className="text-muted-foreground drop-shadow-sm">
                      {Math.round(progressPercentage)}% Done
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground drop-shadow-sm">
                      {completedTasks}/{tasks.length}
                    </Typography>
                  </div>
                  <div 
                    className="w-full rounded-full h-2 shadow-inner"
                    style={{
                      backgroundColor: column.style?.backgroundColor ? `${column.style.backgroundColor}30` : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-300 shadow-sm"
                      style={{ 
                        width: `${progressPercentage}%`,
                        backgroundColor: column.style?.color?.startsWith('#') ? column.style.color : undefined,
                        backgroundImage: column.style?.color?.startsWith('#') ? `linear-gradient(90deg, ${column.style.color}, ${column.style.color}dd)` : undefined
                      }}
                    />
                  </div>
                </div>

                {/* WIP Limit Warning */}
                {column.wipLimit && tasks.length > column.wipLimit && (
                  <div 
                    className="mb-4 p-3 rounded-lg backdrop-blur-sm shadow-sm"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <Typography variant="body-small" className="text-red-600 dark:text-red-400 drop-shadow-sm">
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
                      className={`min-h-[200px] transition-all duration-200 rounded-lg ${
                        snapshot.isDraggingOver 
                          ? 'backdrop-blur-sm shadow-lg border-2 border-blue-400/50' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: snapshot.isDraggingOver 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'transparent'
                      }}
                    >
                      {/* Tasks */}
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
                      {provided.placeholder}

                      {/* Add Task Button */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => onAddTask(column._id)}
                          className="w-full h-12 border-2 border-dashed hover:scale-[1.02] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm"
                          style={{
                            borderColor: column.style?.backgroundColor ? `${column.style.backgroundColor}40` : 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: column.style?.backgroundColor ? `${column.style.backgroundColor}10` : 'rgba(255, 255, 255, 0.05)',
                            color: column.style?.backgroundColor ? '#374151' : 'inherit'
                          }}
                        >
                          <span className="text-xl drop-shadow-sm">+</span>
                          <Typography variant="body-medium" className="font-medium drop-shadow-sm">
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
