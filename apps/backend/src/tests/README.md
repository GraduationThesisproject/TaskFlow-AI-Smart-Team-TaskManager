# TaskFlow Backend Test Suite

This directory contains comprehensive tests for the TaskFlow backend API.

## Test Structure

```
tests/
├── helpers/
│   ├── testSetup.js      # Database setup and teardown
│   ├── testData.js       # Test data factories
│   └── authHelper.js     # Authentication helpers
├── setup.js              # Global test configuration
├── auth.test.js          # Authentication tests
├── workspaces.test.js    # Workspace management tests
├── projects.test.js      # Project management tests
├── boards.test.js        # Board and column tests
├── tasks.enhanced.test.js # Comprehensive task tests
├── files.test.js         # File upload and management tests
├── notifications.test.js # Notification system tests
├── reminders.test.js     # Reminder functionality tests
├── tags.test.js          # Tag management tests
├── invitations.test.js   # Invitation system tests
├── spaces.test.js        # Space management tests
├── checklists.test.js    # Checklist functionality tests
├── analytics.test.js     # Analytics and reporting tests
├── ai.test.js            # AI features tests
└── integration.test.js   # End-to-end workflow tests
```

## Running Tests

### All Tests
```bash
npm test                  # Run all tests
npm run test:all         # Run unit tests + integration tests
npm run test:coverage    # Run with coverage report
```

### Specific Test Categories
```bash
npm run test:unit        # Run only unit tests (excludes integration)
npm run test:integration # Run only integration tests
npm run test:watch       # Run in watch mode for development
```

### Individual Test Files
```bash
npm test auth.test.js           # Authentication tests
npm test workspaces.test.js     # Workspace tests
npm test tasks.enhanced.test.js # Task tests
npm test integration.test.js    # Integration tests
```

### Development Testing
```bash
npm run test:watch      # Watch mode - reruns tests on changes
npm run test:verbose    # Detailed output
npm run test:silent     # Minimal output
```

## Test Features Covered

### 🔐 Authentication & Authorization
- User registration and login
- Password reset flow
- Profile management
- Session management
- Role-based permissions

### 🏢 Workspace Management
- Workspace CRUD operations
- Member management
- Invitation system
- Settings and preferences

### 📋 Project Management
- Project lifecycle
- Team management
- Project insights
- Archive/restore functionality

### 📊 Board & Task Management
- Kanban board operations
- Column management
- Task CRUD with advanced features
- Task dependencies
- Bulk operations
- Time tracking
- Task duplication

### 📁 File Management
- File upload (single & multiple)
- Avatar uploads
- Task attachments
- File download and serving
- File permissions and cleanup

### 🔔 Notifications
- Notification delivery
- Mark as read/unread
- Bulk operations
- Filtering and search
- Statistics

### ⏰ Reminders
- Reminder creation and management
- Snooze functionality
- Recurring reminders
- Due date tracking

### 🏷️ Tags & Organization
- Tag creation and management
- Project-scoped tags
- Tag usage analytics
- Bulk tag operations

### 👥 Invitations
- Send invitations
- Accept/decline workflow
- Invitation management
- Token-based access

### 📈 Analytics & Reporting
- Project analytics
- Team performance metrics
- Export functionality
- Custom date ranges

### 🤖 AI Features
- Task suggestions
- Natural language parsing
- Risk analysis
- Timeline generation
- Performance insights

### 🔗 Integration Tests
- Complete workflow scenarios
- Cross-feature interactions
- Error handling
- Edge cases

## Test Data

The test suite uses factories in `helpers/testData.js` to generate realistic test data:

- **Faker.js**: Generates realistic names, emails, descriptions
- **Consistent Data**: Reusable factories for all models
- **Relationships**: Properly linked test entities
- **Edge Cases**: Boundary conditions and error scenarios

## Mocking

External services are mocked in `setup.js`:

- **AI Service**: Returns mock responses for AI features
- **Email Service**: Prevents actual email sending during tests
- **File System**: Uses in-memory storage for file tests
- **Database**: Uses MongoDB Memory Server for isolation

## Best Practices

1. **Isolation**: Each test is independent and cleans up after itself
2. **Authentication**: Helper functions manage user creation and auth tokens
3. **Database**: Tests use in-memory MongoDB for speed and isolation
4. **Assertions**: Comprehensive checks for success/failure scenarios
5. **Coverage**: Aims for high code coverage across all features

## Running Specific Test Scenarios

```bash
# Test only authentication
npm test -- --testPathPattern=auth

# Test only workspace features
npm test -- --testPathPattern=workspace

# Test only file upload features
npm test -- --testPathPattern=files

# Test specific function
npm test -- --testNamePattern="should create workspace"

# Test with specific timeout
npm test -- --testTimeout=60000
```

## Environment Variables

Tests use the following environment variables:

- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key`
- `MONGODB_URI=mongodb://localhost:27017/taskflow_test`
- `PORT=3002`

## Continuous Integration

This test suite is designed to run in CI environments:

- Uses in-memory database (no external dependencies)
- Mocks external services
- Parallel test execution safe
- Comprehensive coverage reporting
- Fast execution (< 2 minutes for full suite)

## Debugging Tests

```bash
# Run with debugging
npm test -- --verbose --no-cache

# Run single test with full output
npm test -- --testNamePattern="specific test name" --verbose

# Generate coverage HTML report
npm run test:coverage
open coverage/lcov-report/index.html
```
