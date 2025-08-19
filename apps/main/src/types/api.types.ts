export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  description?: string;
}

export interface SocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface SocketEvent {
  event: string;
  data: any;
  room?: string;
}
