import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBoardSocket } from '../../contexts/SocketContext';
import {
  setSocketConnected,
  updateTaskRealTime,
  addTaskRealTime,
  removeTaskRealTime,
  updateColumnRealTime,
  addColumnRealTime,
  removeColumnRealTime,
  selectSocketConnected,
  selectCurrentBoard
} from '../../store/slices/taskSlice';
import type { Task, CreateTaskForm, UpdateTaskForm, MoveTaskForm } from '../../types/task.types';
import type { Column } from '../../types/board.types';

interface UseTaskSocketOptions {
  boardId?: string;
  spaceId?: string;
  workspaceId?: string;
}

export const useTaskSocket = (options: UseTaskSocketOptions = {}) => {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectSocketConnected);
  const currentBoard = useSelector(selectCurrentBoard);

  // Use the centralized board socket from SocketContext
  const boardSocket = useBoardSocket();
  const socket = boardSocket;
  const socketConnected = socket?.connected || false;
  const emit = (event: string, data?: any) => socket?.emit(event, data);
  const on = (event: string, callback: (data?: any) => void) => socket?.on(event, callback);
  const off = (event: string) => socket?.off(event);

  // Update Redux state when socket connection changes
  useEffect(() => {
    dispatch(setSocketConnected(socketConnected));
  }, [socketConnected, dispatch]);

  // Join board room when board changes
  useEffect(() => {
    if (socketConnected && currentBoard?._id) {
      emit('board:join', { boardId: currentBoard._id });
    }
  }, [socketConnected, currentBoard?._id, emit]);

  // Join workspace room when workspace changes
  useEffect(() => {
    if (socketConnected && options.workspaceId) {
      emit('workspace:join', { workspaceId: options.workspaceId });
    }
  }, [socketConnected, options.workspaceId, emit]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Task events
    const handleTaskUpdated = (data: { task: Task }) => {
      dispatch(updateTaskRealTime(data.task));
    };

    const handleTaskCreated = (data: { task: Task }) => {
      dispatch(addTaskRealTime(data.task));
    };

    const handleTaskDeleted = (data: { taskId: string }) => {
      dispatch(removeTaskRealTime(data.taskId));
    };

    const handleTaskMoved = (data: { task: Task }) => {
      dispatch(updateTaskRealTime(data.task));
    };

    // Column events
    const handleColumnUpdated = (data: { column: Column }) => {
      dispatch(updateColumnRealTime(data.column));
    };

    const handleColumnCreated = (data: { column: Column }) => {
      dispatch(addColumnRealTime(data.column));
    };

    const handleColumnDeleted = (data: { columnId: string }) => {
      dispatch(removeColumnRealTime(data.columnId));
    };

    const handleColumnsReordered = (data: { columns: Column[] }) => {
      data.columns.forEach(column => {
        dispatch(updateColumnRealTime(column));
      });
    };

    // Board events
    const handleBoardState = (data: { board: any; columns: Column[]; tasks: Task[] }) => {
      // This would update the entire board state
      data.columns.forEach(column => {
        dispatch(updateColumnRealTime(column));
      });
      data.tasks.forEach(task => {
        dispatch(updateTaskRealTime(task));
      });
    };

    // User presence events
    const handleUserJoined = (data: { user: any }) => {
      console.log('User joined board:', data.user.name);
    };

    const handleUserLeft = (data: { user: any }) => {
      console.log('User left board:', data.user.name);
    };

    const handleUserViewing = (data: { user: any }) => {
      console.log('User viewing board:', data.user.name);
    };

    // Typing indicators
    const handleUserTyping = (data: { user: any; isTyping: boolean }) => {
      console.log(`${data.user.name} is ${data.isTyping ? 'typing' : 'not typing'}`);
    };

    // Connection events
    const handleConnected = (data: any) => {
      console.log('Connected to TaskFlow:', data);
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
    };

    // Register event listeners
    on('connected', handleConnected);
    on('error', handleError);
    
    // Task events
    on('task:updated', handleTaskUpdated);
    on('task:created', handleTaskCreated);
    on('task:deleted', handleTaskDeleted);
    on('task:moved', handleTaskMoved);
    
    // Column events
    on('column:updated', handleColumnUpdated);
    on('column:created', handleColumnCreated);
    on('column:deleted', handleColumnDeleted);
    on('columns:reordered', handleColumnsReordered);
    
    // Board events
    on('board:state', handleBoardState);
    on('board:user-joined', handleUserJoined);
    on('board:user-left', handleUserLeft);
    on('board:user-viewing', handleUserViewing);
    
    // Typing events
    on('user:typing', handleUserTyping);

    // Cleanup
    return () => {
      off('connected');
      off('error');
      off('task:updated');
      off('task:created');
      off('task:deleted');
      off('task:moved');
      off('column:updated');
      off('column:created');
      off('column:deleted');
      off('columns:reordered');
      off('board:state');
      off('board:user-joined');
      off('board:user-left');
      off('board:user-viewing');
      off('user:typing');
    };
  }, [socket, on, off, dispatch]);

  // Task operations
  const createTask = useCallback((taskData: CreateTaskForm) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('task:create', {
      boardId: currentBoard._id,
      taskData
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const updateTask = useCallback((taskId: string, updates: UpdateTaskForm) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('task:update', {
      taskId,
      boardId: currentBoard._id,
      updates
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const moveTask = useCallback((taskId: string, moveData: MoveTaskForm) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('task:move', {
      taskId,
      boardId: currentBoard._id,
      sourceColumnId: moveData.columnId, // This would be the current column
      targetColumnId: moveData.columnId,
      targetPosition: moveData.position
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const deleteTask = useCallback((taskId: string) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('task:delete', {
      taskId,
      boardId: currentBoard._id
    });
  }, [socketConnected, currentBoard?._id, emit]);

  // Column operations
  const createColumn = useCallback((columnData: Partial<Column>) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('column:create', {
      boardId: currentBoard._id,
      columnData
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const updateColumn = useCallback((columnId: string, updates: Partial<Column>) => {
    if (!socketConnected) return;
    
    emit('column:update', {
      columnId,
      updates
    });
  }, [socketConnected, emit]);

  const deleteColumn = useCallback((columnId: string) => {
    if (!socketConnected) return;
    
    emit('column:delete', { columnId });
  }, [socketConnected, emit]);

  const reorderColumns = useCallback((columnOrder: Array<{ columnId: string; position: number }>) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('columns:reorder', {
      boardId: currentBoard._id,
      columnOrder
    });
  }, [socketConnected, currentBoard?._id, emit]);

  // Board operations
  const updateBoardSettings = useCallback((settings: any) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('board:settings-update', {
      boardId: currentBoard._id,
      settings
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const trackBoardView = useCallback(() => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('board:view', { boardId: currentBoard._id });
  }, [socketConnected, currentBoard?._id, emit]);

  // User presence
  const updatePresence = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('presence:update', {
      boardId: currentBoard._id,
      status
    });
  }, [socketConnected, currentBoard?._id, emit]);

  // Typing indicators
  const startTyping = useCallback((taskId?: string) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('typing:start', {
      boardId: currentBoard._id,
      taskId
    });
  }, [socketConnected, currentBoard?._id, emit]);

  const stopTyping = useCallback((taskId?: string) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('typing:stop', {
      boardId: currentBoard._id,
      taskId
    });
  }, [socketConnected, currentBoard?._id, emit]);

  // Comments
  const addComment = useCallback((taskId: string, content: string, mentions: string[] = []) => {
    if (!socketConnected) return;
    
    emit('comment:add', {
      taskId,
      content,
      mentions
    });
  }, [socketConnected, emit]);

  // Bulk operations
  const performBulkOperation = useCallback((operation: string, targets: string[], options: any) => {
    if (!socketConnected || !currentBoard?._id) return;
    
    emit('board:bulk-operation', {
      boardId: currentBoard._id,
      operation,
      targets,
      options
    });
  }, [socketConnected, currentBoard?._id, emit]);

  return {
    // Connection status
    isConnected,
    socketConnected,
    
    // Task operations
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    
    // Column operations
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    
    // Board operations
    updateBoardSettings,
    trackBoardView,
    
    // User presence
    updatePresence,
    
    // Typing indicators
    startTyping,
    stopTyping,
    
    // Comments
    addComment,
    
    // Bulk operations
    performBulkOperation,
    
    // Socket instance (for advanced usage)
    socket
  };
};
