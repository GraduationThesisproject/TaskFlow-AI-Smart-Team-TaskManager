import { useState, useEffect, useRef } from 'react';
import { TaskDetailsLayout } from "../layouts/board/TaskDetailsLayout";
import { ListViewLayout } from "../layouts/board/ListViewLayout";
import { TimelineViewLayout } from "../layouts/board/TimelineViewLayout";
import { KanbanViewLayout } from "../layouts/board/KanbanViewLayout";
import { SubNavigationTest as SubNavigation } from "../components/board/SubNavigationTest";
import { BoardHeader } from "../components/board/BoardHeader";
import { TaskDetailModal } from "../components/board/TaskDetailModal";
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
    const { currentBoard, loading: boardLoading, error: boardError } = useBoard();
    
    // Tasks data
    const {
        loading: tasksLoading,
        error: tasksError,
        addTask,
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
    const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    
    // Task detail modal state
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Track previous boardId to prevent unnecessary re-loads
    const prevBoardIdRef = useRef<string | null>(null);

    // Load data when component mounts (only if we have a board but no data)
    useEffect(() => {
        console.log('🔄 Board page useEffect triggered:', { boardId, prevBoardId: prevBoardIdRef.current, loadedBoards: Array.from(loadedBoards) });
        
        if (!boardId) {
            console.log('❌ No boardId, skipping load');
            return;
        }
        
        // Only load if boardId has actually changed and we haven't loaded it yet
        if (boardId !== prevBoardIdRef.current && !loadedBoards.has(boardId)) {
            console.log('✅ Loading columns for board:', boardId);
            prevBoardIdRef.current = boardId;
            loadedBoards.add(boardId);
            loadColumnsByBoard(boardId);
            // Tasks will be loaded into columns via socket events or separate API calls
        } else {
            console.log('⏭️ Skipping load - already loaded or same boardId');
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
            console.log('🔗 Joining board room for board:', boardId);
            joinBoardRoom(boardId);
            
            // Cleanup: leave room when component unmounts or board changes
            return () => {
                console.log('🔌 Leaving board room for board:', boardId);
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
            console.log('🔌 Joining board room for real-time updates:', boardId);
            boardSocket.emit('board:join', { boardId });
            
            return () => {
                console.log('🔌 Leaving board room:', boardId);
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
                console.error('Failed to add column:', error);
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
            
            console.log('🎯 handleAddTask - Received taskData:', taskData);
            console.log('🎯 handleAddTask - Using column from taskData:', taskData.column);
            
            await addTask({
                ...taskData,
                board: boardId,
                column: taskData.column // Use the column from taskData, not selectedColumn
            });
            
            setIsAddTaskModalOpen(false);
            setSelectedColumn('');
        } catch (error) {
            console.error('Failed to add task:', error);
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

    const handleReorderColumns = async (sourceIndex: number, destinationIndex: number) => {
        try {
            if (!boardId) {
                console.error('No board ID available for reordering columns');
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
            console.error('Failed to reorder columns:', error);
        }
    };

    // Column actions
    const handleEditColumn = (columnId: string) => {
        const column = sortedColumns.find(col => col._id === columnId);
        if (column) {
            setEditingColumn(column);
            setIsEditColumnModalOpen(true);
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        try {
            if (!boardId) return;
            
            // Check if column has tasks
            const column = sortedColumns.find(col => col._id === columnId);
            const columnTasks = column?.tasks || [];
            
            if (columnTasks.length > 0) {
                // Find another column to move tasks to
                const otherColumns = sortedColumns.filter(col => col._id !== columnId);
                
                if (otherColumns.length === 0) {
                    alert('Cannot delete the last column. Please create another column first.');
                    return;
                }
                
                // Show confirmation dialog
                const confirmMessage = `This column contains ${columnTasks.length} task(s). They will be moved to "${otherColumns[0].name}" column. Do you want to continue?`;
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                // Move tasks to the first available column
                const targetColumnId = otherColumns[0]._id;
                
                // Move all tasks to the target column
                for (const task of columnTasks) {
                    try {
                        await moveTask(task._id, columnId, targetColumnId, 0, boardId);
                    } catch (error) {
                        console.error(`Failed to move task ${task._id}:`, error);
                    }
                }
                
                // Wait a bit for tasks to be moved
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Now delete the column
            socketDeleteColumn(columnId, boardId);
        } catch (error) {
            console.error('Failed to delete column:', error);
        }
    };

    const handleUpdateColumn = async (columnId: string, columnData: Partial<Column>) => {
        try {
            // Use socket operation instead of HTTP
            socketUpdateColumn(columnId, {
                name: columnData.name || '',
                color: (columnData as any).color,
                settings: columnData.settings
            });
            setIsEditColumnModalOpen(false);
            setEditingColumn(null);
        } catch (error) {
            console.error('Failed to update column:', error);
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
            // Update task logic here
            console.log('Saving task:', taskData);
            // You can implement the actual save logic here
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleTaskDelete = async () => {
        try {
            if (selectedTask) {
                // Delete task logic here
                console.log('Deleting task:', selectedTask._id);
                // You can implement the actual delete logic here
                setIsTaskDetailModalOpen(false);
                setSelectedTask(null);
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
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

    // Calculate task stats
    const taskStats = {
        total: allTasks.length,
        completed: allTasks.filter(task => task.status === 'done').length,
        inProgress: allTasks.filter(task => task.status === 'in_progress').length,
        todo: allTasks.filter(task => task.status === 'todo').length,
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
        isEditColumnModalOpen,
        setIsEditColumnModalOpen,
        selectedColumn,
        editingColumn
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

        </div>
    );
};
