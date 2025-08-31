// Enhanced API client with automatic token management
import { env } from '../config/env';
import tokenManager from './tokenManager';

// Type definition for RequestInit
interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData | URLSearchParams | ReadableStream;
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal;
}

class ApiClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseURL: string = env.API_BASE_URL || '/api') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Main request method with automatic token handling
    async request<T = any>(
        endpoint: string, 
        options: RequestInit & { 
            skipAuth?: boolean;
            retryOnUnauth?: boolean; // default disabled (no backend refresh endpoint)
            suppressErrorLog?: boolean;
        } = {}
    ): Promise<T> {
        const { skipAuth = false, retryOnUnauth = false, suppressErrorLog = false, ...requestOptions } = options;
        
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = { 
            ...this.defaultHeaders, 
            ...(requestOptions.headers as Record<string, string> || {})
        };

        // Add authentication token if not skipped
        if (!skipAuth) {
            const token = tokenManager.getAccessToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            ...requestOptions,
            headers,
            credentials: 'include', // Include cookies for refresh token
        };

        try {
            const response = await fetch(url, config);

            // Handle unauthorized - attempt token refresh
            if (response.status === 401 && !skipAuth && retryOnUnauth) {
                // Unauthorized - attempting token refresh
                const newToken = await tokenManager.refreshAccessToken();
                if (newToken) {
                    // Retry request with new token
                    headers.Authorization = `Bearer ${newToken}`;
                    const retryResponse = await fetch(url, { ...config, headers });
                    
                    if (retryResponse.ok) {
                        return this.parseResponse<T>(retryResponse);
                    } else {
                        throw new Error(`Request failed: ${retryResponse.status} ${retryResponse.statusText}`);
                    }
                } else {
                    // Refresh not supported or failed - propagate auth error
                    throw new Error('Authentication required');
                }
            }

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }

            return this.parseResponse<T>(response);
        } catch (error) {
            if (!suppressErrorLog) console.error('API request failed:', error);
            throw error;
        }
    }

    // Parse response based on content type
    private async parseResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('Content-Type');
        
        if (contentType?.includes('application/json')) {
            return response.json();
        } else if (contentType?.includes('text/')) {
            return response.text() as any;
        } else {
            return response.blob() as any;
        }
    }

    // Convenience methods
    get<T = any>(endpoint: string, options?: RequestInit & { skipAuth?: boolean; suppressErrorLog?: boolean }): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T = any>(endpoint: string, data?: any, options?: RequestInit & { skipAuth?: boolean; suppressErrorLog?: boolean }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T = any>(endpoint: string, data?: any, options?: RequestInit & { skipAuth?: boolean; suppressErrorLog?: boolean }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    patch<T = any>(endpoint: string, data?: any, options?: RequestInit & { skipAuth?: boolean; suppressErrorLog?: boolean }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T = any>(endpoint: string, options?: RequestInit & { skipAuth?: boolean; suppressErrorLog?: boolean }): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    // File upload with automatic token
    async upload<T = any>(
        endpoint: string, 
        formData: FormData, 
        options: RequestInit & { 
            onProgress?: (progress: number) => void;
            skipAuth?: boolean;
        } = {}
    ): Promise<T> {
        const { onProgress, skipAuth = false } = options;
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Add auth header
            if (!skipAuth) {
                const token = tokenManager.getAccessToken();
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            }

            // Progress tracking
            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        onProgress(progress);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch {
                        resolve(xhr.responseText as any);
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Upload failed'));
            
            xhr.open('POST', `${this.baseURL}${endpoint}`);
            xhr.send(formData);
        });
    }
}

export default new ApiClient(env.API_BASE_URL || '/api');
