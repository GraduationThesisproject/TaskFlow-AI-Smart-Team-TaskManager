# TaskFlow Admin Dashboard - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [TypeScript Types & Interfaces](#typescript-types--interfaces)
5. [Redux State Management](#redux-state-management)
6. [Data Flow](#data-flow)
7. [Testing Strategy](#testing-strategy)
8. [Best Practices](#best-practices)

## Overview

The TaskFlow Admin Dashboard is a comprehensive system monitoring and management interface built with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + TypeScript + Redux Toolkit
- **UI Components**: Custom component library (@taskflow/ui)
- **State Management**: Redux Toolkit with async thunks
- **Styling**: Tailwind CSS

## Backend Implementation

### 1. Database Models

The backend uses MongoDB with Mongoose models to store and retrieve data:

```javascript
// Example: Analytics Model (apps/backend/src/models/Analytics.js)
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  scopeType: { type: String, required: true }, // 'space', 'workspace', 'global'
  scopeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  kind: { type: String, required: true }, // 'custom', 'scheduled', 'realtime'
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  period: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  calculatedAt: { type: Date, default: Date.now },
  calculationTime: { type: Number, default: 0 }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
```

### 2. Controllers

Controllers handle HTTP requests and business logic:

```javascript
// apps/backend/src/controllers/analytics.controller.js
exports.getSpaceAnalytics = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;
    const userId = req.user.id;

    // 1. Authentication & Authorization
    const user = await User.findById(userId);
    const userRoles = await user.getRoles();
    
    if (!userRoles.hasSpaceRole(spaceId)) {
      return sendResponse(res, 403, false, 'Access denied to this space');
    }

    // 2. Business Logic
    const analyticsService = require('../services/analytics.service');
    const analytics = await analyticsService.generateSpaceAnalytics(spaceId, {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      periodType: period,
      includeAI: false
    });

    // 3. Response
    sendResponse(res, 200, true, 'Space analytics retrieved successfully', {
      analytics,
      period,
      count: 1
    });
  } catch (error) {
    logger.error('Get space analytics error:', error);
    sendResponse(res, 500, false, 'Server error retrieving space analytics');
  }
};
```

### 3. Services

Services contain business logic and data processing:

```javascript
// apps/backend/src/services/analytics.service.js
class AnalyticsService {
  async generateSpaceAnalytics(spaceId, options) {
    const { startDate, endDate, periodType, includeAI } = options;
    
    // 1. Fetch raw data
    const tasks = await Task.find({
      spaceId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const users = await User.find({ spaces: spaceId });
    
    // 2. Calculate metrics
    const taskMetrics = this.calculateTaskMetrics(tasks);
    const userMetrics = this.calculateUserMetrics(users);
    const performanceMetrics = await this.calculatePerformanceMetrics(spaceId);
    
    // 3. Return structured data
    return {
      taskMetrics,
      userMetrics,
      performanceMetrics,
      generatedAt: new Date(),
      period: { startDate, endDate }
    };
  }
  
  calculateTaskMetrics(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    };
  }
}
```

### 4. Routes

Routes define API endpoints:

```javascript
// apps/backend/src/routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');

// Public routes (if any)
router.get('/public/:spaceId', analyticsController.getPublicAnalytics);

// Protected routes
router.use(authMiddleware.authenticate);
router.use(permissionMiddleware.requireRole(['admin', 'manager']));

router.get('/space/:spaceId', analyticsController.getSpaceAnalytics);
router.post('/space/:spaceId/generate', analyticsController.generateSpaceAnalytics);
router.get('/workspace/:workspaceId', analyticsController.getWorkspaceAnalytics);
router.get('/team/:spaceId/performance', analyticsController.getTeamPerformance);
router.get('/export/:spaceId', analyticsController.exportAnalytics);

module.exports = router;
```

## Frontend Implementation

### 1. TypeScript Types & Interfaces

TypeScript provides type safety and better developer experience:

```typescript
// apps/admin/src/types/analytics.types.ts
export interface AnalyticsData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  activeProjects: number;
  completionRate: number;
  projectCreationTrends: Array<{
    month: string;
    projects: number;
  }>;
  taskCompletionData: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  userGrowthData: Array<{
    month: string;
    signups: number;
  }>;
  topTeams: Array<{
    id: string;
    name: string;
    members: number;
    projects: number;
    activityScore: number;
  }>;
  systemPerformance: {
    serverUptime: number;
    apiResponseTime: number;
    databaseHealth: number;
  };
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  timeRange: string;
  lastUpdated: string | null;
}

// Action types for Redux
export interface FetchAnalyticsPayload {
  timeRange: string;
}

export interface FetchAnalyticsFulfilledPayload {
  data: AnalyticsData;
}

export interface FetchAnalyticsRejectedPayload {
  error: string;
}
```

### 2. Redux Store Configuration

Redux Toolkit simplifies Redux setup:

```typescript
// apps/admin/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers
import adminReducer from './slices/adminSlice';
import userManagementReducer from './slices/userManagementSlice';
import analyticsReducer from './slices/analyticsSlice';
import templatesReducer from './slices/templatesSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    userManagement: userManagementReducer,
    analytics: analyticsReducer,
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Type-safe hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 3. Redux Slices

Slices contain actions, reducers, and async thunks:

```typescript
// apps/admin/src/store/slices/analyticsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsData, AnalyticsState } from '../../types/analytics.types';

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
  timeRange: '6-months',
  lastUpdated: null
};

// Async thunks for API calls
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch analytics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async ({ timeRange, format }: { timeRange: string; format: 'csv' | 'pdf' | 'excel' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to export analytics');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Synchronous actions
    setTimeRange: (state, action: PayloadAction<string>) => {
      state.timeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSystemPerformance: (state, action: PayloadAction<Partial<AnalyticsData['systemPerformance']>>) => {
      if (state.data) {
        state.data.systemPerformance = { ...state.data.systemPerformance, ...action.payload };
      }
    },
    refreshData: (state) => {
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Export Analytics
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setTimeRange,
  clearError,
  updateSystemPerformance,
  refreshData
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
```

### 4. Service Layer

Services handle API communication:

```typescript
// apps/admin/src/services/adminService.ts
import { Admin, AdminLoginCredentials, AdminResponse, AnalyticsData } from '../types/admin.types';

const API_BASE = '/api/admin';

class AdminService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Analytics
  async getAnalytics(timeRange: string = '6-months'): Promise<AnalyticsData> {
    const response = await fetch(`${API_BASE}/analytics?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get analytics');
    }

    const data = await response.json();
    return data.data;
  }

  async exportAnalytics(): Promise<void> {
    const response = await fetch(`${API_BASE}/analytics/export`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE}/system/health`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get system health');
    }

    const data = await response.json();
    return data.data;
  }
}

export const adminService = new AdminService();
export default adminService;
```

### 5. React Components

Components use Redux hooks and display data:

```typescript
// apps/admin/src/layouts/DashboardLayout.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAnalytics, setTimeRange } from '../store/slices/analyticsSlice';
import { adminService, AnalyticsData } from '../services/adminService';

const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: analyticsData, isLoading, error, timeRange } = useAppSelector(state => state.analytics);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Option 1: Use Redux thunk
        await dispatch(fetchAnalytics(timeRange)).unwrap();
        
        // Option 2: Use service directly (if you prefer)
        // const data = await adminService.getAnalytics(timeRange);
        // setAnalyticsData(data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };

    fetchDashboardData();
  }, [dispatch, timeRange]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    dispatch(setTimeRange(newTimeRange));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <Typography variant="heading-medium" className="text-red-600 mb-2">
            Error Loading Dashboard
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <Typography variant="heading-medium" className="text-muted-foreground">
            No data available
          </Typography>
        </div>
      </Container>
    );
  }

  return (
    <Container size="7xl">
      {/* Dashboard content */}
      <div className="mb-8">
        <Typography variant="heading-large" className="text-foreground mb-2">
          Welcome back, Admin
        </Typography>
        <Typography variant="body-medium" className="text-muted-foreground">
          Here's what's happening with your TaskFlow system today
        </Typography>
      </div>

      {/* Key Metrics Grid */}
      <Grid cols={4} className="mb-8 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.totalUsers.toLocaleString()}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              {analyticsData.activeUsers.daily} active today
            </Typography>
          </CardContent>
        </Card>
        
        {/* More metric cards... */}
      </Grid>
    </Container>
  );
};

export default DashboardLayout;
```

## Data Flow

### 1. Complete Data Flow Diagram

```
User Interaction → React Component → Redux Action → Async Thunk → API Service → Backend Controller → Database → Response → Redux State → UI Update
```

### 2. Step-by-Step Flow

1. **User loads dashboard page**
   - `DashboardLayout` component mounts
   - `useEffect` triggers `fetchAnalytics` action

2. **Redux action dispatched**
   - `fetchAnalytics` async thunk is called
   - Component shows loading state

3. **API call made**
   - Thunk makes HTTP request to `/api/admin/analytics`
   - Backend controller processes request

4. **Backend processing**
   - Controller validates authentication
   - Service layer fetches data from database
   - Data is processed and formatted

5. **Response received**
   - Thunk receives response
   - Redux state is updated with new data
   - Component re-renders with new data

6. **UI updates**
   - Loading state removed
   - Dashboard displays analytics data
   - Error handling if something fails

## Testing Strategy

### 1. Backend Testing

```javascript
// apps/backend/tests/analytics.test.js
const request = require('supertest');
const app = require('../app');
const { setupTestDB, createTestUser, createTestSpace } = require('./helpers/testSetup');

describe('Analytics API', () => {
  let testUser, testSpace, authToken;

  beforeEach(async () => {
    await setupTestDB();
    testUser = await createTestUser();
    testSpace = await createTestSpace();
    authToken = testUser.generateAuthToken();
  });

  describe('GET /api/analytics/space/:spaceId', () => {
    it('should return space analytics for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/analytics/space/${testSpace._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.taskMetrics).toBeDefined();
    });

    it('should deny access to unauthorized user', async () => {
      const response = await request(app)
        .get(`/api/analytics/space/${testSpace._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### 2. Frontend Testing

```typescript
// apps/admin/src/layouts/__tests__/DashboardLayout.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardLayout from '../DashboardLayout';
import analyticsReducer from '../../store/slices/analyticsSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      analytics: analyticsReducer,
    },
    preloadedState: {
      analytics: {
        data: null,
        isLoading: false,
        error: null,
        timeRange: '6-months',
        lastUpdated: null,
        ...initialState,
      },
    },
  });
};

describe('DashboardLayout', () => {
  it('should display loading state initially', () => {
    const store = createTestStore({ isLoading: true });
    
    render(
      <Provider store={store}>
        <DashboardLayout />
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error state when API fails', () => {
    const store = createTestStore({ 
      error: 'Failed to fetch data',
      isLoading: false 
    });
    
    render(
      <Provider store={store}>
        <DashboardLayout />
      </Provider>
    );

    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('should display dashboard data when loaded successfully', () => {
    const mockData = {
      totalUsers: 1000,
      activeUsers: { daily: 150, weekly: 500, monthly: 800 },
      activeProjects: 25,
      completionRate: 85,
      // ... other required fields
    };

    const store = createTestStore({ 
      data: mockData,
      isLoading: false,
      error: null
    });
    
    render(
      <Provider store={store}>
        <DashboardLayout />
      </Provider>
    );

    expect(screen.getByText('Welcome back, Admin')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('150 active today')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. TypeScript Best Practices

- **Use strict mode**: Enable `strict: true` in `tsconfig.json`
- **Define interfaces**: Create clear interfaces for all data structures
- **Use generics**: Leverage generics for reusable components and functions
- **Avoid `any`**: Use proper typing instead of `any`
- **Union types**: Use union types for values that can be multiple types

### 2. Redux Best Practices

- **Normalize state**: Keep state flat and normalized
- **Use selectors**: Create memoized selectors for derived state
- **Async thunks**: Use async thunks for API calls
- **Immutable updates**: Always return new state objects
- **Error handling**: Handle errors in async thunks and reducers

### 3. React Best Practices

- **Custom hooks**: Extract reusable logic into custom hooks
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Error boundaries**: Implement error boundaries for error handling
- **Loading states**: Always show loading states during async operations
- **Accessibility**: Use semantic HTML and ARIA attributes

### 4. API Design Best Practices

- **Consistent responses**: Use consistent response format across all endpoints
- **Error handling**: Return meaningful error messages with appropriate HTTP status codes
- **Validation**: Validate input data on both client and server
- **Rate limiting**: Implement rate limiting for API endpoints
- **Documentation**: Document all API endpoints with examples

## Common Issues and Solutions

### 1. TypeScript Errors

**Issue**: Type mismatch between API response and interface
```typescript
// Solution: Use type assertion or update interface
const data = await response.json() as AnalyticsData;
```

**Issue**: Redux state type mismatch
```typescript
// Solution: Use proper typing for Redux state
const { data } = useAppSelector((state: RootState) => state.analytics);
```

### 2. Redux Issues

**Issue**: State not updating after action
```typescript
// Solution: Check if action is properly dispatched and reducer handles it
console.log('Action dispatched:', action.type);
console.log('Current state:', state);
```

**Issue**: Async thunk not working
```typescript
// Solution: Use unwrap() for better error handling
try {
  await dispatch(fetchAnalytics(timeRange)).unwrap();
} catch (error) {
  console.error('Failed to fetch analytics:', error);
}
```

### 3. API Issues

**Issue**: CORS errors
```javascript
// Solution: Configure CORS middleware in backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Issue**: Authentication token expired
```typescript
// Solution: Implement token refresh logic
if (response.status === 401) {
  await refreshToken();
  return retryRequest();
}
```

## Performance Optimization

### 1. Frontend Optimization

- **Code splitting**: Use React.lazy for route-based code splitting
- **Memoization**: Memoize expensive calculations and components
- **Virtual scrolling**: Use virtual scrolling for large lists
- **Image optimization**: Optimize images and use lazy loading

### 2. Backend Optimization

- **Database indexing**: Add proper indexes for frequently queried fields
- **Caching**: Implement Redis caching for expensive operations
- **Pagination**: Use pagination for large datasets
- **Database queries**: Optimize database queries and use aggregation pipelines

### 3. API Optimization

- **Response compression**: Enable gzip compression
- **Caching headers**: Set appropriate cache headers
- **Batch operations**: Use batch operations when possible
- **GraphQL**: Consider GraphQL for complex data fetching

## Security Considerations

### 1. Authentication & Authorization

- **JWT tokens**: Use secure JWT tokens with proper expiration
- **Role-based access**: Implement role-based access control
- **Input validation**: Validate all user inputs
- **SQL injection**: Use parameterized queries

### 2. Data Protection

- **HTTPS**: Always use HTTPS in production
- **Environment variables**: Store sensitive data in environment variables
- **Data encryption**: Encrypt sensitive data at rest
- **Audit logging**: Log all administrative actions

## Deployment

### 1. Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-db:27017/taskflow
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### 2. Build Process

```json
// package.json scripts
{
  "scripts": {
    "build": "tsc && vite build",
    "build:backend": "npm run build:clean && npm run build:compile",
    "build:clean": "rimraf dist",
    "build:compile": "tsc -p tsconfig.build.json"
  }
}
```

### 3. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Conclusion

This implementation guide covers the complete dashboard system from backend to frontend. Key takeaways:

1. **TypeScript** provides type safety and better developer experience
2. **Redux Toolkit** simplifies state management with async thunks
3. **Proper separation of concerns** between layers
4. **Comprehensive error handling** at all levels
5. **Testing strategy** for both frontend and backend
6. **Performance optimization** considerations
7. **Security best practices** implementation

The system is designed to be scalable, maintainable, and follows industry best practices for modern web applications.
