import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button
} from '@taskflow/ui';
import { DraggableTask } from '../../components/board/DraggableTask';
import type { DraggableColumnProps } from '../../types/interfaces/ui';

export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  tasks,
  index,
  boardId,
  onTaskClick,
  onAddTask,
  onDeleteColumn,
  onUpdateColumn,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Separate edit modes
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(column.name);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update name when column changes, but only if not currently editing name
  useEffect(() => {
    if (!isEditingName) {
      setEditingName(column.name);
    }
  }, [column.name, isEditingName]);


  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      // Position cursor at the end of the text
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setIsEditingName(true);
    // Close other dropdowns
    setShowIconDropdown(false);
    setShowColorDropdown(false);
  };

  const handleInputBlur = () => {
    handleSaveNameChanges();
  };


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNameChanges();
    } else if (e.key === 'Escape') {
      handleCancelNameEdit();
    }
  };

  const handleSaveNameChanges = async () => {
    if (editingName.trim() && onUpdateColumn) {
      try {
        const updateData = {
          name: editingName.trim(),
          style: {
            ...column.style // Preserve existing style properties
          }
        };
        
        await onUpdateColumn(column._id, updateData);
        setIsEditingName(false);
      } catch (error) {
        // Handle error silently
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelNameEdit = () => {
    setEditingName(column.name);
    setIsEditingName(false);
  };

  const handleColorChange = (color: string) => {
    // Update the column immediately
    if (onUpdateColumn) {
      const updateData = {
        name: column.name,
        style: {
          ...column.style, // Preserve existing style properties first
          color: color,
          backgroundColor: color,
          icon: column.style?.icon || '📋' // Override with the new color
        }
      };
      
      onUpdateColumn(column._id, updateData);
    }
  };

  const handleIconChange = (icon: string) => {
    // Update the column immediately
    if (onUpdateColumn) {
      const updateData = {
        name: column.name,
        style: {
          ...column.style, // Preserve existing style properties first
          color: column.style?.backgroundColor || column.color || '#3B82F6',
          backgroundColor: column.style?.backgroundColor || column.color || '#3B82F6',
          icon: icon // Override with the new icon
        }
      };
      
      onUpdateColumn(column._id, updateData);
    }
  };

  const handleIconClick = () => {
    setShowIconDropdown(!showIconDropdown);
    setShowColorDropdown(false);
    setIsEditingName(false);
  };

  const handleColorClick = () => {
    setShowColorDropdown(!showColorDropdown);
    setShowIconDropdown(false);
    setIsEditingName(false);
  };

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
        // Handle error silently
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


  // Helper function to determine if task is complete based on column name
  const isTaskComplete = () => {
    const columnName = column.name.toLowerCase();
    return columnName.includes('done') || columnName.includes('complete');
  };

  const completedTasks = isTaskComplete() ? tasks.length : 0; // All tasks in a "done" column are completed
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Function to determine text color based on background color
  const getTextColor = (backgroundColor: string) => {
    if (!backgroundColor) return '#000000';
    
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white text for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };


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
            className="h-fit border border-border/20 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:border-border/40 bg-card overflow-hidden hover:scale-[1.02] relative"
            style={{
              backgroundColor: (column.style?.backgroundColor || column.color) ? 
                `${(column.style?.backgroundColor || column.color)}80` : 
                'rgba(255, 255, 255, 0.8)',
              borderColor: (column.style?.backgroundColor || column.color) ? `${(column.style?.backgroundColor || column.color)}40` : undefined,
              borderLeftWidth: (column.style?.backgroundColor || column.color) ? '4px' : undefined,
              borderLeftColor: (column.style?.backgroundColor || column.color) || undefined,
              color: getTextColor(column.style?.backgroundColor || column.color)
            }}
          >
            <CardHeader className="p-4 pb-3 relative">
              {/* Subtle gradient overlay for better text readability */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl"
                style={{
                  background: (column.style?.backgroundColor || column.color) ? 
                    `linear-gradient(to bottom, ${(column.style?.backgroundColor || column.color)}15, transparent)` : 
                    'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)'
                }}
              ></div>
              
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                style={{
                  backgroundColor: (column.style?.backgroundColor || column.color) || '#3B82F6',
                  opacity: 0.8
                }}
              ></div>
              
              <div className="relative">
                <div 
                  className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
                  {...provided.dragHandleProps}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Column Icon */}
                    <div className="text-lg relative">
                      <div 
                        className="h-6 w-6 flex items-center justify-center cursor-pointer hover:bg-muted/50 rounded transition-colors"
                        onClick={handleIconClick}
                      >
                        {column.style?.icon || '📋'}
                      </div>
                      {showIconDropdown && (
                        <div className="absolute top-6 left-0 z-50 p-2 bg-card border border-border rounded-lg shadow-lg w-32">
                          <div className="grid grid-cols-4 gap-1">
                            {['📋', '📊', '📈', '📉', '🎨', '🔧', '⚙️', '🔍', '📌', '📍', '🎪', '🏆', '🥇', '🥈', '🥉', '🎖️'].map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                className="h-6 w-6 rounded border-0 outline-none focus:outline-none text-xs hover:bg-muted/50 flex items-center justify-center"
                                onClick={() => {
                                  handleIconChange(icon);
                                  setShowIconDropdown(false);
                                }}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Column Name - Inline Editing */}
                    {isEditingName ? (
                      <input
                        ref={nameInputRef}
                        value={editingName}
                        onChange={handleNameChange}
                        onKeyDown={handleNameKeyPress}
                        onBlur={handleInputBlur}
                        className="h-6 text-sm font-semibold bg-muted/20 border border-muted/30 rounded px-2 py-1 outline-none focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 flex-1"
                        style={{ color: getTextColor(column.style?.backgroundColor || column.color) }}
                        placeholder="Column name"
                      />
                    ) : (
                      <div 
                        className="flex-1 cursor-pointer hover:bg-muted/30 rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={handleNameClick}
                      >
                        <Typography 
                          variant="h4" 
                          className="font-semibold"
                          style={{ color: getTextColor(column.style?.backgroundColor || column.color) }}
                        >
                          {column.name}
                        </Typography>
                      </div>
                    )}

                    {/* Color Picker */}
                    <div className="relative">
                      <div 
                        className="h-4 w-4 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                        style={{ backgroundColor: (column.style?.backgroundColor || column.color) || '#3B82F6' }}
                        onClick={handleColorClick}
                      />
                      {showColorDropdown && (
                        <div className="absolute top-6 right-0 z-50 p-3 bg-card border border-border rounded-lg shadow-lg w-48">
                          <div className="grid grid-cols-6 gap-2">
                            {[
                              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
                              '#06B6D4', '#6366F1', '#84CC16', '#F97316', '#64748B', '#000000',
                              '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280'
                            ].map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="h-6 w-6 rounded-full border-2 border-transparent hover:border-foreground/20 hover:scale-110 transition-all"
                                style={{ 
                                  backgroundColor: color,
                                  borderColor: color === '#FFFFFF' ? '#D1D5DB' : 'transparent'
                                }}
                                onClick={() => {
                                  handleColorChange(color);
                                  setShowColorDropdown(false);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
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
                  <div className="h-8 border border-border/30 rounded-lg bg-card backdrop-blur-md overflow-hidden">
                    <div className="h-full flex items-center px-3">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleCancelAddTask}
                        placeholder="Enter task title..."
                        className="w-full text-sm font-medium text-foreground placeholder-muted-foreground bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-0"
                        style={{
                          boxShadow: 'none',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}


              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <Typography 
                    variant="body-small" 
                    className="text-xs font-medium"
                    style={{ color: getTextColor(column.style?.backgroundColor || column.color) }}
                  >
                    Progress
                  </Typography>
                  <Typography 
                    variant="body-small" 
                    className="text-xs"
                    style={{ color: getTextColor(column.style?.backgroundColor || column.color) }}
                  >
                    {completedTasks}/{tasks.length}
                  </Typography>
                </div>
                <div className="relative w-full bg-black/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ 
                      width: `${progressPercentage}%`,
                      backgroundColor: (column.style?.backgroundColor || column.color) || '#3B82F6'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
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
                        tasks.map((task: any, taskIndex: number) => (
                          <DraggableTask
                            key={task._id}
                            task={task}
                            index={taskIndex}
                            columnId={column._id}
                            onClick={(task: any) => onTaskClick(task)}
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


