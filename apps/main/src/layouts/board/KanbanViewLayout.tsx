import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { DraggableColumn } from '../../components/board/DraggableColumn';
import { AddColumnModal } from '../../components/board/AddColumnModal';
import { AddTagModal } from '../../components/board/AddTagModal';
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
  onDeleteColumn: (columnId: string) => void;
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
  // Board tag props
  onAddBoardTag?: (tag: { name: string; color: string }) => Promise<void>;
  onRemoveBoardTag?: (tagName: string) => Promise<void>;
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
  // Board tag props
  onAddBoardTag,
  onRemoveBoardTag
}) => {
  // Animation state management
  const [newColumnIds, setNewColumnIds] = useState<Set<string>>(new Set());
  const [deletingColumnIds, setDeletingColumnIds] = useState<Set<string>>(new Set());
  const previousColumnsRef = useRef<Column[]>([]);
  
  // Scroll synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const animationTimeoutsRef = useRef<Map<string, number>>(new Map());

  // Checklist state management
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const checklistDropdownRef = useRef<HTMLDivElement>(null);

  // Tag dropdown state management
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownTimeoutRef = useRef<number | null>(null);


  // Enhanced CSS for better scrolling and design
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Column Task List Scrollbar Design */
      .column-task-scroll {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.1);
        scroll-behavior: smooth;
      }
      
      .column-task-scroll::-webkit-scrollbar {
        width: 8px;
      }
      
      .column-task-scroll::-webkit-scrollbar-track {
        background: hsl(var(--muted) / 0.05);
        border-radius: 4px;
        margin: 4px 0;
      }
      
      .column-task-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.6));
        border-radius: 4px;
        border: 1px solid hsl(var(--background));
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .column-task-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.8));
        transform: scaleX(1.1);
      }
      
      .column-task-scroll::-webkit-scrollbar-thumb:active {
        background: hsl(var(--primary) / 0.8);
        transform: scaleX(1.2);
      }

      /* Professional Horizontal Scrollbar Design */
      .kanban-horizontal-scroll {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--primary) / 0.3) transparent;
        scroll-behavior: smooth;
      }
      
      .kanban-horizontal-scroll::-webkit-scrollbar {
        height: 8px;
      }
      
      .kanban-horizontal-scroll::-webkit-scrollbar-track {
        background: hsl(var(--muted) / 0.1);
        border-radius: 4px;
        margin: 0 4px;
      }
      
      .kanban-horizontal-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.5));
        border-radius: 4px;
        border: 1px solid hsl(var(--background));
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .kanban-horizontal-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.7));
        transform: scaleY(1.1);
      }
      
      .kanban-horizontal-scroll::-webkit-scrollbar-thumb:active {
        background: hsl(var(--primary) / 0.7);
        transform: scaleY(1.2);
      }

      /* Top Scrollbar Indicator */
      .top-scroll-indicator {
        background: linear-gradient(90deg, 
          hsl(var(--primary) / 0.1) 0%, 
          hsl(var(--primary) / 0.2) 50%, 
          hsl(var(--primary) / 0.1) 100%);
        border-radius: 2px;
        transition: all 0.3s ease;
      }
      
      .top-scroll-indicator:hover {
        background: linear-gradient(90deg, 
          hsl(var(--primary) / 0.2) 0%, 
          hsl(var(--primary) / 0.3) 50%, 
          hsl(var(--primary) / 0.2) 100%);
      }

      /* Professional Column Animations */
      .column-container {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .column-container:hover {
        transform: translateY(-2px);
      }
      
      .column-enter {
        animation: columnEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .column-deleting {
        animation: columnDelete 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      @keyframes columnEnter {
        0% {
          opacity: 0;
          transform: translateX(-20px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      
      @keyframes columnDelete {
        0% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateX(20px) scale(0.95);
        }
      }

      /* Add Column Button Animations */
      .add-column-button {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .add-column-button:hover {
        transform: translateY(-1px);
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

  // Scroll synchronization functions
  const syncScrollFromTop = useCallback((event: Event) => {
    if (isScrolling) return;
    setIsScrolling(true);
    
    const target = event.target as HTMLDivElement;
    if (mainScrollRef.current && target.scrollLeft !== undefined) {
      mainScrollRef.current.scrollLeft = target.scrollLeft;
    }
    
    setTimeout(() => setIsScrolling(false), 10);
  }, [isScrolling]);

  const syncScrollFromMain = useCallback((event: Event) => {
    if (isScrolling) return;
    setIsScrolling(true);
    
    const target = event.target as HTMLDivElement;
    if (topScrollRef.current && target.scrollLeft !== undefined) {
      topScrollRef.current.scrollLeft = target.scrollLeft;
    }
    
    setTimeout(() => setIsScrolling(false), 10);
  }, [isScrolling]);

  // Setup scroll synchronization and content width tracking
  useEffect(() => {
    const topScroll = topScrollRef.current;
    const mainScroll = mainScrollRef.current;
    const content = contentRef.current;

    if (topScroll && mainScroll && content) {
      // Setup scroll synchronization
      topScroll.addEventListener('scroll', syncScrollFromTop, { passive: true });
      mainScroll.addEventListener('scroll', syncScrollFromMain, { passive: true });

      // Setup ResizeObserver to track content width
      const resizeObserver = new ResizeObserver(() => {
        const width = content.scrollWidth;
        setContentWidth(width);
      });

      resizeObserver.observe(content);

      return () => {
        topScroll.removeEventListener('scroll', syncScrollFromTop);
        mainScroll.removeEventListener('scroll', syncScrollFromMain);
        resizeObserver.disconnect();
      };
    }
  }, [syncScrollFromTop, syncScrollFromMain]);

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
  const handleDeleteColumn = (columnId: string) => {
    setDeletingColumnIds(prev => new Set([...prev, columnId]));
    
    // Call the delete handler immediately (it will show the modal)
    onDeleteColumn(columnId);
    
    // Remove from deleting state after a short delay for visual feedback
    setTimeout(() => {
      setDeletingColumnIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(columnId);
        return newSet;
      });
    }, 300);
  };

  // Handle click outside for checklist dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (checklistDropdownRef.current && !checklistDropdownRef.current.contains(event.target as Node)) {
        setShowChecklistDropdown(false);
      }
    };

    if (showChecklistDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showChecklistDropdown]);

  // Handle click outside for tag dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTagDropdown]);

  // Tag dropdown hover handlers with delay
  const handleTagButtonMouseEnter = () => {
    if (tagDropdownTimeoutRef.current) {
      clearTimeout(tagDropdownTimeoutRef.current);
      tagDropdownTimeoutRef.current = null;
    }
    setShowTagDropdown(true);
  };

  const handleTagButtonMouseLeave = () => {
    tagDropdownTimeoutRef.current = window.setTimeout(() => {
      setShowTagDropdown(false);
    }, 150); // Small delay to allow moving to dropdown
  };

  const handleTagDropdownMouseEnter = () => {
    if (tagDropdownTimeoutRef.current) {
      clearTimeout(tagDropdownTimeoutRef.current);
      tagDropdownTimeoutRef.current = null;
    }
    setShowTagDropdown(true);
  };

  const handleTagDropdownMouseLeave = () => {
    tagDropdownTimeoutRef.current = window.setTimeout(() => {
      setShowTagDropdown(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tagDropdownTimeoutRef.current) {
        clearTimeout(tagDropdownTimeoutRef.current);
      }
    };
  }, []);






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
        }}
        onDragUpdate={(update) => {
          // Keep cursor consistent during drag
          document.body.style.cursor = 'grabbing';
        }}
      >
        <div className="min-h-screen bg-background/60 text-foreground w-full pb-20 rounded-2xl border border-border/50">
          <div className="w-full ">
            {/* Header with Stats and Board Tags */}
            <ErrorBoundaryWrapper>
              <div className="mt-2 mb-2">
                <div className="flex justify-between items-center">
                  {/* Board Tags Section */}
                  <div className="flex items-center gap-2">
                    {/* Tag Management Button with Hover Dropdown */}
                    <div className="relative" ref={tagDropdownRef}>
                      <button
                        onMouseEnter={handleTagButtonMouseEnter}
                        onMouseLeave={handleTagButtonMouseLeave}
                        onClick={() => setIsAddChecklistModalOpen(true)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer bg-gradient-to-r from-muted/20 to-muted/10 hover:from-primary/10 hover:to-primary/5 hover:shadow-lg backdrop-blur-sm"
                      >
                        {/* Tag Icon */}
                        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/40 transition-all duration-300">
                          <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        
                        {/* Button Text */}
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            Manage Tags
                          </span>
                          <span className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                            {currentBoard?.tags?.length || 0} tags
                          </span>
                        </div>
                        
                        {/* Dropdown Arrow */}
                        <svg 
                          className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 ${showTagDropdown ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Elegant Hover Dropdown */}
                      {showTagDropdown && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-80 bg-card/95 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
                          onMouseEnter={handleTagDropdownMouseEnter}
                          onMouseLeave={handleTagDropdownMouseLeave}
                        >
                          {/* Dropdown Header */}
                          <div className="p-4 border-b border-border/10 bg-gradient-to-r from-muted/5 to-transparent">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground">Board Tags</h3>
                                  <p className="text-xs text-muted-foreground">Manage your board tags</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setIsAddChecklistModalOpen(true)}
                                className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-200 group"
                                title="Add new tag"
                              >
                                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Tags List */}
                          <div className="max-h-64 overflow-y-auto">
                            {currentBoard?.tags && currentBoard.tags.length > 0 ? (
                              <div className="p-2 space-y-1">
                                {currentBoard.tags.map((tag, index) => (
                                  <div
                                    key={index}
                                    className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div
                                        className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: tag.color }}
                                      />
                                      <span 
                                        className="text-sm font-medium text-foreground truncate"
                                        style={{ color: tag.color }}
                                      >
                                        {tag.name}
                                      </span>
                                    </div>
                                    
                                    {/* Delete Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveBoardTag?.(tag.name);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-red-500/20 hover:scale-105"
                                      title="Delete tag"
                                    >
                                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3">
                                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-medium text-foreground mb-1">No tags yet</h4>
                                <p className="text-xs text-muted-foreground mb-3">Create your first tag to organize tasks</p>
                                <button
                                  onClick={() => setIsAddChecklistModalOpen(true)}
                                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-all duration-200"
                                >
                                  Create Tag
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Stats */}
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
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundaryWrapper>

            {/* Modern Kanban Board */}
            <ErrorBoundaryWrapper>
              <div className="relative p-2">
                {/* Professional Horizontal Scroll Container */}
                <div className="relative">
                  {/* Top Scrollbar Indicator */}
                  <div 
                    ref={topScrollRef}
                    className="kanban-horizontal-scroll overflow-x-auto mb-2"
                    style={{ height: '10px' }}
                  >
                    <div className="h-2 bg-transparent" style={{ width: contentWidth || '100%' }}>
                      <div className="top-scroll-indicator h-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  {/* Main Scrollable Content */}
                  <div 
                    ref={mainScrollRef}
                    className="kanban-horizontal-scroll overflow-x-auto"
                  >
              <Droppable droppableId="board" type="COLUMN" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                          ref={(el) => {
                            provided.innerRef(el);
                            contentRef.current = el;
                          }}
                    {...provided.droppableProps}
                          className={`flex gap-6 py-4 min-w-max ${
                            snapshot.isDraggingOver ? 'bg-primary/10 rounded-xl' : ''
                          }`}
                        >
                    {columns.map((column: Column, index: number) => {
                      const isNewColumn = newColumnIds.has(column._id);
                      const isDeletingColumn = deletingColumnIds.has(column._id);
                      
                      return (
                        <div 
                          key={column._id} 
                          className={`flex-shrink-0 w-80 column-container transition-all duration-300 ${
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
                          onUpdateColumn={onUpdateColumn}
                        />
                      </ErrorBoundaryWrapper>
                        </div>
                      );
                    })}
                    
                    {/* Professional Add Column Button/Input */}
                    <div className="flex-shrink-0 w-80">
                      {!isAddingColumn ? (
                        <div 
                          onClick={() => setIsAddingColumn(true)}
                          className="h-32 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-all duration-300 rounded-2xl group cursor-pointer bg-gradient-to-br from-muted/10 to-muted/20 hover:from-primary/5 hover:to-primary/10 backdrop-blur-sm hover:shadow-lg add-column-button"
                        >
                          <div className="h-full flex flex-col items-center justify-center gap-3 px-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105">
                              <svg className="w-6 h-6 text-primary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="h-20 border-2 border-primary/60 rounded-2xl bg-card backdrop-blur-md shadow-lg overflow-hidden">
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
                </div>
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


              <AddTagModal
                isOpen={isAddChecklistModalOpen}
                onClose={() => setIsAddChecklistModalOpen(false)}
                onSubmit={async (tag) => {
                  await onAddBoardTag?.(tag);
                  setIsAddChecklistModalOpen(false);
                }}
              />
            </ErrorBoundaryWrapper>
          </div>
        </div>
      </DragDropContext>
    </ErrorBoundaryWrapper>
  );
};
