# API Integration Setup

This document describes how the frontend has been configured to use the real backend APIs instead of dummy data.

## Overview

The frontend has been updated to:
1. Use a test token for authentication
2. Connect to real backend APIs
3. Store authentication state in Redux
4. Remove all dummy/static data

## Configuration

### Environment Variables

The app is configured to connect to the backend at `http://localhost:3001/api` by default.

### Test Token

A test token is configured in `src/config/env.ts` for development purposes. This token should be removed in production.

## Authentication

### Redux Store

- **Auth Slice**: Manages authentication state including token, user, and loading states
- **Token Storage**: The test token is automatically loaded into Redux on app initialization
- **Axios Integration**: The token is automatically included in all API requests

### Authentication Flow

1. App initializes with test token
2. Token is stored in Redux state
3. Axios interceptor automatically adds token to all requests
4. API services use the authenticated axios instance

## API Services

### Available Services

- **WorkspaceService**: Manage workspaces
- **SpaceService**: Manage spaces within workspaces
- **BoardService**: Manage boards within spaces
- **TaskService**: Manage tasks
- **CommentService**: Manage task comments

### Service Structure

Each service follows a consistent pattern:
- Static methods for CRUD operations
- Proper error handling with try-catch blocks
- TypeScript interfaces for request/response data
- Axios for HTTP requests

## Testing

### API Test Page

Navigate to `/api-test` to test all API services:
- Tests connection to backend
- Verifies authentication
- Tests all service endpoints
- Shows detailed results and errors

### Running Tests

1. Ensure backend is running on port 3001
2. Navigate to the API Test page
3. Click "Run All Tests"
4. Review results for each service

## Backend Endpoints

The frontend expects these backend endpoints to be available:

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace

### Spaces
- `GET /api/spaces?workspace=:id` - Get spaces by workspace
- `GET /api/spaces/:id` - Get space by ID
- `POST /api/spaces` - Create space
- `PUT /api/spaces/:id` - Update space

### Boards
- `GET /api/boards?space=:id` - Get boards by space
- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board

### Tasks
- `GET /api/tasks` - Get tasks with filtering
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Development

### Adding New Services

1. Create a new service file in `src/services/`
2. Follow the existing service pattern
3. Export from `src/services/index.ts`
4. Add tests to the API Test page

### Error Handling

All services include proper error handling:
- Try-catch blocks around API calls
- Console logging for debugging
- Error propagation to calling components

### Type Safety

- All services use TypeScript interfaces
- Request/response types are defined
- API response types match backend structure

## Production Considerations

### Security
- Remove test token before production
- Implement proper authentication flow
- Add token refresh logic
- Secure token storage

### Environment Configuration
- Use environment variables for API URLs
- Configure CORS properly
- Set up HTTPS in production

### Error Handling
- Add user-friendly error messages
- Implement retry logic for failed requests
- Add offline support where possible

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend origin
2. **Authentication Errors**: Verify test token is valid and not expired
3. **Network Errors**: Check if backend is running on correct port
4. **Type Errors**: Ensure backend response structure matches frontend types

### Debug Steps

1. Check browser console for errors
2. Use API Test page to verify connectivity
3. Check Redux DevTools for auth state
4. Verify axios interceptors are working

## Next Steps

1. Implement proper user authentication
2. Add real-time updates with Socket.IO
3. Implement offline support
4. Add comprehensive error handling
5. Set up automated testing
