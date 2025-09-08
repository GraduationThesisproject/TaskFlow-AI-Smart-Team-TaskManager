import type { ReactNode } from 'react';

// Socket-related interfaces used across the application

// Base socket interface
export interface Socket {
  id?: string;
  connected: boolean;
  disconnected: boolean;
  connect(): void;
  disconnect(): void;
  emit(event: string, data?: any): void;
  on(event: string, callback: (data?: any) => void): void;
  off(event: string, callback?: (data?: any) => void): void;
  once(event: string, callback: (data?: any) => void): void;
}

// Socket message interface
export interface SocketMessage {
  event: string;
  data: any;
  timestamp: string;
  sender?: string;
  room?: string;
}

// Socket event interface
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: string;
  source?: string;
}

// Socket room interface
export interface SocketRoom {
  name: string;
  members: string[];
  metadata?: Record<string, any>;
}

// Socket namespace interface
export interface SocketNamespace {
  name: string;
  socket: Socket;
  rooms: Map<string, SocketRoom>;
  on(event: string, callback: (data?: any) => void): void;
  off(event: string, callback?: (data?: any) => void): void;
  emit(event: string, data?: any): void;
  join(room: string): void;
  leave(room: string): void;
}

// Socket context interface
export interface SocketContextType {
  // Main socket connections
  mainSocket: Socket | null;
  boardSocket: Socket | null;
  chatSocket: Socket | null;
  notificationSocket: Socket | null;
  systemSocket: Socket | null;
  workspaceSocket: Socket | null;
  
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Connection methods
  connect(): void;
  disconnect(): void;
  reconnect(): void;
  
  // Event handling
  on(event: string, callback: (data?: any) => void): void;
  off(event: string, callback?: (data?: any) => void): void;
  emit(event: string, data?: any): void;
  
  // Room management
  joinRoom(room: string, namespace?: string): void;
  leaveRoom(room: string, namespace?: string): void;
  
  // Namespace management
  getNamespace(name: string): SocketNamespace | null;
  createNamespace(name: string): SocketNamespace;
  
  // Utility methods
  isConnectedTo(namespace: string): boolean;
  getConnectionStatus(namespace: string): 'connected' | 'connecting' | 'disconnected' | 'error';
  
  // Notification-specific methods
  markNotificationAsRead(notificationId: string): void;
  markAllNotificationsAsRead(): void;
  getUnreadCount(): void;
  getRecentNotifications(limit?: number): void;
}

// Socket provider props
export interface SocketProviderProps {
  children: ReactNode;
}

// Task-related socket events
export interface TaskSocketEvent {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_moved';
  data: {
    task: any;
    boardId?: string;
    spaceId?: string;
    workspaceId?: string;
  };
  timestamp: string;
}

export interface TaskCreatedEvent {
  task: any;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface TaskUpdatedEvent {
  task: any;
  boardId: string;
  spaceId: string;
  workspaceId: string;
  changes: Record<string, any>;
}

export interface TaskDeletedEvent {
  taskId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface TaskMovedEvent {
  task: any;
  sourceColumn: string;
  targetColumn: string;
  sourcePosition: number;
  targetPosition: number;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

// Column-related socket events
export interface ColumnSocketEvent {
  type: 'column_created' | 'column_updated' | 'column_deleted' | 'columns_reordered';
  data: {
    column?: any;
    columns?: any[];
    boardId: string;
    spaceId: string;
    workspaceId: string;
  };
  timestamp: string;
}

export interface ColumnCreatedEvent {
  column: any;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface ColumnUpdatedEvent {
  column: any;
  boardId: string;
  spaceId: string;
  workspaceId: string;
  changes: Record<string, any>;
}

export interface ColumnDeletedEvent {
  columnId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface ColumnsReorderedEvent {
  columns: any[];
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

// Board-related socket events
export interface BoardSocketEvent {
  type: 'board_created' | 'board_updated' | 'board_deleted' | 'board_archived';
  data: {
    board: any;
    spaceId: string;
    workspaceId: string;
  };
  timestamp: string;
}

export interface BoardCreatedEvent {
  board: any;
  spaceId: string;
  workspaceId: string;
}

export interface BoardUpdatedEvent {
  board: any;
  spaceId: string;
  workspaceId: string;
  changes: Record<string, any>;
}

export interface BoardDeletedEvent {
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface BoardArchivedEvent {
  board: any;
  spaceId: string;
  workspaceId: string;
  archived: boolean;
}

// Space-related socket events
export interface SpaceSocketEvent {
  type: 'space_created' | 'space_updated' | 'space_deleted' | 'space_archived';
  data: {
    space: any;
    workspaceId: string;
  };
  timestamp: string;
}

export interface SpaceCreatedEvent {
  space: any;
  workspaceId: string;
}

export interface SpaceUpdatedEvent {
  space: any;
  workspaceId: string;
  changes: Record<string, any>;
}

export interface SpaceDeletedEvent {
  spaceId: string;
  workspaceId: string;
}

export interface SpaceArchivedEvent {
  space: any;
  workspaceId: string;
  archived: boolean;
}

// Workspace-related socket events
export interface WorkspaceSocketEvent {
  type: 'workspace_created' | 'workspace_updated' | 'workspace_deleted' | 'member_added' | 'member_removed' | 'member_role_changed';
  data: {
    workspace?: any;
    member?: any;
    workspaceId: string;
  };
  timestamp: string;
}

export interface WorkspaceCreatedEvent {
  workspace: any;
}

export interface WorkspaceUpdatedEvent {
  workspace: any;
  changes: Record<string, any>;
}

export interface WorkspaceDeletedEvent {
  workspaceId: string;
}

export interface MemberAddedEvent {
  member: any;
  workspaceId: string;
}

export interface MemberRemovedEvent {
  memberId: string;
  workspaceId: string;
}

export interface MemberRoleChangedEvent {
  member: any;
  workspaceId: string;
  oldRole: string;
  newRole: string;
}

// Comment-related socket events
export interface CommentSocketEvent {
  type: 'comment_created' | 'comment_updated' | 'comment_deleted' | 'comment_reaction_added' | 'comment_reaction_removed';
  data: {
    comment: any;
    taskId: string;
    boardId: string;
    spaceId: string;
    workspaceId: string;
  };
  timestamp: string;
}

export interface CommentCreatedEvent {
  comment: any;
  taskId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface CommentUpdatedEvent {
  comment: any;
  taskId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
  changes: Record<string, any>;
}

export interface CommentDeletedEvent {
  commentId: string;
  taskId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

export interface CommentReactionEvent {
  commentId: string;
  reaction: any;
  taskId: string;
  boardId: string;
  spaceId: string;
  workspaceId: string;
}

// Notification-related socket events
export interface NotificationSocketEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'notification_read';
  data: {
    notification: any;
    userId: string;
  };
  timestamp: string;
}

export interface NotificationCreatedEvent {
  notification: any;
  userId: string;
}

export interface NotificationUpdatedEvent {
  notification: any;
  userId: string;
  changes: Record<string, any>;
}

export interface NotificationDeletedEvent {
  notificationId: string;
  userId: string;
}

export interface NotificationReadEvent {
  notificationId: string;
  userId: string;
  readAt: string;
}

// Chat-related socket events
export interface ChatSocketEvent {
  type: 'message_created' | 'message_updated' | 'message_deleted' | 'typing_started' | 'typing_stopped' | 'user_joined' | 'user_left';
  data: {
    message?: any;
    chatId: string;
    userId?: string;
    isTyping?: boolean;
  };
  timestamp: string;
}

export interface MessageCreatedEvent {
  message: any;
  chatId: string;
  userId: string;
}

export interface MessageUpdatedEvent {
  message: any;
  chatId: string;
  userId: string;
  changes: Record<string, any>;
}

export interface MessageDeletedEvent {
  messageId: string;
  chatId: string;
  userId: string;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface UserJoinedEvent {
  chatId: string;
  userId: string;
  user: any;
}

export interface UserLeftEvent {
  chatId: string;
  userId: string;
  user: any;
}

// System-related socket events
export interface SystemSocketEvent {
  type: 'system_status' | 'maintenance_mode' | 'backup_completed' | 'error_logged';
  data: {
    status?: string;
    maintenanceMode?: boolean;
    backup?: any;
    error?: any;
  };
  timestamp: string;
}

export interface SystemStatusEvent {
  status: string;
  uptime: number;
  version: string;
  lastBackup?: string;
}

export interface MaintenanceModeEvent {
  maintenanceMode: boolean;
  reason?: string;
  estimatedDuration?: string;
}

export interface BackupCompletedEvent {
  backup: any;
  status: 'success' | 'failed';
  message?: string;
}

export interface ErrorLoggedEvent {
  error: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

// User presence events
export interface UserPresenceEvent {
  type: 'user_online' | 'user_offline' | 'user_away' | 'user_busy';
  data: {
    userId: string;
    user: any;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen?: string;
  };
  timestamp: string;
}

// Room management events
export interface RoomEvent {
  type: 'room_joined' | 'room_left' | 'room_created' | 'room_deleted';
  data: {
    roomId: string;
    roomType: 'board' | 'space' | 'workspace' | 'chat';
    userId?: string;
    users?: any[];
  };
  timestamp: string;
}

// Socket connection events
export interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  data: {
    namespace: string;
    error?: string;
    reconnectAttempt?: number;
    maxReconnectAttempts?: number;
  };
  timestamp: string;
}

// Socket authentication events
export interface AuthEvent {
  type: 'authenticated' | 'authentication_failed' | 'token_expired' | 'token_refreshed';
  data: {
    namespace: string;
    userId?: string;
    error?: string;
    newToken?: string;
  };
  timestamp: string;
}

// Socket namespace configuration
export interface SocketNamespaceConfig {
  name: string;
  url: string;
  options: {
    auth: {
      token: string;
    };
    transports: string[];
    timeout: number;
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
  };
}

// Socket event handlers
export interface SocketEventHandler<T = any> {
  event: string;
  handler: (data: T) => void;
  namespace?: string;
}

// Socket connection status
export interface SocketConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  error: string | null;
  lastConnected: Date | null;
  lastDisconnected: Date | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Socket metrics
export interface SocketMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  connectionTime: number;
  reconnectionCount: number;
  errorCount: number;
  lastActivity: Date;
}
