# Dashboard Implementation - Quick Reference

## 🚀 Quick Start

### 1. Backend Structure
```
apps/backend/src/
├── models/          # Database schemas
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── routes/          # API endpoints
├── middlewares/     # Authentication & validation
└── utils/           # Helper functions
```

### 2. Frontend Structure
```
apps/admin/src/
├── types/           # TypeScript interfaces
├── store/           # Redux store & slices
├── services/        # API communication
├── components/      # Reusable UI components
├── layouts/         # Page layouts
└── pages/           # Page components
```

## 🔄 Data Flow Pattern

```
Component → Redux Action → Async Thunk → API → Backend → Database → Response → State → UI
```

## 📝 TypeScript Essentials

### Basic Interface
```typescript
interface AnalyticsData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  // ... more properties
}
```

### Redux State Interface
```typescript
interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  timeRange: string;
}
```

## 🎯 Redux Toolkit Patterns

### Store Setup
```typescript
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    // ... other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Async Thunk
```typescript
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        return rejectWithValue('Failed to fetch');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);
```

### Slice with Extra Reducers
```typescript
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
```

## 🎨 React Component Pattern

### Component with Redux
```typescript
const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector(state => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics('6-months'));
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NoDataMessage />;

  return (
    <div>
      <h1>Dashboard</h1>
      <MetricsGrid data={data} />
    </div>
  );
};
```

## 🔌 Service Layer Pattern

### API Service
```typescript
class AdminService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAnalytics(timeRange: string): Promise<AnalyticsData> {
    const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get analytics');
    }

    const data = await response.json();
    return data.data;
  }
}
```

## 🗄️ Backend Controller Pattern

### Express Controller
```javascript
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Extract parameters
    const { timeRange } = req.query;
    const userId = req.user.id;

    // 2. Validate & authorize
    if (!userRoles.hasPermission(userId, 'view_analytics')) {
      return sendResponse(res, 403, false, 'Access denied');
    }

    // 3. Business logic
    const analyticsService = require('../services/analytics.service');
    const data = await analyticsService.generateAnalytics(timeRange);

    // 4. Response
    sendResponse(res, 200, true, 'Analytics retrieved successfully', { data });
  } catch (error) {
    logger.error('Analytics error:', error);
    sendResponse(res, 500, false, 'Server error');
  }
};
```

## 🧪 Testing Patterns

### Frontend Test
```typescript
describe('DashboardLayout', () => {
  it('should display loading state', () => {
    const store = createTestStore({ isLoading: true });
    
    render(
      <Provider store={store}>
        <DashboardLayout />
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### Backend Test
```javascript
describe('Analytics API', () => {
  it('should return analytics for authorized user', async () => {
    const response = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

## 🚨 Error Handling Patterns

### Frontend Error Handling
```typescript
try {
  await dispatch(fetchAnalytics(timeRange)).unwrap();
} catch (error) {
  console.error('Failed to fetch analytics:', error);
  // Handle error in UI
}
```

### Backend Error Handling
```javascript
try {
  const data = await someAsyncOperation();
  return sendResponse(res, 200, true, 'Success', { data });
} catch (error) {
  logger.error('Operation failed:', error);
  return sendResponse(res, 500, false, 'Server error');
}
```

## 🔐 Authentication Pattern

### JWT Middleware
```javascript
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return sendResponse(res, 401, false, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid token');
  }
};
```

## 📊 Common Data Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

// Always handle these three states in your components
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  page?: number;
  limit?: number;
}
```

## 🎯 Key Redux Hooks

```typescript
// Use these instead of plain useDispatch and useSelector
import { useAppDispatch, useAppSelector } from '../store';

const dispatch = useAppDispatch();
const { data, isLoading, error } = useAppSelector(state => state.analytics);
```

## 🔧 Common Utilities

### Response Helper
```javascript
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};
```

### Error Logger
```javascript
const logger = require('winston');

logger.error('Operation failed:', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
  userId: req.user?.id,
  endpoint: req.originalUrl
});
```

## 📱 Component Best Practices

1. **Always handle loading, error, and success states**
2. **Use TypeScript interfaces for props and state**
3. **Extract reusable logic into custom hooks**
4. **Implement proper error boundaries**
5. **Use semantic HTML and accessibility attributes**

## 🚀 Performance Tips

1. **Memoize expensive calculations with useMemo**
2. **Use React.memo for components that don't change often**
3. **Implement proper loading states**
4. **Use pagination for large datasets**
5. **Implement caching strategies**

## 🔒 Security Checklist

- [ ] JWT tokens with proper expiration
- [ ] Input validation on both client and server
- [ ] Role-based access control
- [ ] HTTPS in production
- [ ] Environment variables for secrets
- [ ] Rate limiting on API endpoints
- [ ] SQL injection prevention
- [ ] XSS protection

## 📚 File Naming Conventions

```
components/     → PascalCase (e.g., DashboardLayout.tsx)
hooks/         → camelCase (e.g., useAnalytics.ts)
services/      → camelCase (e.g., adminService.ts)
types/         → camelCase (e.g., analytics.types.ts)
store/         → camelCase (e.g., analyticsSlice.ts)
```

## 🎨 UI Component Library

```typescript
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Progress,
  Button,
  Grid,
  Container
} from '@taskflow/ui';
```

This quick reference covers the essential patterns and implementations you need to understand the dashboard system. Refer to the full implementation guide for detailed explanations and examples.
