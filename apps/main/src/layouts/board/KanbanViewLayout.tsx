import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task } from '../../types/task.types';
import type { Column, Board } from '../../types/board.types';
import {
  Card,
  Typography,
  Loading,
  Button
} from '@taskflow/ui';
import { DraggableColumn } from '../../components/space/DraggableColumn';
import { AddColumnModal } from '../../components/space';
import { EditColumnModal } from '../../components/board/EditColumnModal';
import { ErrorBoundaryWrapper } from '../../components';

interface KanbanViewLayoutProps {
  currentBoard: Board | null;
  tasks: Task[];
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  loading: boolean;
  error: string | null;
  onTaskClick: (task: Task) => void;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onDragEnd: (result: DropResult) => Promise<void>;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => Promise<void>;
  onUpdateColumn: (columnId: string, columnData: Partial<Column>) => Promise<void>;
  onAddColumn: () => Promise<void>;
  onCancelAddColumn: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isAddingColumn: boolean;
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  setIsAddingColumn: (adding: boolean) => void;
  isAddColumnModalOpen: boolean;
  setIsAddColumnModalOpen: (open: boolean) => void;
  isEditColumnModalOpen: boolean;
  setIsEditColumnModalOpen: (open: boolean) => void;
  editingColumn: Column | null;
}

export const KanbanViewLayout: React.FC<KanbanViewLayoutProps> = ({
  currentBoard,
  columns,
  tasksByColumn,
  taskStats,
  loading,
  error,
  onTaskClick,
  onAddTask,
  onDragEnd,
  onEditColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddColumn,
  onCancelAddColumn,
  onKeyPress,
  isAddingColumn,
  newColumnName,
  setNewColumnName,
  setIsAddingColumn,
  isAddColumnModalOpen,
  setIsAddColumnModalOpen,
  isEditColumnModalOpen,
  setIsEditColumnModalOpen,
  editingColumn
}) => {
  // Animation state management
  const [newColumnIds, setNewColumnIds] = useState<Set<string>>(new Set());
  const [deletingColumnIds, setDeletingColumnIds] = useState<Set<string>>(new Set());
  const previousColumnsRef = useRef<Column[]>([]);
  const animationTimeoutsRef = useRef<Map<string, number>>(new Map());

  // Add CSS to move scrollbar to top and style it elegantly
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-top {
        transform: rotateX(180deg);
      }
      .scrollbar-top > * {
        transform: rotateX(180deg);
      }
      .scrollbar-top::-webkit-scrollbar {
        height: 8px;
      }
      .scrollbar-top::-webkit-scrollbar-track {
        background: hsl(var(--muted) / 0.3);
        border-radius: 4px;
      }
      .scrollbar-top::-webkit-scrollbar-thumb {
        background: hsl(var(--primary) / 0.6);
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .scrollbar-top::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--primary) / 0.8);
      }
      
      /* Fix drag preview positioning */
      [data-rbd-draggable-id] {
        position: relative !important;
      }
      [data-rbd-draggable-id][data-rbd-drag-handle-dragging-id] {
        z-index: 9999 !important;
        position: fixed !important;
        pointer-events: none !important;
      }
      [data-rbd-drag-handle-dragging-id] {
        cursor: grabbing !important;
      }

      /* Column Animation Styles - Professional & Elegant */
      .column-enter {
        animation: columnSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .column-exit {
        animation: columnSlideOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
      }
      
      .column-deleting {
        animation: columnFadeOut 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards;
      }
      
      @keyframes columnSlideIn {
        0% {
          opacity: 0;
          transform: translateX(-40px) scale(0.92) translateY(8px);
          filter: blur(2px);
        }
        30% {
          opacity: 0.4;
          transform: translateX(-15px) scale(0.96) translateY(4px);
          filter: blur(1px);
        }
        70% {
          opacity: 0.8;
          transform: translateX(2px) scale(0.99) translateY(-1px);
          filter: blur(0px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1) translateY(0);
          filter: blur(0px);
        }
      }
      
      @keyframes columnSlideOut {
        0% {
          opacity: 1;
          transform: translateX(0) scale(1) translateY(0);
          filter: blur(0px);
        }
        30% {
          opacity: 0.7;
          transform: translateX(8px) scale(0.98) translateY(-2px);
          filter: blur(0.5px);
        }
        100% {
          opacity: 0;
          transform: translateX(40px) scale(0.92) translateY(-8px);
          filter: blur(2px);
        }
      }
      
      @keyframes columnFadeOut {
        0% {
          opacity: 1;
          transform: scale(1) translateY(0);
          filter: blur(0px);
        }
        50% {
          opacity: 0.6;
          transform: scale(0.96) translateY(-2px);
          filter: blur(1px);
        }
        100% {
          opacity: 0;
          transform: scale(0.88) translateY(-4px);
          filter: blur(2px);
        }
      }
      
      /* Add column button animation - Enhanced */
      .add-column-button {
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }
      
      .add-column-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .add-column-button:hover::before {
        left: 100%;
      }
      
      .add-column-button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
        border-color: hsl(var(--primary) / 0.7);
      }
      
      .add-column-button:active {
        transform: translateY(-1px) scale(1.01);
        transition: all 0.15s cubic-bezier(0.7, 0, 0.84, 0);
      }
      
      /* Column container animation - Refined */
      .column-container {
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
      }
      
      .column-container:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      }
      
      /* Subtle pulse animation for new columns */
      .column-enter .column-container {
        animation: columnSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                   columnPulse 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
      }
      
      @keyframes columnPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(var(--primary), 0.3);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(var(--primary), 0.1);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(var(--primary), 0);
        }
      }
      
      /* Smooth transitions for all interactive elements */
      .column-container * {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle column animation detection
  useEffect(() => {
    const previousColumns = previousColumnsRef.current;
    const currentColumnIds = new Set(columns.map(col => col._id));
    const previousColumnIds = new Set(previousColumns.map(col => col._id));

    // Detect new columns
    const newIds = new Set([...currentColumnIds].filter(id => !previousColumnIds.has(id)));
    if (newIds.size > 0) {
      setNewColumnIds(prev => new Set([...prev, ...newIds]));
      
      // Remove from new columns after animation completes
      newIds.forEach(id => {
        const timeout = setTimeout(() => {
          setNewColumnIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }, 600); // Match animation duration
        animationTimeoutsRef.current.set(id, timeout);
      });
    }

    // Detect deleted columns
    const deletedIds = new Set([...previousColumnIds].filter(id => !currentColumnIds.has(id)));
    if (deletedIds.size > 0) {
      setDeletingColumnIds(prev => new Set([...prev, ...deletedIds]));
      
      // Remove from deleting columns after animation completes
      deletedIds.forEach(id => {
        const timeout = setTimeout(() => {
          setDeletingColumnIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }, 400); // Match animation duration
        animationTimeoutsRef.current.set(id, timeout);
      });
    }

    previousColumnsRef.current = columns;

    // Cleanup function
    return () => {
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimeoutsRef.current.clear();
    };
  }, [columns]);

  // Enhanced delete column handler with animation
  const handleDeleteColumn = async (columnId: string) => {
    setDeletingColumnIds(prev => new Set([...prev, columnId]));
    
    // Wait for animation to complete before actually deleting
    setTimeout(async () => {
      try {
        await onDeleteColumn(columnId);
      } catch (error) {
        console.error('Failed to delete column:', error);
        // Remove from deleting state if deletion failed
        setDeletingColumnIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(columnId);
          return newSet;
        });
      }
    }, 300); // Slightly less than animation duration
  };

  // // Handle column creation
  // const handleAddColumn = async (columnData: { name?: string; backgroundColor?: string; icon?: string | null; wipLimit?: number; isDefault?: boolean }) => {
  //   try {
  //     if (!boardId) return;
      
  //     console.log('Creating column:', columnData);
      
  //     try {
  //       await addColumn({
  //         name: columnData.name || 'New Column',
  //         boardId: boardId,
  //         position: columns.length,
  //         backgroundColor: columnData.backgroundColor || '#F9FAFB',
  //         icon: columnData.icon || null,
  //         settings: {}
  //       });
  //       console.log('Column created successfully!');
  //     } catch (error) {
  //       console.error('Column creation failed:', error);
  //     }
  //   } catch (error) {
  //     console.error('Failed to add column:', error);
  //   }
  // };




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
            {error || 'Failed to load board data'}
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
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper>
      <DragDropContext 
        onDragEnd={(result) => {
          // Reset cursor when drag ends
          document.body.style.cursor = '';
          onDragEnd(result);
        }}
        onDragStart={(start) => {
          // Ensure proper drag behavior
          document.body.style.cursor = 'grabbing';
          console.log('Drag started:', start);
        }}
        onDragUpdate={(update) => {
          // Keep cursor consistent during drag
          document.body.style.cursor = 'grabbing';
          console.log('Drag update:', update);
        }}
      >
        <div className="min-h-screen bg-background/60 text-foreground w-full pb-20 rounded-2xl border border-border/50">
          <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
            {/* Compact Stats */}
            <ErrorBoundaryWrapper>
              <div className="mb-4">
                <div className="flex justify-end">
                  <div className="flex items-center gap-2">
                    {/* Done */}
                    <div className="group relative flex items-center gap-1 px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-all duration-300 cursor-pointer">
                      <div className="relative">
                        <svg className="w-3 h-3 text-emerald-500 group-hover:text-emerald-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{taskStats.completed}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">Done</span>
                    </div>

                    {/* In Progress */}
                    <div className="group relative flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-500/10 transition-all duration-300 cursor-pointer">
                      <div className="relative">
                        <svg className="w-3 h-3 text-blue-500 group-hover:text-blue-600 transition-colors animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{taskStats.inProgress}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-blue-700 group-hover:text-blue-800 transition-colors">Progress</span>
                  </div>
                  
                    {/* Pending */}
                    <div className="group relative flex items-center gap-1 px-2 py-1 rounded-md hover:bg-orange-500/10 transition-all duration-300 cursor-pointer">
                      <div className="relative">
                        <svg className="w-3 h-3 text-orange-500 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{taskStats.todo}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-orange-700 group-hover:text-orange-800 transition-colors">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundaryWrapper>

            {/* Modern Kanban Board */}
            <ErrorBoundaryWrapper>
              <div className="relative bg-card backdrop-blur-md rounded-2xl border border-border shadow-xl p-8">
                <Droppable droppableId="board" type="COLUMN" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex gap-12 py-2 overflow-x-auto ${
                        snapshot.isDraggingOver ? 'bg-primary/10 rounded-xl' : ''
                      }`}
                    >
                    {columns.map((column: Column, index: number) => {
                      const isNewColumn = newColumnIds.has(column._id);
                      const isDeletingColumn = deletingColumnIds.has(column._id);
                      
                      return (
                        <div 
                          key={column._id} 
                          className={`flex-shrink-0 w-72 column-container ${
                            isNewColumn ? 'column-enter' : ''
                          } ${
                            isDeletingColumn ? 'column-deleting' : ''
                          }`}
                        >
                          <ErrorBoundaryWrapper>
                            <DraggableColumn
                              column={column}
                              tasks={tasksByColumn[column._id] || []}
                              index={index}
                              boardId={currentBoard?._id || ''}
                              onTaskClick={onTaskClick}
                              onAddTask={onAddTask as any}
                              onEditColumn={onEditColumn}
                              onDeleteColumn={handleDeleteColumn}
                            />
                          </ErrorBoundaryWrapper>
                        </div>
                      );
                    })}
                    
                    {/* Modern Add Column Button/Input */}
                    <div className="flex-shrink-0 w-72">
                      {!isAddingColumn ? (
                        <div 
                          onClick={() => setIsAddingColumn(true)}
                          className="h-24 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 rounded-xl group cursor-pointer bg-muted/20 hover:bg-muted/40 backdrop-blur-sm hover:shadow-md add-column-button"
                        >
                          <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md">
                              <svg className="w-5 h-5 text-primary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                Add Column
                              </div>
                              <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                                Create a new column
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 border-2 border-primary/60 rounded-xl bg-card backdrop-blur-md shadow-lg overflow-hidden">
                          <div className="h-full flex items-center px-6">
                            <input
                              type="text"
                              value={newColumnName}
                              onChange={(e) => setNewColumnName(e.target.value)}
                              onKeyDown={onKeyPress}
                              onBlur={onCancelAddColumn}
                              placeholder="Enter column name..."
                              className="w-full text-sm font-medium text-foreground placeholder-muted-foreground bg-transparent border-0 outline-none focus:outline-none caret-foreground"
                              autoFocus
                            />
                          </div>
                        </div>
                      )}
                    </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </ErrorBoundaryWrapper>

            {/* Empty State */}
            {/* {columns.length === 0 && (
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
            )} */}

            {/* Modals */}
            <ErrorBoundaryWrapper>
              <AddColumnModal
                isOpen={isAddColumnModalOpen}
                onClose={() => setIsAddColumnModalOpen(false)}
                onSubmit={onAddColumn}
              />

              <EditColumnModal
                isOpen={isEditColumnModalOpen}
                onClose={() => setIsEditColumnModalOpen(false)}
                column={editingColumn}
                onSave={onUpdateColumn}
              />
            </ErrorBoundaryWrapper>
          </div>
        </div>
      </DragDropContext>
    </ErrorBoundaryWrapper>
  );
};
