import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { useTasks, useColumns, useSpaceManager, useTheme } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import type { Task } from '../../types/task.types';
import type { Column } from '../../types/board.types';
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
import { DraggableColumn } from '../../components/space/DraggableColumn';
import { AddTaskModal, AddColumnModal } from '../../components/space';
import { EditColumnModal } from '../../components/board/EditColumnModal';
import { ErrorBoundaryWrapper } from '../../components';

// Color mapping function to convert semantic colors to hex codes
const getColorHex = (semanticColor: string): string => {
  const colorMap: Record<string, string> = {
    'default': '#6B7280',
    'primary': '#3B82F6',
    'secondary': '#6B7280',
    'success': '#10B981',
    'warning': '#F59E0B',
    'error': '#EF4444',
    'info': '#06B6D4',
  };
  return colorMap[semanticColor] || '#3B82F6';
};

export const KanbanViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { theme } = useTheme();
  const { warning } = useToast();
  
  const {
    loadBoard,
    loadBoardsBySpace,
    currentBoard,
    boardLoading,
    boardError
  } = useSpaceManager();

  // Use dedicated hooks for each entity
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
    moveTask
  } = useTasks();

  const {
    columns,
    loading: columnsLoading,
    error: columnsError,
    loadColumnsByBoard,
    addColumn,
    editColumn,
    removeColumn,
    reorderColumns: reorderColumnsAction
  } = useColumns();
  
  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  // Load board and data when component mounts
  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
      loadColumnsByBoard(boardId);
      // Note: loadBoard already loads tasks via the combined endpoint
    }
  }, [boardId, loadBoard, loadColumnsByBoard]);

  // Handle task creation
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      if (!boardId) return;
      
      await addTask({
        ...taskData,
        board: boardId,
        column: selectedColumn || columns[0]?._id,
        position: columns.find(col => col._id === (selectedColumn || columns[0]?._id))?.taskIds?.length || 0,
      });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  // Handle column creation
  const handleAddColumn = async (columnData: { name?: string; backgroundColor?: string; icon?: string | null; wipLimit?: number; isDefault?: boolean }) => {
    try {
      if (!boardId) return;
      
      console.log('Creating column:', columnData);
      
      try {
        await addColumn({
          name: columnData.name || 'New Column',
          boardId: boardId,
          position: columns.length,
          backgroundColor: columnData.backgroundColor || '#F9FAFB',
          icon: columnData.icon || null,
          settings: {}
        });
        console.log('Column created successfully!');
      } catch (error) {
        console.error('Column creation failed:', error);
      }
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

    if (type === 'TASK') {
      // Handle task movement
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;
      const taskId = result.draggableId;

      try {
        await moveTask({
          id: taskId,
          moveData: {
            columnId: destinationColumnId,
            position: destination.index
          }
        });
      } catch (error) {
        console.error('Failed to move task:', error);
      }
    } else if (type === 'COLUMN') {
      // Handle column reordering
      try {
        await handleReorderColumns(source.index, destination.index);
      } catch (error) {
        console.error('Failed to reorder columns:', error);
      }
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    navigate(`/board/${boardId}/task/${task._id}`);
  };

  // Handle column actions
  const handleEditColumn = (columnId: string) => {
    console.log('handleEditColumn called with columnId:', columnId);
    const column = columns.find(col => col._id === columnId);
    if (column) {
      console.log('Found column to edit:', column);
      setEditingColumn(column);
      setIsEditColumnModalOpen(true);
    } else {
      console.error('Column not found for editing:', columnId);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    console.log('handleDeleteColumn called with columnId:', columnId);
    try {
      warning(
        'Are you sure you want to delete this column? This action cannot be undone.',
        'Delete Column',
        { duration: 0, dismissible: true }
      );
      console.log('User confirmed deletion, calling removeColumn...');
      await removeColumn(columnId, boardId);
      console.log('Column deleted successfully');
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  };

  const handleUpdateColumn = async (columnId: string, data: { name: string; backgroundColor: string; icon?: string | null; settings?: any }) => {
    console.log('handleUpdateColumn called with columnId:', columnId, 'data:', data);
    try {
      await editColumn(columnId, data, boardId);
      console.log('Column updated successfully');
      setIsEditColumnModalOpen(false);
      setEditingColumn(null);
    } catch (error) {
      console.error('Failed to update column:', error);
    }
  };

  const handleReorderColumns = async (sourceIndex: number, destinationIndex: number) => {
    try {
      const typedColumns = columns as Column[];
      const newColumnOrder = Array.from(typedColumns);
      const [removed] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destinationIndex, 0, removed);
      
      const columnIds = newColumnOrder.map((col: Column) => col._id);
      await reorderColumnsAction(boardId!, columnIds);
    } catch (error) {
      console.error('Failed to reorder columns:', error);
    }
  };

  // Handle add task to specific column
  const handleAddTaskToColumn = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddTaskModalOpen(true);
  };

  // Group tasks by column
  const tasksByColumn = (columns as Column[]).reduce((acc: Record<string, Task[]>, column: Column) => {
    acc[column._id] = tasks.filter((task: Task) => task.column === column._id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'done').length,
    inProgress: tasks.filter(task => task.status === 'in_progress').length,
    todo: tasks.filter(task => task.status === 'todo').length,
    review: tasks.filter(task => task.status === 'review').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'done';
    }).length
  };

  if (boardLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading spinnerProps={{ size: "lg" }} />
      </div>
    );
  }

  if (boardError || tasksError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Typography variant="h3" className="text-error mb-4">
            Error Loading Board
          </Typography>
          <Typography variant="body-medium" textColor="muted" className="mb-4">
            {boardError || tasksError || 'Failed to load board data'}
          </Typography>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Typography variant="h3" className="mb-4 text-muted-foreground">
            Board not found
          </Typography>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper name="KanbanViewLayout">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-transparent text-foreground w-full">
          <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
            {/* Header with Stats */}
            <ErrorBoundaryWrapper name="KanbanHeader">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Typography variant="h2" className="mb-2">
                      {currentBoard.name || 'Kanban Board'}
                    </Typography>
                    <Typography variant="body-medium" textColor="muted">
                      {currentBoard.description || 'Manage your tasks efficiently'}
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
            </ErrorBoundaryWrapper>

            {/* Kanban Board */}
            <ErrorBoundaryWrapper name="KanbanBoard">
              <Droppable droppableId="board" type="COLUMN" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex gap-6 overflow-x-auto pb-4 transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
                    }`}
                  >
                    {(columns as Column[]).map((column: Column, index: number) => (
                      <ErrorBoundaryWrapper key={column._id} name={`Column-${column.name}`}>
                        <DraggableColumn
                          column={column}
                          tasks={tasksByColumn[column._id] || []}
                          index={index}
                          onTaskClick={handleTaskClick}
                          onAddTask={handleAddTaskToColumn}
                          onEditColumn={handleEditColumn}
                          onDeleteColumn={handleDeleteColumn}
                        />
                      </ErrorBoundaryWrapper>
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
            </ErrorBoundaryWrapper>

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
            <ErrorBoundaryWrapper name="KanbanModals">
              <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onSubmit={handleAddTask}
                selectedColumn={selectedColumn}
                selectedBoard={boardId}
                columns={columns}
              />
              
              <AddColumnModal
                isOpen={isAddColumnModalOpen}
                onClose={() => setIsAddColumnModalOpen(false)}
                onSubmit={handleAddColumn}
              />

              <EditColumnModal
                isOpen={isEditColumnModalOpen}
                onClose={() => setIsEditColumnModalOpen(false)}
                column={editingColumn}
                onSave={handleUpdateColumn}
              />
            </ErrorBoundaryWrapper>
          </div>
        </div>
      </DragDropContext>
    </ErrorBoundaryWrapper>
  );
};
