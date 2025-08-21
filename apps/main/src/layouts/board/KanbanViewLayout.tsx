import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useSpaceTasks } from '../../hooks';
import { useTheme } from '../../hooks';
import type { Task, Column } from '../../types/task.types';
import { 
  Card, 
  CardContent, 
  Typography, 
  Loading,
  Button,
  Badge,
  Flex,
  Stack
} from '@taskflow/ui';
import { DraggableColumn } from '../../components/board/DraggableColumn';
import { AddTaskModal, AddColumnModal, TaskDetailModal } from '../../components/board';

export const KanbanViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const { spaceId, boardId } = useParams<{ spaceId: string; boardId: string }>();
  const { theme } = useTheme();
  
  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mock users for the TaskDetailModal
  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      emailVerified: true,
      isActive: true,
      isLocked: false,
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      emailVerified: true,
      isActive: true,
      isLocked: false,
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      emailVerified: true,
      isActive: true,
      isLocked: false,
    },
  ];

  // Use the space tasks hook
  const {
    tasks,
    columns,
    boards,
    currentBoard,
    loading,
    error,
    taskStats,
    tasksByColumn,
    socketConnected,
    addTask,
    addColumn,
    moveTaskToColumn,
    removeTask,
    editColumn,
    removeColumn,
    reorderColumnsAction,
    selectTask,
    selectBoard,
  } = useSpaceTasks({
    spaceId,
    boardId,
    autoConnect: true,
  });

  // Handle task creation
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      // Adding new task
      await addTask({
        ...taskData,
        space: spaceId!,
        board: boardId!,
        position: tasksByColumn[taskData.column!]?.length || 0,
      });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  // Handle column creation
  const handleAddColumn = async (columnData: Partial<Column>) => {
    try {
      // Adding new column
      await addColumn({
        ...columnData,
        board: boardId!,
        position: columns.length,
      });
    } catch (error) {
      console.error('Failed to add column:', error);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Add a small delay to ensure draggables are properly registered
    setTimeout(async () => {
      if (type === 'TASK') {
        // Handle task movement
        const sourceColumnId = source.droppableId;
        const destinationColumnId = destination.droppableId;
        const taskId = result.draggableId;

        try {
          await moveTaskToColumn(taskId, destinationColumnId, destination.index);
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      } else if (type === 'COLUMN') {
        // Handle column reordering
        try {
          await reorderColumnsAction(source.index, destination.index);
        } catch (error) {
          console.error('Failed to reorder columns:', error);
        }
      }
    }, 50);
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
    selectTask(task);
    // Task clicked
  };

  // Handle column actions
  const handleEditColumn = (columnId: string) => {
    // Edit column
    // Implement column editing
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await removeColumn(columnId);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  };

  // Handle task save
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      // Saving task
      // This would typically call an API to update the task
      // For now, we'll just close the modal
      setIsTaskDetailModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handle task delete
  const handleDeleteTask = async () => {
    try {
      if (selectedTask) {
        // Deleting task
        await removeTask(selectedTask._id);
        setIsTaskDetailModalOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle add task to specific column
  const handleAddTaskToColumn = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading spinnerProps={{ size: "lg" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Typography variant="h3" className="text-error mb-4">
            Error Loading Board
          </Typography>
          <Typography variant="body-medium" textColor="muted" className="mb-4">
            {error}
          </Typography>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <DragDropContext 
      onDragEnd={(result) => {
        // Reset cursor
        document.body.style.cursor = '';
        handleDragEnd(result);
      }}
      onDragStart={() => {
        // Optimize drag start performance
        document.body.style.cursor = 'grabbing';
      }}
      onDragUpdate={() => {
        // Optimize drag update performance
      }}
    >
      <div className="min-h-screen bg-transparent text-foreground w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Typography variant="h2" className="mb-2">
                  {currentBoard?.name || 'Kanban Board'}
                </Typography>
                <Typography variant="body-medium" textColor="muted">
                  {currentBoard?.description || 'Manage your tasks efficiently'}
                </Typography>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-success' : 'bg-error'}`} />
                  <Typography variant="body-small" textColor="muted">
                    {socketConnected ? 'Connected' : 'Disconnected'}
                  </Typography>
                </div>
                
                {/* Task Stats */}
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Done: {taskStats.completed}
                  </Badge>
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    In Progress: {taskStats.inProgress}
                  </Badge>
                  {taskStats.overdue > 0 && (
                    <Badge variant="error">
                      Overdue: {taskStats.overdue}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                                 className={`flex gap-6 overflow-x-auto pb-4 transition-all duration-200 ${
                   snapshot.isDraggingOver 
                     ? theme === 'dark'
                       ? 'bg-green-900/30 rounded-lg border-2 border-green-600 p-4'
                       : 'bg-green-100 rounded-lg border-2 border-green-300 p-4'
                     : ''
                 }`}
              >
                {columns.map((column, index) => (
                  <DraggableColumn
                    key={column._id}
                    column={column}
                    tasks={tasksByColumn[column._id] || []}
                    index={index}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleAddTaskToColumn}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                  />
                ))}
                
                {/* Add Column Button */}
                <div className="flex-shrink-0 w-80">
                  <Card variant="default" className="h-fit border-0 shadow-xl bg-card/95 backdrop-blur-sm border-2 border-dashed border-border/40 rounded-2xl">
                    <CardContent className="p-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddColumnModalOpen(true)}
                        className="w-full h-32 border-2 border-dashed border-border/40 hover:border-primary/60 hover:text-primary transition-all duration-300 bg-muted/10 hover:bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3"
                      >
                        <span className="text-3xl">+</span>
                        <Typography variant="body-medium" className="font-bold">
                          Add Column
                        </Typography>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Empty State */}
          {columns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Typography variant="h3" className="mb-4 text-muted-foreground">
                No Columns Yet
              </Typography>
              <Typography variant="body-medium" textColor="muted" className="mb-6 text-center">
                Create your first column to start organizing tasks
              </Typography>
              <Button onClick={() => setIsAddColumnModalOpen(true)}>
                Create First Column
              </Button>
            </div>
          )}

          {/* Modals */}
          <AddTaskModal
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            onSubmit={handleAddTask}
            selectedColumn={selectedColumn}
            columns={columns}
          />
          
          <AddColumnModal
            isOpen={isAddColumnModalOpen}
            onClose={() => setIsAddColumnModalOpen(false)}
            onSubmit={handleAddColumn}
          />

          <TaskDetailModal
            isOpen={isTaskDetailModalOpen}
            onClose={() => {
              setIsTaskDetailModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            users={mockUsers}
          />
        </div>
      </div>
    </DragDropContext>
  );
};
