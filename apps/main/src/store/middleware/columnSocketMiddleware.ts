import type { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { 
  updateColumnRealTime, 
  addColumnRealTime, 
  removeColumnRealTime,
  setSocketConnected 
} from '../slices/columnSlice';
import { logoutUser } from '../slices/authSlice';
import type { RootState } from "../../store"

export const columnSocketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let prevToken: string | null | undefined;
  let isConnecting = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = (token: string) => {
    // Don't reconnect if already connected or connecting
    if (socket?.connected || isConnecting) return;
    if (!token) return;

    isConnecting = true;
    
    if (env.ENABLE_DEBUG) {
      console.log('🔌 [columnSocketMiddleware] connecting to socket', env.SOCKET_URL);
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    // Connect to board namespace for column events
    socket = io(`${env.SOCKET_URL}/board`, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socket.on('connect', () => {
      isConnecting = false;
      reconnectAttempts = 0;
      console.log('🔌 [columnSocketMiddleware] socket connected', { id: socket?.id });
      store.dispatch(setSocketConnected(true));
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [columnSocketMiddleware] connect_error', err?.message || err);
    });

    socket.on('error', (err) => {
      console.error('❗ [columnSocketMiddleware] socket error', err);
    });

    // Column created event
    socket.on('column:created', ({ column, boardId }) => {
      try {
        console.log('📝 [columnSocketMiddleware] column:created', {
          id: column?._id,
          name: column?.name,
          boardId
        });

        if (column) {
          store.dispatch(addColumnRealTime(column));
        }
      } catch (e) {
        console.warn('⚠️ [columnSocketMiddleware] failed to process column:created', e);
      }
    });

    // Column updated event
    socket.on('column:updated', ({ column, boardId }) => {
      try {
        console.log('📝 [columnSocketMiddleware] column:updated', {
          id: column?._id,
          name: column?.name,
          boardId
        });

        if (column) {
          store.dispatch(updateColumnRealTime(column));
        }
      } catch (e) {
        console.warn('⚠️ [columnSocketMiddleware] failed to process column:updated', e);
      }
    });

    // Column deleted event
    socket.on('column:deleted', ({ columnId, boardId }) => {
      try {
        console.log('🗑️ [columnSocketMiddleware] column:deleted', { columnId, boardId });

        if (columnId) {
          store.dispatch(removeColumnRealTime(columnId));
        }
      } catch (e) {
        console.warn('⚠️ [columnSocketMiddleware] failed to process column:deleted', e);
      }
    });

    // Columns reordered event
    socket.on('columns:reordered', ({ boardId, columnOrder }) => {
      try {
        console.log('🔄 [columnSocketMiddleware] columns:reordered', { boardId, columnOrder });

        // Update column positions in real-time
        const state = store.getState() as RootState;
        const currentColumns = state.columns.columns;
        
        if (columnOrder && Array.isArray(columnOrder)) {
          // Update positions based on the new order
          const updatedColumns = currentColumns.map(column => {
            const newPosition = columnOrder.indexOf(column._id);
            if (newPosition !== -1) {
              return { ...column, position: newPosition };
            }
            return column;
          });

          // Dispatch updates for each column that changed position
          updatedColumns.forEach(column => {
            const originalColumn = currentColumns.find(c => c._id === column._id);
            if (originalColumn && originalColumn.position !== column.position) {
              store.dispatch(updateColumnRealTime(column));
            }
          });
        }
      } catch (e) {
        console.warn('⚠️ [columnSocketMiddleware] failed to process columns:reordered', e);
      }
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ [columnSocketMiddleware] socket disconnected', { reason });
      isConnecting = false;
      store.dispatch(setSocketConnected(false));
      
      // Only try to reconnect if we didn't explicitly disconnect
      if (reason !== 'io client disconnect' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
        console.log(`⏳ [columnSocketMiddleware] will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connect(token), delay);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [columnSocketMiddleware] connection error:', error.message);
      isConnecting = false;
      store.dispatch(setSocketConnected(false));
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`⏳ [columnSocketMiddleware] will retry connection in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connect(token), delay);
      } else {
        console.error('❌ [columnSocketMiddleware] max reconnection attempts reached');
      }
    });
  };

  const disconnect = () => {
    if (socket) {
      console.log('🧹 [columnSocketMiddleware] disconnecting socket');
      socket.off(); // Remove all listeners
      // Safe disconnect depending on state
      if (socket.connected) {
        socket.disconnect();
      } else {
        socket.close();
      }
      socket = null;
      isConnecting = false;
      reconnectAttempts = 0;
      store.dispatch(setSocketConnected(false));
    }
  };

  return (next) => (action) => {
    // Let the action update the state first
    const result = next(action);

    const state = store.getState() as RootState;
    const currentToken = state.auth.token;

    // Handle logout action
    if (action.type === logoutUser.fulfilled.type) {
      disconnect();
      return result;
    }

    // Handle token changes
    const tokenChanged = prevToken !== currentToken;
    if (tokenChanged) {
      if (currentToken) {
        connect(currentToken);
      } else {
        // Token missing -> disconnect
        disconnect();
      }
      prevToken = currentToken;
    }

    return result;
  };
};
