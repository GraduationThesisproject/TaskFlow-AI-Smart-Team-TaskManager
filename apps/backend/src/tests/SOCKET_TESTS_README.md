# Socket.IO Tests Documentation

This directory contains comprehensive tests for all Socket.IO functionality in the TaskFlow application.

## Test Files

### 1. `socket.board.test.js`
Tests for board-related Socket.IO events and functionality:
- **Authentication**: Token validation and connection handling
- **Board Join/Leave**: Room management and access control
- **Column Operations**: Create, update, delete, and reorder columns
- **Board Settings**: Real-time settings updates
- **Bulk Operations**: Mass task operations
- **View Tracking**: Analytics and user presence
- **Global Utilities**: Server-wide notification functions

### 2. `socket.notification.test.js`
Tests for notification system Socket.IO events:
- **Connection Setup**: Automatic room joining and authentication
- **Unread Count**: Real-time unread notification tracking
- **Mark as Read**: Individual and bulk read status updates
- **Recent Notifications**: Pagination and sorting
- **Subscriptions**: Type-based notification filtering
- **Delivery Status**: Email and push notification tracking
- **Global Utilities**: Bulk and system-wide notifications

### 3. `socket.task.test.js`
Tests for task-related Socket.IO events:
- **Authentication**: JWT token validation
- **Project/Board Rooms**: Multi-level room management
- **Task Operations**: Real-time updates and movements
- **Comments**: Live commenting with mentions
- **User Presence**: Typing indicators and status updates
- **Real-time Collaboration**: Multi-user synchronization
- **Global Utilities**: Cross-room notifications

### 4. `socket.workspace.test.js`
Tests for workspace-level Socket.IO events:
- **Room Management**: Workspace-level room joining/leaving
- **Member Management**: Real-time member updates and role changes
- **Settings Updates**: Workspace configuration changes
- **Usage Limits**: Quota monitoring and warnings
- **Global Utilities**: Workspace-wide notifications

## Running the Tests

### Prerequisites
- Node.js and npm installed
- MongoDB running (tests use in-memory MongoDB)
- All dependencies installed: `npm install`

### Running All Socket Tests
```bash
# From the backend directory
node src/tests/run-socket-tests.js

# Or using npm script (if added to package.json)
npm run test:socket
```

### Running Specific Test Files
```bash
# Board socket tests only
node src/tests/run-socket-tests.js socket.board

# Task socket tests only
node src/tests/run-socket-tests.js socket.task

# Notification socket tests only
node src/tests/run-socket-tests.js socket.notification

# Workspace socket tests only
node src/tests/run-socket-tests.js socket.workspace
```

### Running with Jest Directly
```bash
# All socket tests
npx jest --testPathPattern="socket.*\.test\.js"

# Specific test file
npx jest socket.board.test.js

# With coverage
npx jest --testPathPattern="socket.*\.test\.js" --coverage
```

## Test Structure

### Setup and Teardown
Each test file follows this pattern:
```javascript
beforeAll(async () => {
  await setupTestDB(); // Setup in-memory MongoDB
});

afterAll(async () => {
  await teardownTestDB(); // Clean up database
});

beforeEach(async () => {
  await clearDatabase(); // Clear all collections
  // Create test data and setup Socket.IO server
});

afterEach(async () => {
  // Clean up sockets and server
});
```

### Authentication Testing
Tests verify proper JWT token validation:
```javascript
test('should reject connection without token', (done) => {
  const socket = require('socket.io-client')(`http://localhost:${server.address().port}`);
  
  socket.on('connect_error', (error) => {
    expect(error.message).toBe('Authentication required');
    done();
  });
});
```

### Real-time Event Testing
Tests verify Socket.IO events are properly emitted and received:
```javascript
test('should update task successfully', (done) => {
  clientSocket.emit('task:update', { taskId, updates, boardId });
  
  clientSocket.on('task:updated', (data) => {
    expect(data.task.title).toBe(updates.title);
    expect(data.updatedBy.id).toBe(testUser._id.toString());
    done();
  });
});
```

### Permission Testing
Tests verify proper access control:
```javascript
test('should reject operation without permissions', async () => {
  // Create user without permissions
  const otherUser = await User.create(createTestUser());
  
  // Attempt operation
  otherSocket.emit('board:join', { boardId });
  
  otherSocket.on('error', (data) => {
    expect(data.message).toBe('Access denied to board');
    done();
  });
});
```

## Test Data and Helpers

### Test Data Factories
Located in `helpers/testData.js`:
- `createTestUser()` - Creates test user data
- `createTestBoard()` - Creates test board data
- `createTestTask()` - Creates test task data
- `createTestNotification()` - Creates test notification data
- `createWorkspaceWithRoles()` - Creates workspace with proper user roles

### Authentication Helpers
Located in `helpers/authHelper.js`:
- `createTestToken()` - Creates JWT token for testing
- `createAuthenticatedUser()` - Creates user with valid token

### Database Helpers
Located in `helpers/testSetup.js`:
- `setupTestDB()` - Initializes test database
- `teardownTestDB()` - Cleans up test database
- `clearDatabase()` - Clears all collections

## Socket.IO Event Coverage

### Board Events
- `board:join` - Join board room
- `board:leave` - Leave board room
- `column:create` - Create new column
- `column:update` - Update column
- `column:delete` - Delete column
- `columns:reorder` - Reorder columns
- `board:settings-update` - Update board settings
- `board:view` - Track board view
- `board:bulk-operation` - Bulk operations

### Notification Events
- `notifications:getUnreadCount` - Get unread count
- `notifications:markRead` - Mark as read
- `notifications:markAllRead` - Mark all as read
- `notifications:getRecent` - Get recent notifications
- `notifications:subscribe` - Subscribe to types
- `notifications:unsubscribe` - Unsubscribe from types
- `notifications:delivered` - Update delivery status

### Task Events
- `join:project` - Join project room
- `join:board` - Join board room
- `task:update` - Update task
- `task:move` - Move task
- `comment:add` - Add comment
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `presence:update` - Update presence

### Workspace Events
- `workspace:join` - Join workspace room
- `workspace:leave` - Leave workspace room
- `workspace:member-update` - Update member
- `workspace:settings-update` - Update settings
- `workspace:check-limits` - Check usage limits

## Global Utilities Testing

Each socket handler provides global utilities for server-wide operations:

### Board Utilities
- `io.notifyBoard()` - Notify all board members
- `io.notifyBoardAdmins()` - Notify board administrators

### Notification Utilities
- `io.sendNotification()` - Send individual notification
- `io.sendBulkNotifications()` - Send multiple notifications
- `io.broadcastSystemNotification()` - Broadcast system-wide

### Task Utilities
- `io.notifyUser()` - Notify specific user
- `io.notifyProject()` - Notify project members
- `io.notifyBoard()` - Notify board members

### Workspace Utilities
- `io.notifyWorkspace()` - Notify workspace members
- `io.notifyWorkspaceAdmins()` - Notify workspace administrators

## Error Handling

Tests verify proper error handling for:
- Invalid authentication tokens
- Missing permissions
- Non-existent resources
- Database errors
- Invalid data formats
- Network timeouts

## Performance Considerations

- Tests use in-memory MongoDB for faster execution
- Socket connections are properly cleaned up
- Timeouts are set appropriately for async operations
- Database operations are optimized

## Debugging Tests

### Common Issues
1. **Port conflicts**: Tests use random ports to avoid conflicts
2. **Database state**: Each test starts with a clean database
3. **Socket cleanup**: Sockets are properly disconnected after tests
4. **Async timing**: Proper use of `done()` callbacks and timeouts

### Debug Mode
Run tests with verbose output:
```bash
npx jest --testPathPattern="socket.*\.test\.js" --verbose
```

### Isolated Testing
Run a single test:
```bash
npx jest socket.board.test.js --testNamePattern="should join board room successfully"
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies (uses in-memory MongoDB)
- Proper cleanup and teardown
- Consistent test environment
- Fast execution times

## Contributing

When adding new Socket.IO functionality:
1. Add corresponding tests to the appropriate test file
2. Follow the existing test patterns and structure
3. Include both success and error cases
4. Test permission boundaries
5. Verify real-time event broadcasting
6. Update this documentation if needed
