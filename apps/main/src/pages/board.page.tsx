import { useState, useEffect, useRef } from 'react';
import { TaskDetailsLayout } from "../layouts/board/TaskDetailsLayout";
import { ListViewLayout } from "../layouts/board/ListViewLayout";
import { TimelineViewLayout } from "../layouts/board/TimelineViewLayout";
import { KanbanViewLayout } from "../layouts/board/KanbanViewLayout";
import { SubNavigationTest as SubNavigation } from "../components/board/SubNavigationTest";
import { BoardHeader } from "../components/board/BoardHeader";
import { TaskDetailModal } from "../components/board/TaskDetailModal";
import { DeleteColumnModal } from "../components/board/DeleteColumnModal";
import { useBoard, useTasks, useColumns, useSpaceManager } from "../hooks";
import { useSocketContext } from '../contexts/SocketContext';
import type { Task } from "../types/task.types";
import type { Column } from "../types/board.types";
import backgroundImage from "../assets/backgound-2.jpg";

type ViewType = 'kanban' | 'list' | 'timeline' | 'task';

// Global state to track loaded boards - defined outside component to prevent resets
const loadedBoards = new Set<string>();
const loadingBoards = new Set<string>();

export const BoardPage = () => {
    // Socket context for real-time operations
    const { joinBoardRoom, leaveBoardRoom, createColumn: socketCreateColumn, updateColumn: socketUpdateColumn, deleteColumn: socketDeleteColumn, reorderColumns: socketReorderColumns, boardSocket, isConnected } = useSocketContext();
    
    // Board data
    const { currentBoard, loading: boardLoading, error: boardError, createBoardTag, deleteTag } = useBoard();
    
    // Tasks data
    const {
        loading: tasksLoading,
        error: tasksError,
        addTask,
        editTask,
        removeTask,
        moveTask
    } = useTasks();

    // Columns data
    const {
        sortedColumns,
        loadColumnsByBoard
    } = useColumns();

    // Note: Task management is now handled in the column slice

    // Space manager data
    const {
        boardLoading: spaceBoardLoading,
        boardError: spaceBoardError
    } = useSpaceManager();
    
    // Combined loading and error states
    const loading = boardLoading || tasksLoading || spaceBoardLoading;
    const error = boardError || tasksError || spaceBoardError;
    
    // Board ID
    const boardId = currentBoard?._id;
    
    // View state management
    const [currentView, setCurrentView] = useState<ViewType>('kanban');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayView, setDisplayView] = useState<ViewType>('kanban');

    // Column management state
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
    const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);
    
    // Task detail modal state
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Track previous boardId to prevent unnecessary re-loads
    const prevBoardIdRef = useRef<string | null>(null);

    // Load data when component mounts (only if we have a board but no data)
    useEffect(() => {
        
        if (!boardId) {
            return;
        }
        
        // Only load if boardId has actually changed and we haven't loaded it yet
        if (boardId !== prevBoardIdRef.current && !loadedBoards.has(boardId)) {
            prevBoardIdRef.current = boardId;
            loadedBoards.add(boardId);
            loadColumnsByBoard(boardId);
            // Tasks will be loaded into columns via socket events or separate API calls
        } else {
        }
    }, [boardId, loadColumnsByBoard]);

    // Note: Tasks are now loaded automatically with columns in fetchColumnsByBoard

    // Get all tasks from all columns for stats calculation
    const allTasks = (sortedColumns as Column[]).flatMap(column => column.tasks || []);

    // Note: Tasks will be loaded into columns via socket events or API calls
    // No need for this useEffect as it was causing infinite loops

    // Join board room when board changes and socket is connected
    useEffect(() => {
        if (boardId && isConnected) {
            joinBoardRoom(boardId);
            
            // Cleanup: leave room when component unmounts or board changes
            return () => {
                leaveBoardRoom(boardId);
            };
        }
    }, [boardId, isConnected, joinBoardRoom, leaveBoardRoom]);

    // Add a cleanup effect to remove board from loaded set when component unmounts
    useEffect(() => {
        return () => {
            if (boardId) {
                loadedBoards.delete(boardId);
                loadingBoards.delete(boardId);
            }
        };
    }, [boardId]);

    // Socket room management for real-time updates
    useEffect(() => {
        if (boardId && boardSocket && isConnected) {
            boardSocket.emit('board:join', { boardId });
            
            return () => {
                boardSocket.emit('board:leave', { boardId });
            };
        }
    }, [boardId, boardSocket, isConnected]);

    // Handle view transitions with animation
    const handleViewChange = (newView: ViewType) => {
        if (newView === currentView || isTransitioning) return;
        
        setIsTransitioning(true);
        
        // Start fade out
        setTimeout(() => {
            setDisplayView(newView);
            setCurrentView(newView);
            
            // Start fade in
            setTimeout(() => {
                setIsTransitioning(false);
            }, 150);
        }, 150);
    };

    // Column management handlers
    const handleAddColumn = async () => {
        if (newColumnName.trim() && boardId) {
            try {
                // Use socket operation instead of HTTP
                socketCreateColumn(boardId, {
                    name: newColumnName.trim(),
                    position: sortedColumns.length,
                    settings: {}
                });
                
                // Reset state
                setNewColumnName('');
                setIsAddingColumn(false);
            } catch (error) {
                // Handle error silently
            }
        }
    };

    const handleCancelAddColumn = () => {
        setNewColumnName('');
        setIsAddingColumn(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddColumn();
        } else if (e.key === 'Escape') {
            handleCancelAddColumn();
        }
    };

    // Task management handlers
    const handleAddTask = async (taskData: Partial<Task>) => {
        try {
            if (!boardId) return;
            
            
            await addTask({
                ...taskData,
                board: boardId,
                column: taskData.column // Use the column from taskData, not selectedColumn
            });
            
            setIsAddTaskModalOpen(false);
            setSelectedColumn('');
        } catch (error) {
            // Handle error silently
        }
    };

    const handleAddTaskToColumn = (columnId: string) => {
        setSelectedColumn(columnId);
        setIsAddTaskModalOpen(true);
    };

    // Drag and drop handlers
    const handleDragEnd = async (result: any) => {
        const { source, destination, type } = result;

        // If dropped outside a droppable area
        if (!destination) {
            return;
        }

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
                await moveTask(
                    taskId,
                    sourceColumnId,
                    destinationColumnId,
                    destination.index,
                    boardId || ''
                );
            } catch (error) {
                // Handle error silently
            }
        } else if (type === 'COLUMN') {
            // Handle column reordering
            try {
                await handleReorderColumns(source.index, destination.index);
            } catch (error) {
                // Handle error silently
            }
        }
    };

    const handleReorderColumns = async (sourceIndex: number, destinationIndex: number) => {
        try {
            if (!boardId) {
                // No board ID available
                return;
            }
            
            const typedColumns = sortedColumns as Column[];
            const newColumnOrder = Array.from(typedColumns);
            const [removed] = newColumnOrder.splice(sourceIndex, 1);
            newColumnOrder.splice(destinationIndex, 0, removed);
            
            // Get column IDs in the new order
            const columnIds = newColumnOrder.map((col: Column) => col._id);
            
            // Use socket operation instead of HTTP
            socketReorderColumns(boardId, columnIds);
            
        } catch (error) {
            // Handle error silently
        }
    };

    // Column actions
    const handleEditColumn = (columnId: string) => {
        const column = sortedColumns.find(col => col._id === columnId);
        if (column) {
            setEditingColumn(column);
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        try {
            if (!boardId) return;
            
            // Find the column to delete
            const column = sortedColumns.find(col => col._id === columnId);
            if (!column) return;
            
            // Set up delete modal state
            setDeletingColumn(column);
            setIsDeleteColumnModalOpen(true);
            
        } catch (error) {
            // Handle error silently
        }
    };

    const confirmDeleteColumn = async () => {
        if (!deletingColumn || !boardId) return;
        
        try {
            // Delete the column via socket (backend will handle deleting all tasks)
            socketDeleteColumn(deletingColumn._id, boardId);
            
        } catch (error) {
            // Handle error silently
            throw error; // Re-throw to show error in modal
        }
    };

    const handleUpdateColumn = async (columnId: string, columnData: Partial<Column>) => {
        try {
            // Use socket operation instead of HTTP
            const updateData: any = {
                name: columnData.name || '',
            };
            
            // Handle style updates - send complete style object
            if (columnData.style) {
                updateData.style = {
                    color: columnData.style.color || '#6B7280',
                    backgroundColor: columnData.style.backgroundColor || '#F9FAFB',
                    icon: columnData.style.icon || null,
                    ...columnData.style // Preserve any additional properties
                };
            }
            
            // Handle legacy color property
            if ((columnData as any).color) {
                updateData.style = {
                    color: (columnData as any).color,
                    backgroundColor: (columnData as any).color,
                    icon: columnData.style?.icon || null,
                    ...updateData.style
                };
            }
            
            // Handle settings
            if (columnData.settings) {
                updateData.settings = columnData.settings;
            }
            
            socketUpdateColumn(columnId, updateData);
            setEditingColumn(null);
        } catch (error) {
            // Handle error silently
        }
    };

    // Task click handler
    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
    };

    // Task modal handlers
    const handleTaskSave = async (taskData: Partial<Task>) => {
        try {
            if (selectedTask && currentBoard) {
                await editTask(selectedTask._id, { ...taskData, board: currentBoard._id });
            }
        } catch (error) {
            console.error('Failed to save task:', error);
            throw error;
        }
    };

    const handleTaskDelete = async () => {
        try {
            if (selectedTask && currentBoard) {
                await removeTask(selectedTask._id, currentBoard._id);
                setIsTaskDetailModalOpen(false);
                setSelectedTask(null);
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    };

    const handleTaskModalClose = () => {
        setIsTaskDetailModalOpen(false);
        setSelectedTask(null);
    };

    // Get tasks from columns (tasks are now stored within columns)
    const tasksByColumn = (sortedColumns as Column[]).reduce((acc: Record<string, Task[]>, column: Column) => {
        acc[column._id] = column.tasks || [];
        return acc;
    }, {} as Record<string, Task[]>);

    // Helper function to determine task status from column name
    const getTaskStatusFromColumn = (task: any) => {
        if (!task.column?.name) return 'todo';
        const columnName = task.column.name.toLowerCase();
        if (columnName.includes('done') || columnName.includes('complete')) return 'done';
        if (columnName.includes('review') || columnName.includes('testing')) return 'review';
        if (columnName.includes('progress') || columnName.includes('doing')) return 'in_progress';
        return 'todo';
    };

    // Calculate task stats based on column names
    const taskStats = {
        total: allTasks.length,
        completed: allTasks.filter(task => getTaskStatusFromColumn(task) === 'done').length,
        inProgress: allTasks.filter(task => getTaskStatusFromColumn(task) === 'in_progress').length,
        todo: allTasks.filter(task => getTaskStatusFromColumn(task) === 'todo').length,
    };

    // Loading state
    if (loading) {
        return (
            <div 
                className="flex items-center justify-center min-h-screen"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="text-center bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading board...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div 
                className="flex items-center justify-center min-h-screen"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="text-center bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className="text-red-400 text-xl mb-2">Error Loading Board</div>
                    <p className="text-white mb-4">{error}</p>
                </div>
            </div>
        );
    }

    // No board selected
    if (!currentBoard) {
        return (
            <div 
                className="flex items-center justify-center min-h-screen"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="text-center bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className="text-yellow-400 text-xl mb-2">No Board Selected</div>
                    <p className="text-white mb-4">Please select a board from your space to continue.</p>
                </div>
            </div>
        );
    }

    // Common props for all layouts
    const commonLayoutProps = {
        currentBoard,
        tasks: allTasks,
        columns: sortedColumns,
        tasksByColumn,
        taskStats,
        loading: tasksLoading,
        error: tasksError,
        onTaskClick: handleTaskClick,
        onAddTask: handleAddTask,
        onAddTaskToColumn: handleAddTaskToColumn,
        onDragEnd: handleDragEnd,
        onEditColumn: handleEditColumn,
        onDeleteColumn: handleDeleteColumn,
        onUpdateColumn: handleUpdateColumn,
        onAddColumn: handleAddColumn,
        onCancelAddColumn: handleCancelAddColumn,
        onKeyPress: handleKeyPress,
        isAddingColumn,
        newColumnName,
        setNewColumnName,
        setIsAddingColumn,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        isAddColumnModalOpen,
        setIsAddColumnModalOpen,
        selectedColumn,
        editingColumn,
        // Board tag functions
        onAddBoardTag: async (tag: { name: string; color: string }) => {
            if (currentBoard?._id) {
                createBoardTag(currentBoard._id, tag);
            }
        },
        onRemoveBoardTag: async (tagName: string) => {
            if (currentBoard?._id) {
                deleteTag(currentBoard._id, tagName);
            }
        }
    };

    // Function to render the current view
    const renderCurrentView = () => {
        switch (displayView) {
            case 'kanban':
                return <KanbanViewLayout {...commonLayoutProps} />;
            case 'list':
                return <ListViewLayout {...commonLayoutProps} />;
            case 'timeline':
                return <TimelineViewLayout {...commonLayoutProps} />;
            case 'task':
                return <TaskDetailsLayout {...commonLayoutProps} />;
            default:
                return <KanbanViewLayout {...commonLayoutProps} />;
        }
    };

    return (
        <div 
            className="w-full h-screen flex flex-col relative"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Board Header */}
            <BoardHeader 
                className="z-20"
                currentBoard={currentBoard}
                loading={boardLoading}
            />

            {/* Board Content */}
            <div className="flex-1 overflow-hidden relative  p-4 ">
                <div 
                    className={`h-full transition-all duration-300 ease-in-out border-2 border-white/5 rounded-2xl shadow-xl ${
                        isTransitioning 
                            ? 'opacity-0 transform scale-95' 
                            : 'opacity-100 transform scale-100'
                    }`}
                >
                    {renderCurrentView()}
                </div>
            </div>
            
            {/* Bottom Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex justify-center">
                    <SubNavigation 
                        currentView={currentView}
                        onViewChange={handleViewChange}
                        isTransitioning={isTransitioning}
                    />
                </div>
            </div>

            {/* Task Detail Modal */}
            <TaskDetailModal
                isOpen={isTaskDetailModalOpen}
                onClose={handleTaskModalClose}
                task={selectedTask}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
            />

            {/* Delete Column Modal */}
            <DeleteColumnModal
                isOpen={isDeleteColumnModalOpen}
                onClose={() => {
                    setIsDeleteColumnModalOpen(false);
                    setDeletingColumn(null);
                }}
                onConfirm={confirmDeleteColumn}
                column={deletingColumn}
                taskCount={deletingColumn?.tasks?.length || 0}
                isLastColumn={deletingColumn ? sortedColumns.filter(col => col._id !== deletingColumn._id).length === 0 : false}
            />

        </div>
    );
};
