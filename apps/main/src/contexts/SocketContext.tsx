import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../hooks/socket/useSocket';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/env';
import { 
  updateColumnRealTime,
  addColumnRealTime,
  removeColumnRealTime,
  updateColumnPositionsRealTime
} from '../store/slices/taskSlice';
import { 
  updateColumnRealTime as updateColumnRealTimeColumnSlice,
  addColumnRealTime as addColumnRealTimeColumnSlice,
  removeColumnRealTime as removeColumnRealTimeColumnSlice,
  updateColumnPositionsRealTime as updateColumnPositionsRealTimeColumnSlice
} from '../store/slices/columnSlice';
import type { 
  SocketNamespace, 
  SocketContextType, 
  SocketProviderProps 
} from '../types/interfaces/socket';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const [namespaces, setNamespaces] = useState<Map<string, SocketNamespace>>(new Map());

  // Memoize auth object to prevent unnecessary re-renders
  const authConfig = useMemo(() => 
    token ? { token } : undefined, 
    [token]
  );

  // Create socket connections for each namespace
  const boardSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/board',
    auth: authConfig,
  });

  // Test socket connection without namespace for debugging

  const notificationSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/notifications',
    auth: authConfig,
  });

  const systemSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/system',
    auth: authConfig,
  });

  const chatSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/chat',
    auth: authConfig,
  });

  const workspaceSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/workspace',
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
    
    console.log('🔄 Updating namespaces:', {
      boardSocket: !!boardSocket.socket,
      boardSocketConnected: boardSocket.socket?.connected,
      notificationSocket: !!notificationSocket.socket,
      systemSocket: !!systemSocket.socket,
      chatSocket: !!chatSocket.socket,
      workspaceSocket: !!workspaceSocket.socket
    });
    
    if (boardSocket.socket) {
      newNamespaces.set('board', createNamespaceObject('board', boardSocket));
      console.log('✅ Board namespace created');
    } else {
      console.log('❌ Board socket not available for namespace creation');
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
    if (workspaceSocket.socket) {
      newNamespaces.set('workspace', createNamespaceObject('workspace', workspaceSocket));
    }
    
    console.log('📋 Final namespaces:', Array.from(newNamespaces.keys()));
    setNamespaces(newNamespaces);
  }, [boardSocket.socket, notificationSocket.socket, systemSocket.socket, chatSocket.socket, workspaceSocket.socket]);

  // Set up real-time event listeners for column operations
  useEffect(() => {
    if (boardSocket.socket && boardSocket.isConnected) {
      console.log('🎧 Setting up real-time column event listeners');

      // Listen for column reorder updates
      boardSocket.socket.on('columns:reordered', (data: { columnOrder: Array<{ columnId: string; position: number }> }) => {
        console.log('📡 Received columns:reordered event:', data);
        // Update column positions in both slices for real-time updates
        dispatch(updateColumnPositionsRealTime(data.columnOrder)); // taskSlice
        dispatch(updateColumnPositionsRealTimeColumnSlice(data.columnOrder)); // columnSlice
      });

      // Listen for column creation updates
      boardSocket.socket.on('column:created', (data: { boardId: string; column: any }) => {
        console.log('📡 Received column:created event:', data);
        // Dispatch Redux action to add new column in both slices
        dispatch(addColumnRealTime(data.column)); // taskSlice
        dispatch(addColumnRealTimeColumnSlice(data.column)); // columnSlice
      });

      // Listen for column update updates
      boardSocket.socket.on('column:updated', (data: { boardId: string; column: any }) => {
        console.log('📡 Received column:updated event:', data);
        // Dispatch Redux action to update column in both slices
        dispatch(updateColumnRealTime(data.column)); // taskSlice
        dispatch(updateColumnRealTimeColumnSlice(data.column)); // columnSlice
      });

      // Listen for column deletion updates
      boardSocket.socket.on('column:deleted', (data: { boardId: string; columnId: string }) => {
        console.log('📡 Received column:deleted event:', data);
        // Dispatch Redux action to remove column in both slices
        dispatch(removeColumnRealTime(data.columnId)); // taskSlice
        dispatch(removeColumnRealTimeColumnSlice(data.columnId)); // columnSlice
      });

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up column event listeners');
        boardSocket.socket?.off('columns:reordered');
        boardSocket.socket?.off('column:created');
        boardSocket.socket?.off('column:updated');
        boardSocket.socket?.off('column:deleted');
      };
    }
  }, [boardSocket.socket, boardSocket.isConnected]);

  // Set up real-time event listeners for task operations
  useEffect(() => {
    if (boardSocket.socket && boardSocket.isConnected) {
      console.log('🎧 Setting up real-time task event listeners');

      // Listen for task creation updates
      boardSocket.socket.on('task:created', (data: { task: any; createdBy: any; timestamp: Date }) => {
        console.log('📡 Received task:created event:', data);
        console.log('📡 Task data:', data.task);
        // Add task to the appropriate column
        const columnId = typeof data.task.column === 'string' ? data.task.column : data.task.column?._id;
        console.log('📡 Extracted columnId:', columnId);
        console.log('📡 Task column field:', data.task.column);
        if (columnId) {
          console.log('📡 Dispatching addTaskToColumn with:', { columnId, taskId: data.task._id });
          dispatch({ type: 'columns/addTaskToColumn', payload: { columnId, task: data.task } });
        } else {
          console.error('❌ No columnId found for task:', data.task);
        }
      });

      // Listen for task update updates
      boardSocket.socket.on('task:updated', (data: { task: any; updatedBy: any; timestamp: Date }) => {
        console.log('📡 Received task:updated event:', data);
        // Update task in the appropriate column
        const columnId = typeof data.task.column === 'string' ? data.task.column : data.task.column?._id;
        if (columnId) {
          dispatch({ type: 'columns/updateTaskInColumn', payload: { columnId, taskId: data.task._id, taskData: data.task } });
        }
      });

      // Listen for task deletion updates
      boardSocket.socket.on('task:deleted', (data: { taskId: string; columnId: string; deletedBy: any; timestamp: Date }) => {
        console.log('📡 Received task:deleted event:', data);
        // Remove task from the appropriate column
        if (data.columnId) {
          dispatch({ type: 'columns/removeTaskFromColumn', payload: { columnId: data.columnId, taskId: data.taskId } });
        }
      });

      // Listen for task movement updates
      boardSocket.socket.on('task:moved', (data: { taskId: string; sourceColumnId: string; targetColumnId: string; targetPosition: number; movedBy: any; timestamp: Date }) => {
        console.log('📡 Received task:moved event:', data);
        // Move task between columns
        dispatch({ type: 'columns/moveTaskBetweenColumns', payload: data });
      });

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up task event listeners');
        boardSocket.socket?.off('task:created');
        boardSocket.socket?.off('task:updated');
        boardSocket.socket?.off('task:deleted');
        boardSocket.socket?.off('task:moved');
      };
    }
  }, [boardSocket.socket, boardSocket.isConnected]);

  // Determine if we're ready to attempt socket connections
  const isReadyToConnect = !authLoading && isAuthenticated && !!token;

  // Update socket connections when authentication state changes
  useEffect(() => {
    console.log('🔄 Socket connection effect triggered:', {
      isReadyToConnect,
      isAuthenticated,
      hasToken: !!token,
      authLoading,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (isReadyToConnect) {
      console.log('✅ Setting up authenticated socket connections for all namespaces');
      console.log('🔍 Connection details:', {
        isAuthenticated,
        hasToken: !!token,
        authLoading,
        userRoles: user?.roles?.global,
        userPermissions: user?.roles?.permissions,
        socketUrl: env.SOCKET_URL
      });
      setIsReady(true);
      


      // Connect to all namespaces
      console.log('🔌 Connecting to board socket...');
      try {
        boardSocket.connect();
        console.log('📡 Board socket connect() called');
      } catch (error) {
        console.error('❌ Error connecting board socket:', error);
      }
      
      notificationSocket.connect();
      chatSocket.connect();
      workspaceSocket.connect();
      
      // Only connect to system socket if user has admin privileges
      if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
        systemSocket.connect();
      }
    } else if (!authLoading && (!isAuthenticated || !token)) {
      console.log('❌ Disconnecting all socket connections - no authentication');
      setIsReady(false);
      
      // Disconnect all namespaces
      boardSocket.disconnect();
      notificationSocket.disconnect();
      systemSocket.disconnect();
      chatSocket.disconnect();
      workspaceSocket.disconnect();
    }
  }, [isAuthenticated, token, authLoading, isReadyToConnect, user?.roles?.global, user?.roles?.permissions]);

  // Global connection status
  const isAnyConnected = boardSocket.isConnected || notificationSocket.isConnected || 
                        systemSocket.isConnected || chatSocket.isConnected || workspaceSocket.isConnected;
  
  const isAnyConnecting = boardSocket.isConnecting || notificationSocket.isConnecting || 
                         systemSocket.isConnecting || chatSocket.isConnecting || workspaceSocket.isConnecting;
  
  const hasErrors = !!(boardSocket.error || notificationSocket.error || 
                      systemSocket.error || chatSocket.error || workspaceSocket.error);

  // Connection methods
  const connect = () => {
    if (isReadyToConnect) {
      console.log('🔄 Manual connection requested for all namespaces');
      
      try {
        boardSocket.connect();
        notificationSocket.connect();
        chatSocket.connect();
        workspaceSocket.connect();
        
        if (user?.roles?.global?.includes('admin') || user?.roles?.permissions?.includes('system:monitor')) {
          systemSocket.connect();
        }
      } catch (error) {
        console.error('Failed to connect to socket namespaces:', error);
      }
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting all socket namespaces');
    boardSocket.disconnect();
    notificationSocket.disconnect();
    systemSocket.disconnect();
    chatSocket.disconnect();
    workspaceSocket.disconnect();
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
      console.log(`🔗 Joining room: ${room} in namespace: ${targetNamespace.name}`);
      targetNamespace.join(room);
    }
  };

  const leaveRoom = (room: string, namespace?: string) => {
    const targetNamespace = namespace ? namespaces.get(namespace) : namespaces.get('board');
    if (targetNamespace) {
      console.log(`🔌 Leaving room: ${room} in namespace: ${targetNamespace.name}`);
      targetNamespace.leave(room);
    }
  };

  // Board-specific room management
  const joinBoardRoom = (boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Joining board room via socket namespace:', boardId);
      boardNamespace.emit('board:join', { boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Joining board room via direct socket (fallback):', boardId);
      boardSocket.emit('board:join', { boardId });
    } else {
      console.error('Board socket not available for joining room');
    }
  };

  const leaveBoardRoom = (boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Leaving board room via socket namespace:', boardId);
      boardNamespace.emit('board:leave', { boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Leaving board room via direct socket (fallback):', boardId);
      boardSocket.emit('board:leave', { boardId });
    } else {
      console.error('Board socket not available for leaving room');
    }
  };

  // Socket-based task operations
  const createTask = (boardId: string, taskData: any) => {
    const boardNamespace = namespaces.get('board');
    console.log('📤 Creating task - Debug info:', { 
      boardId, 
      taskData, 
      hasNamespace: !!boardNamespace,
      socketConnected: boardSocket?.isConnected,
      namespaces: Array.from(namespaces.keys())
    });
    
    // Ensure we're in the board room before creating task
    joinBoardRoom(boardId);
    
    if (boardNamespace) {
      console.log('📤 Creating task via socket namespace:', { boardId, taskData });
      boardNamespace.emit('task:create', { boardId, taskData });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Creating task via direct socket (fallback):', { boardId, taskData });
      boardSocket.emit('task:create', { boardId, taskData });
    } else {
      console.error('Board socket not available for task creation');
    }
  };

  const updateTask = (taskId: string, taskData: any, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Updating task via socket namespace:', { taskId, taskData, boardId });
      boardNamespace.emit('task:update', { taskId, updates: taskData, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Updating task via direct socket (fallback):', { taskId, taskData, boardId });
      boardSocket.emit('task:update', { taskId, updates: taskData, boardId });
    } else {
      console.error('Board socket not available for task update');
    }
  };

  const deleteTask = (taskId: string, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Deleting task via socket namespace:', { taskId, boardId });
      boardNamespace.emit('task:delete', { taskId, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Deleting task via direct socket (fallback):', { taskId, boardId });
      boardSocket.emit('task:delete', { taskId, boardId });
    } else {
      console.error('Board socket not available for task deletion');
    }
  };

  const moveTask = (taskId: string, sourceColumnId: string, targetColumnId: string, targetPosition: number, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Moving task via socket namespace:', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
      boardNamespace.emit('task:move', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Moving task via direct socket (fallback):', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
      boardSocket.emit('task:move', { taskId, sourceColumnId, targetColumnId, targetPosition, boardId });
    } else {
      console.error('Board socket not available for task movement');
    }
  };

  // Socket-based column operations
  const createColumn = (boardId: string, columnData: { name: string; position: number; settings?: any }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Creating column via socket namespace:', { boardId, columnData });
      boardNamespace.emit('column:create', { boardId, columnData });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Creating column via direct socket (fallback):', { boardId, columnData });
      boardSocket.emit('column:create', { boardId, columnData });
    } else {
      console.error('Board socket not available for column creation');
    }
  };

  const updateColumn = (columnId: string, columnData: { name: string; color?: string; settings?: any }) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Updating column via socket namespace:', { columnId, columnData });
      boardNamespace.emit('column:update', { columnId, updates: columnData });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Updating column via direct socket (fallback):', { columnId, columnData });
      boardSocket.emit('column:update', { columnId, updates: columnData });
    } else {
      console.error('Board socket not available for column update');
    }
  };

  const deleteColumn = (columnId: string, boardId: string) => {
    const boardNamespace = namespaces.get('board');
    if (boardNamespace) {
      console.log('📤 Deleting column via socket namespace:', { columnId, boardId });
      boardNamespace.emit('column:delete', { columnId });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Deleting column via direct socket (fallback):', { columnId, boardId });
      boardSocket.emit('column:delete', { columnId });
    } else {
      console.error('Board socket not available for column deletion');
    }
  };

  const reorderColumns = (boardId: string, columnIds: string[]) => {
    const boardNamespace = namespaces.get('board');
    console.log('🔍 Debug reorderColumns:', {
      boardNamespace,
      namespacesSize: namespaces.size,
      namespacesKeys: Array.from(namespaces.keys()),
      boardSocketConnected: boardSocket?.isConnected,
      isAnyConnected
    });
    
    if (boardNamespace) {
      console.log('📤 Reordering columns via socket namespace:', { boardId, columnIds });
      // Convert columnIds to the format expected by backend
      const columnOrder = columnIds.map((columnId, index) => ({ columnId, position: index }));
      boardNamespace.emit('columns:reorder', { boardId, columnOrder });
    } else if (boardSocket && boardSocket.isConnected) {
      console.log('📤 Reordering columns via direct socket (fallback):', { boardId, columnIds });
      // Fallback to direct socket if namespace isn't available
      const columnOrder = columnIds.map((columnId, index) => ({ columnId, position: index }));
      boardSocket.emit('columns:reorder', { boardId, columnOrder });
    } else {
      console.error('Board socket not available for column reordering');
      console.info('Available namespaces:', Array.from(namespaces.keys()));
      console.info('Board socket:', boardSocket);
      console.info('Is connected:', isAnyConnected);
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
      console.log('🔌 At least one socket namespace connected');
    } else if (isAnyConnecting) {
      console.log('🔄 Socket namespaces connecting...');
    } else if (hasErrors) {
      console.error('❌ Socket errors detected in one or more namespaces');
    }
  }, [isAnyConnected, isAnyConnecting, hasErrors]);

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Socket context debug info:', {
      isAuthenticated,
      hasToken: !!token,
      authLoading,
      isReadyToConnect,
      isAnyConnected,
      isAnyConnecting,
      hasErrors,
      isReady,
      userRoles: user?.roles?.global,
      userPermissions: user?.roles?.permissions
    });
  }, [isAuthenticated, token, authLoading, isReadyToConnect, isAnyConnected, isAnyConnecting, hasErrors, isReady, user?.roles?.global, user?.roles?.permissions]);

  const value: SocketContextType = {
    // Main socket connections
    mainSocket: boardSocket.socket,
    boardSocket: boardSocket.socket,
    chatSocket: chatSocket.socket,
    notificationSocket: notificationSocket.socket,
    systemSocket: systemSocket.socket,
    workspaceSocket: workspaceSocket.socket,
    
    // Connection status
    isConnected: isAnyConnected,
    isConnecting: isAnyConnecting,
    connectionError: hasErrors ? 'One or more socket connections have errors' : null,
    
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