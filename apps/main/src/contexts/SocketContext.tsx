import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../hooks/socket/useSocket';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { env } from '../config/env';
import { 
  updateColumnRealTime,
  addColumnRealTime,
  removeColumnRealTime,
  updateColumnPositionsRealTime,
  addTaskRealTime
} from '../store/slices/taskSlice';
import { 
  updateColumnRealTime as updateColumnRealTimeColumnSlice,
  addColumnRealTime as addColumnRealTimeColumnSlice,
  removeColumnRealTime as removeColumnRealTimeColumnSlice,
  updateColumnPositionsRealTime as updateColumnPositionsRealTimeColumnSlice
} from '../store/slices/columnSlice';
import {
  addBoardTagRealTime,
  updateBoardTagRealTime,
  removeBoardTagRealTime,
  updateBoardRealTime
} from '../store/slices/boardSlice';
import type { 
  SocketNamespace, 
  SocketContextType, 
  SocketProviderProps 
} from '../types/interfaces/socket';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const toast = useToast();
  const [isReady, setIsReady] = useState(false);
  const [namespaces, setNamespaces] = useState<Map<string, SocketNamespace>>(new Map());

  // Memoize auth object to prevent unnecessary re-renders
  const authConfig = useMemo(() => 
    token ? { token } : undefined, 
    [token]
  );

  // Create socket connections for each namespace - only when authenticated
  const boardSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: isAuthenticated && !authLoading,
    namespace: '/board',
    auth: authConfig,
  });

  const notificationSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: isAuthenticated && !authLoading,
    namespace: '/notifications',
    auth: authConfig,
  });

  // Temporarily disable system socket to fix authentication issues
  // const systemSocket = useSocket({
  //   url: env.SOCKET_URL,
  //   autoConnect: isAuthenticated && !authLoading,
  //   namespace: '/system',
  //   auth: authConfig,
  // });
  
  // Create a mock system socket object
  const systemSocket = {
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    connect: () => {},
    disconnect: () => {},
    on: () => {},
    off: () => {},
    emit: () => {}
  };

  const chatSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: isAuthenticated && !authLoading,
    namespace: '/chat',
    auth: authConfig,
  });

  const workspaceSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: isAuthenticated && !authLoading,
    namespace: '/workspace',
    auth: authConfig,
  });

  // Debug workspace socket connection
  useEffect(() => {
    console.log('🔌 SocketContext: Workspace socket status', {
      isConnected: workspaceSocket.isConnected,
      isConnecting: workspaceSocket.isConnecting,
      error: workspaceSocket.error,
      hasSocket: !!workspaceSocket.socket,
      socketId: workspaceSocket.socket?.id
    });
  }, [workspaceSocket.isConnected, workspaceSocket.isConnecting, workspaceSocket.error]);

  const aiSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: isAuthenticated && !authLoading,
    namespace: '/ai',
    auth: authConfig,
  });

  // Create namespace objects
  const createNamespaceObject = (name: string, socketHook: ReturnType<typeof useSocket>): SocketNamespace => {
    return {
      name,
      socket: socketHook.socket,
      rooms: new Map(),
      on: socketHook.on,
      off: socketHook.off,
      emit: socketHook.emit,
      join: (room: string) => {
        socketHook.emit('join_room', { room });
      },
      leave: (room: string) => {
        socketHook.emit('leave_room', { room });
      },
    };
  };

  // Update namespaces when sockets change
  useEffect(() => {
    const newNamespaces = new Map();
    
    if (boardSocket.socket) {
      newNamespaces.set('board', createNamespaceObject('board', boardSocket));
    }
    if (notificationSocket.socket) {
      newNamespaces.set('notifications', createNamespaceObject('notifications', notificationSocket));
    }
    if (systemSocket.socket) {
      newNamespaces.set('system', createNamespaceObject('system', systemSocket));
    }
    if (chatSocket.socket) {
      newNamespaces.set('chat', createNamespaceObject('chat', chatSocket));
    }
    // Always add workspace socket to namespaces, even if not connected yet
    newNamespaces.set('workspace', createNamespaceObject('workspace', workspaceSocket));
    if (aiSocket.socket) {
      newNamespaces.set('ai', createNamespaceObject('ai', aiSocket));
    }
    
    setNamespaces(newNamespaces);
  }, [boardSocket.socket, notificationSocket.socket, systemSocket.socket, chatSocket.socket, workspaceSocket.socket, aiSocket.socket]);

  // Connection management - prevent multiple connections
  useEffect(() => {
    if (isAuthenticated && !authLoading && token) {
      console.log('🔌 SocketContext: User authenticated, setting up socket connections...');
      setIsReady(true);
    } else if (!isAuthenticated) {
      console.log('🔌 SocketContext: User not authenticated, cleaning up socket connections...');
      setIsReady(false);
    }
  }, [isAuthenticated, authLoading, token]);

  // Auto-join notification room when notification socket connects
  useEffect(() => {
    if (notificationSocket.socket && notificationSocket.isConnected && user?.id) {
      console.log('🔌 Auto-joining notification room for user:', user.id);
      const roomName = `notifications:${user.id}`;
      notificationSocket.socket.emit('join_room', { room: roomName });
      console.log('🔌 Joined notification room:', roomName);
    }
  }, [notificationSocket.socket, notificationSocket.isConnected, user?.id]);

  // Set up real-time event listeners for column operations
  useEffect(() => {
    if (boardSocket.socket && boardSocket.isConnected) {
      // Listen for column reorder updates
      boardSocket.socket.on('columns:reordered', (data: { columnOrder: Array<{ columnId: string; position: number }> }) => {
        // Update column positions in both slices for real-time updates
        dispatch(updateColumnPositionsRealTime(data.columnOrder)); // taskSlice
        dispatch(updateColumnPositionsRealTimeColumnSlice(data.columnOrder)); // columnSlice
      });

      // Listen for column creation updates
      boardSocket.socket.on('column:created', (data: { boardId: string; column: any }) => {
        // Dispatch Redux action to add new column in both slices
        dispatch(addColumnRealTime(data.column)); // taskSlice
        dispatch(addColumnRealTimeColumnSlice(data.column)); // columnSlice
      });

      // Listen for column update updates
      boardSocket.socket.on('column:updated', (data: { boardId: string; column: any }) => {
        // Dispatch Redux action to update column in both slices
        dispatch(updateColumnRealTime(data.column)); // taskSlice
        dispatch(updateColumnRealTimeColumnSlice(data.column)); // columnSlice
      });

      // Listen for column deletion updates
      boardSocket.socket.on('column:deleted', (data: { boardId: string; columnId: string; columnName?: string; taskCount?: number }) => {
        // Dispatch Redux action to remove column in both slices
        dispatch(removeColumnRealTime(data.columnId)); // taskSlice
        dispatch(removeColumnRealTimeColumnSlice(data.columnId)); // columnSlice
        
        // Show success toast notification
        const message = data.taskCount && data.taskCount > 0 
          ? `Column "${data.columnName || 'Untitled'}" and ${data.taskCount} task(s) have been deleted successfully.`
          : `Column "${data.columnName || 'Untitled'}" has been deleted successfully.`;
          
        toast.success(
          message,
          'Column Deleted',
          { duration: 4000 }
        );
      });

      // Listen for board state updates (when joining a board)
      boardSocket.socket.on('board:state', (data: { board: any; columns: any[]; tasks: any[]; timestamp: Date }) => {
        // Update the current board with populated member data
        dispatch(updateBoardRealTime(data.board));
        
        // Update columns - only add if they don't already exist
        data.columns.forEach(column => {
          // Check if column already exists before adding
          dispatch({ type: 'columns/addColumnIfNotExists', payload: column });
        });
        
        // Update tasks - add them to their respective columns
        data.tasks.forEach(task => {
          const columnId = typeof task.column === 'string' ? task.column : task.column?._id;
          if (columnId) {
            dispatch({ type: 'columns/addTaskToColumn', payload: { columnId, task } });
          }
        });
      });

      // Listen for board tag creation updates
      boardSocket.socket.on('board:tag:created', (data: { boardId: string; tag: { name: string; color: string } }) => {
        // Add tag to board
        dispatch(addBoardTagRealTime({ 
          boardId: data.boardId, 
          tag: data.tag 
        }));
        
        // Show success toast notification
        toast.success(
          `Tag "${data.tag.name}" has been created successfully.`,
          'Tag Created',
          { duration: 3000 }
        );
      });

      // Listen for board tag update updates
      boardSocket.socket.on('board:tag:updated', (data: { boardId: string; oldTagName: string; tag: { name: string; color: string } }) => {
        // Update tag in board
        dispatch(updateBoardTagRealTime({ 
          boardId: data.boardId, 
          oldTagName: data.oldTagName,
          tag: data.tag 
        }));
        
        // Show success toast notification
        toast.success(
          `Tag "${data.oldTagName}" has been updated successfully.`,
          'Tag Updated',
          { duration: 3000 }
        );
      });

      // Listen for board tag deletion updates
      boardSocket.socket.on('board:tag:deleted', (data: { boardId: string; tagName: string }) => {
        // Remove tag from board
        dispatch(removeBoardTagRealTime({ 
          boardId: data.boardId, 
          tagName: data.tagName 
        }));
        
        // Show success toast notification
        toast.success(
          `Tag "${data.tagName}" has been deleted successfully.`,
          'Tag Deleted',
          { duration: 3000 }
        );
      });

      // Cleanup function
      return () => {
        boardSocket.socket?.off('board:state');
        boardSocket.socket?.off('columns:reordered');
        boardSocket.socket?.off('column:created');
        boardSocket.socket?.off('column:updated');
        boardSocket.socket?.off('column:deleted');
        boardSocket.socket?.off('board:tag:created');
        boardSocket.socket?.off('board:tag:updated');
        boardSocket.socket?.off('board:tag:deleted');
      };
    }
  }, [boardSocket.socket, boardSocket.isConnected, dispatch, toast]);

  // Set up real-time event listeners for task operations
  useEffect(() => {
    if (boardSocket.socket && boardSocket.isConnected) {
      // Listen for task creation updates
      boardSocket.socket.on('task:created', (data: { task: any; createdBy: any; timestamp: Date }) => {
        // Add task to the appropriate column
        const columnId = typeof data.task.column === 'string' ? data.task.column : data.task.column?._id;
        console.log('🎯 task:created received:', { 
          taskId: data.task._id, 
          taskTitle: data.task.title,
          columnId, 
          columnType: typeof data.task.column,
          columnValue: data.task.column 
        });
        if (columnId) {
          dispatch({ type: 'columns/addTaskToColumn', payload: { columnId, task: data.task } });
        } else {
          console.error('❌ No column ID found for task:', data.task);
        }
      });

      // Listen for task update updates
      boardSocket.socket.on('task:updated', (data: { task: any; updatedBy: any; timestamp: Date }) => {
        // Update task in the appropriate column
        const columnId = typeof data.task.column === 'string' ? data.task.column : data.task.column?._id;
        if (columnId) {
          dispatch({ type: 'columns/updateTaskInColumn', payload: { columnId, taskId: data.task._id, taskData: data.task } });
        }
      });

      // Listen for task deletion updates
      boardSocket.socket.on('task:deleted', (data: { taskId: string; columnId: string; deletedBy: any; timestamp: Date }) => {
        // Remove task from the appropriate column
        if (data.columnId) {
          dispatch({ type: 'columns/removeTaskFromColumn', payload: { columnId: data.columnId, taskId: data.taskId } });
        }
      });

      // Listen for task movement updates
      boardSocket.socket.on('task:moved', (data: { taskId: string; sourceColumnId: string; targetColumnId: string; targetPosition: number; movedBy: any; timestamp: Date }) => {
        // Move task between columns
        dispatch({ type: 'columns/moveTaskBetweenColumns', payload: data });
      });

      // Cleanup function
      return () => {
        boardSocket.socket?.off('task:created');
        boardSocket.socket?.off('task:updated');
        boardSocket.socket?.off('task:deleted');
        boardSocket.socket?.off('task:moved');
      };
    }
  }, [boardSocket.socket, boardSocket.isConnected, dispatch]);

  // Determine if we're ready to attempt socket connections
  const isReadyToConnect = !authLoading && isAuthenticated && !!token;

  // Update socket connections when authentication state changes
  useEffect(() => {
    if (isReadyToConnect) {
      setIsReady(true);
      
      // Connect to all namespaces
      try {
        boardSocket.connect();
      } catch (error) {
        // Handle connection error silently
      }
      
      notificationSocket.connect();
      chatSocket.connect();
      workspaceSocket.connect();
      
      // Only connect AI socket if user is authenticated and has valid token
      if (token && isAuthenticated && !aiSocket.error && typeof token === 'string' && token.length > 0) {
        try {
          aiSocket.connect();
        } catch (error) {
          console.warn('Failed to connect AI socket:', error);
        }
      }
      
      // Only connect to system socket if user has admin privileges
      if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
        try {
          systemSocket.connect();
        } catch (error) {
          console.warn('Failed to connect system socket:', error);
        }
      }
    } else if (!authLoading && (!isAuthenticated || !token)) {
      setIsReady(false);
      
      // Disconnect all namespaces
      boardSocket.disconnect();
      notificationSocket.disconnect();
      systemSocket.disconnect();
      chatSocket.disconnect();
      workspaceSocket.disconnect();
      aiSocket.disconnect();
    }
  }, [isAuthenticated, token, authLoading, isReadyToConnect, user?.roles?.global, user?.roles?.permissions]);

  // AI socket connection is now handled in the main useEffect above

  // Retry AI socket connection on authentication errors (with limit)
  const [aiRetryCount, setAiRetryCount] = useState(0);
  const maxAiRetries = 3;
  
  useEffect(() => {
    if (aiSocket.error && aiSocket.error.includes('Authentication failed') && aiRetryCount < maxAiRetries) {
      console.log(`🔄 AI socket auth error detected, retrying in 2 seconds... (${aiRetryCount + 1}/${maxAiRetries})`);
      const retryTimeout = setTimeout(() => {
        if (token && isAuthenticated && typeof token === 'string' && token.length > 0) {
          console.log('🔄 Retrying AI socket connection...');
          setAiRetryCount(prev => prev + 1);
          aiSocket.connect();
        }
      }, 2000);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [aiSocket.error, token, isAuthenticated, aiRetryCount, maxAiRetries]); // Removed aiSocket from dependencies

  // Reset retry count when AI socket connects successfully
  useEffect(() => {
    if (aiSocket.isConnected) {
      setAiRetryCount(0);
    }
  }, [aiSocket.isConnected]);

  // Force AI socket reconnection when auth changes
  useEffect(() => {
    if (token && isAuthenticated && aiSocket.isConnected) {
      // Disconnect and reconnect to ensure fresh auth
      console.log('🔄 Reconnecting AI socket with fresh auth...');
      aiSocket.disconnect();
      setTimeout(() => {
        if (typeof token === 'string' && token.length > 0) {
          console.log('🔌 Reconnecting AI socket...');
          aiSocket.connect();
        }
      }, 500); // Increased delay to ensure proper cleanup
    }
  }, [token, isAuthenticated]); // Removed aiSocket from dependencies to prevent infinite loop

  // Global connection status
  const isAnyConnected = boardSocket.isConnected || notificationSocket.isConnected || 
                        systemSocket.isConnected || chatSocket.isConnected || workspaceSocket.isConnected || aiSocket.isConnected;

  // Debug AI socket status (always show for debugging)
  console.log('🔌 AI Socket Debug:', {
    isConnected: aiSocket.isConnected,
    isConnecting: aiSocket.isConnecting,
    error: aiSocket.error,
    hasAuth: !!authConfig,
    token: !!token,
    isAuthenticated,
    retryCount: aiRetryCount,
    hasSocket: !!aiSocket.socket,
    socketId: aiSocket.socket?.id
  });

  // Debug notification socket status
  console.log('🔌 Notification Socket Debug:', {
    isConnected: notificationSocket.isConnected,
    isConnecting: notificationSocket.isConnecting,
    error: notificationSocket.error,
    hasSocket: !!notificationSocket.socket,
    socketId: notificationSocket.socket?.id,
    isAuthenticated,
    hasToken: !!token
  });
  
  const isAnyConnecting = boardSocket.isConnecting || notificationSocket.isConnecting || 
                         systemSocket.isConnecting || chatSocket.isConnecting || workspaceSocket.isConnecting || aiSocket.isConnecting;
  
  const hasErrors = !!(boardSocket.error || notificationSocket.error || 
                      systemSocket.error || chatSocket.error || workspaceSocket.error || aiSocket.error);

  // Connection methods
  const connect = () => {
    if (isReadyToConnect) {
      
      try {
        boardSocket.connect();
        notificationSocket.connect();
        chatSocket.connect();
        workspaceSocket.connect();
        
        // Only connect AI socket if user is authenticated and has valid token
        if (token && isAuthenticated && !aiSocket.error && typeof token === 'string' && token.length > 0) {
          try {
            aiSocket.connect();
          } catch (error) {
            console.warn('Failed to connect AI socket:', error);
          }
        }
        
        if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
          systemSocket.connect();
        }
      } catch (error) {
      }
    }
  };

  const disconnect = () => {
    boardSocket.disconnect();
    notificationSocket.disconnect();
    systemSocket.disconnect();
    chatSocket.disconnect();
    workspaceSocket.disconnect();
    aiSocket.disconnect();
  };

  const reconnect = () => {
    disconnect();
    setTimeout(connect, 1000);
  };

  // Event handling methods
  const on = (event: string, callback: (data?: any) => void) => { // eslint-disable-line no-unused-vars
    // Default to board socket for events
    boardSocket.on(event, callback);
  };

  const off = (event: string) => {
    boardSocket.off(event);
  };

  const emit = (event: string, data?: any) => {
    boardSocket.emit(event, data);
  };

  // Room management methods
  const joinRoom = (room: string, namespace?: string) => {
    const targetNamespace = namespace ? namespaces.get(namespace) : namespaces.get('board');
    if (targetNamespace) {
      targetNamespace.join(room);
    }
  };

  const leaveRoom = (room: string, namespace?: string) => {
    const targetNamespace = namespace ? namespaces.get(namespace) : namespaces.get('board');
    if (targetNamespace) {
      targetNamespace.leave(room);
    }
  };

  // Board-specific room management
  const joinBoardRoom = (boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('board:join', { boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('board:join', { boardId });
    } else {
    }
  };

  const leaveBoardRoom = (boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('board:leave', { boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('board:leave', { boardId });
    } else {
    }
  };

  // Socket-based task operations
  const createTask = (boardId: string, taskData: any) => {
    const boardNamespace = namespaces.get('board');
    
    // Ensure we're in the board room before creating task
    joinBoardRoom(boardId);
    
    if (boardNamespace) {
      boardNamespace.emit('task:create', { boardId, taskData });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('task:create', { boardId, taskData });
    }
  };

  const updateTask = (taskId: string, taskData: any, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('task:update', { taskId, updates: taskData, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('task:update', { taskId, updates: taskData, boardId });
    }
  };

  const deleteTask = (taskId: string, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('task:delete', { taskId, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('task:delete', { taskId, boardId });
    }
  };

  const moveTask = (taskId: string, sourceColumnId: string, targetColumnId: string, targetPosition: number, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('task:move', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('task:move', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
    }
  };

  // Socket-based column operations
  const createColumn = (boardId: string, columnData: { name: string; position: number; settings?: any }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('column:create', { boardId, columnData });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('column:create', { boardId, columnData });
    }
  };

  const updateColumn = (columnId: string, columnData: { name: string; color?: string; settings?: any }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('column:update', { columnId, updates: columnData });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('column:update', { columnId, updates: columnData });
    }
  };

  const deleteColumn = (columnId: string, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('column:delete', { columnId });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('column:delete', { columnId });
    }
  };

  const reorderColumns = (boardId: string, columnIds: string[]) => {
    const boardNamespace = namespaces.get('board');
    
    if (boardNamespace) {
      // Convert columnIds to the format expected by backend
      const columnOrder = columnIds.map((columnId, index) => ({ columnId, position: index }));
      boardNamespace.emit('columns:reorder', { boardId, columnOrder });
    } else if (boardSocket && boardSocket.isConnected) {
      // Fallback to direct socket if namespace isn't available
      const columnOrder = columnIds.map((columnId, index) => ({ columnId, position: index }));
      boardSocket.emit('columns:reorder', { boardId, columnOrder });
    }
  };

  // Board tag operations
  const createBoardTag = (boardId: string, tag: { name: string; color: string }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('board:tag:create', { boardId, tag });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('board:tag:create', { boardId, tag });
    }
  };

  const updateBoardTag = (boardId: string, tagName: string, updates: { name?: string; color?: string }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('board:tag:update', { boardId, tagName, updates });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('board:tag:update', { boardId, tagName, updates });
    }
  };

  const deleteBoardTag = (boardId: string, tagName: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      boardNamespace.emit('board:tag:delete', { boardId, tagName });
    } else if (boardSocket && boardSocket.isConnected) {
      boardSocket.emit('board:tag:delete', { boardId, tagName });
    }
  };

  // Namespace management methods
  const getNamespace = (name: string): SocketNamespace | null => {
    return namespaces.get(name) || null;
  };

  const createNamespace = (name: string): SocketNamespace => {
    // Note: This function cannot use hooks due to React rules
    // For now, return a placeholder namespace
    // In a real implementation, you would need to manage this differently
    const placeholderNamespace: SocketNamespace = {
      name,
      socket: null,
      rooms: new Map(),
      on: () => {},
      off: () => {},
      emit: () => {},
      join: () => {},
      leave: () => {},
    };
    
    return placeholderNamespace;
  };

  // Utility methods
  const isConnectedTo = (namespace: string): boolean => {
    const targetNamespace = namespaces.get(namespace);
    return targetNamespace?.socket?.connected || false;
  };

  const getConnectionStatus = (namespace: string): 'connected' | 'connecting' | 'disconnected' | 'error' => {
    const targetNamespace = namespaces.get(namespace);
    if (!targetNamespace || !targetNamespace.socket) return 'disconnected';
    
    if (targetNamespace.socket.connected) return 'connected';
    return 'connecting';
  };

  // Log connection status changes
  useEffect(() => {
    if (isAnyConnected) {
      // Connection established
    } else if (isAnyConnecting) {
      // Connection in progress
    } else if (hasErrors) {
      // Connection errors
    }
  }, [isAnyConnected, isAnyConnecting, hasErrors]);

  const value: SocketContextType = {
    // Main socket connections
    mainSocket: boardSocket.socket,
    boardSocket: boardSocket.socket,
    chatSocket: chatSocket.socket,
    notificationSocket: notificationSocket.socket,
    systemSocket: systemSocket.socket,
    workspaceSocket: workspaceSocket,
    aiSocket: aiSocket.socket,
    
    // Connection status
    isConnected: isAnyConnected,
    isConnecting: isAnyConnecting,
    connectionError: hasErrors ? 'One or more socket connections have errors' : null,
    isNotificationConnected: notificationSocket.isConnected,
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Event handling
    on,
    off,
    emit,
    
    // Room management
    joinRoom,
    leaveRoom,
    joinBoardRoom,
    leaveBoardRoom,
    
    // Socket-based task operations
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    
    // Socket-based column operations
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    
    // Socket-based board tag operations
    createBoardTag,
    updateBoardTag,
    deleteBoardTag,
    
    // Namespace management
    getNamespace,
    createNamespace,
    
    // Utility methods
    isConnectedTo,
    getConnectionStatus,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

// Hook for components that need board socket functionality
export function useBoardSocket() {
  const context = useSocketContext();
  return context.boardSocket;
}

// Hook for components that need notification socket functionality
export function useNotificationSocket() {
  const context = useSocketContext();
  return context.notificationSocket;
}

// Hook for components that need system socket functionality (admin only)
export function useSystemSocket() {
  const context = useSocketContext();
  return context.systemSocket;
}

// Hook for components that need chat socket functionality
export function useChatSocket() {
  const context = useSocketContext();
  return context.chatSocket;
}

// Hook for components that need workspace socket functionality
export function useWorkspaceSocket() {
  const context = useSocketContext();
  return context.workspaceSocket;
}

// Hook for components that need AI socket functionality
export function useAISocket() {
  const context = useSocketContext();
  return context.aiSocket;
}

// Hook for components that need any socket connection
export function useSocketConnection() {
  const context = useSocketContext();
  
  return {
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    connectionError: context.connectionError,
    reconnect: context.reconnect,
    disconnect: context.disconnect,
  };
}
