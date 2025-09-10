import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button
} from '@taskflow/ui';
import { DraggableTask } from './DraggableTask';
import type { DraggableColumnProps } from '../../types/interfaces/ui';

export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  tasks,
  index,
  boardId,
  onTaskClick,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    setIsAddingTask(true);
    setNewTaskTitle('');
  };

  const handleCancelAddTask = () => {
    setIsAddingTask(false);
    setNewTaskTitle('');
  };

  const handleConfirmAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await onAddTask({
          title: newTaskTitle.trim(),
          column: column._id,
          board: boardId,
          boardId: boardId,
          status: 'todo'
        } as any);
        setIsAddingTask(false);
        setNewTaskTitle('');
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmAddTask();
    } else if (e.key === 'Escape') {
      handleCancelAddTask();
    }
  };

  const getColumnColor = (color?: string) => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'secondary': return 'bg-secondary';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-cyan-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getColumnProgressColor = (color?: string) => {
    switch (color) {
      case 'primary': return 'bg-primary/20';
      case 'secondary': return 'bg-secondary/20';
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'error': return 'bg-red-500/20';
      case 'info': return 'bg-cyan-500/20';
      default: return 'bg-muted/30';
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
            snapshot.isDragging ? 'opacity-90' : ''
          }`}
          style={provided.draggableProps.style}
        >
          <Card 
            className="h-fit border border-border/20 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:border-border/40 bg-card/95 overflow-hidden group hover:scale-[1.02]"
            style={{
              backgroundColor: column.style?.backgroundColor || undefined,
              borderColor: column.style?.backgroundColor ? `${column.style.backgroundColor}20` : undefined
            }}
          >
            <CardHeader className="p-4 pb-3 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div 
                  className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing group"
                  {...provided.dragHandleProps}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${getColumnColor(column.style?.color || column.color)}`}
                      style={column.style?.color?.startsWith('#') ? { backgroundColor: column.style.color } : {}}
                    />
                    <Typography variant="h4" className="font-semibold text-foreground">
                      {column.name}
                    </Typography>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                      <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                      <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask();
                      }}
                      className="w-7 h-7 p-0 hover:bg-primary/10 rounded-full text-primary hover:text-primary"
                      title="Add Task"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditColumn(column._id);
                      }}
                      className="w-7 h-7 p-0 hover:bg-muted/50 rounded-full"
                      title="Edit Column"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756.426-1.756 2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteColumn(column._id);
                      }}
                      className="w-7 h-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full"
                      title="Delete Column"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>
              </div>

              {isAddingTask && (
                <div className="px-4 py-3 border-b border-border/20">
                  <div className="h-8 border-2 border-primary/60 rounded-lg bg-card backdrop-blur-md overflow-hidden">
                    <div className="h-full flex items-center px-3">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleCancelAddTask}
                        placeholder="Enter task title..."
                        className="w-full text-sm font-medium text-foreground placeholder-muted-foreground bg-transparent border-0 outline-none focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body-small" className="text-muted-foreground text-xs font-medium">
                    Progress
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground text-xs">
                    {completedTasks}/{tasks.length}
                  </Typography>
                </div>
                <div className="relative w-full bg-muted/15 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${getColumnProgressColor(column.style?.color || column.color)} relative overflow-hidden`}
                    style={{ 
                      width: `${progressPercentage}%`,
                      backgroundColor: column.style?.color?.startsWith('#') ? column.style.color + '40' : undefined
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {column.wipLimit && tasks.length > column.wipLimit && (
                <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                  <Typography variant="body-small" className="text-red-600 dark:text-red-400 text-xs">
                    ⚠️ WIP exceeded ({tasks.length}/{column.wipLimit})
                  </Typography>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <Droppable droppableId={column._id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`max-h-[300px] overflow-y-auto column-task-scroll transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-primary/10 rounded-lg' : ''
                    }`}
                  >
                    <div className="pr-2">
                      {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-20 text-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-sm">📋</span>
                          </div>
                          <Typography variant="body-small" className="text-muted-foreground text-xs mb-1 font-medium">
                            No tasks yet
                          </Typography>
                          <Typography variant="body-small" className="text-muted-foreground text-xs">
                            Add one below
                          </Typography>
                        </div>
                      ) : (
                        tasks.map((task, taskIndex) => (
                          <DraggableTask
                            key={task._id}
                            task={task}
                            index={taskIndex}
                            columnId={column._id}
                            onClick={(task) => onTaskClick(task)}
                          />
                        ))
                      )}
                    </div>
                    {provided.placeholder}
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


