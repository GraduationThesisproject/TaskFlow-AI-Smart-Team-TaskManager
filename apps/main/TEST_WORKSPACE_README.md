# Test Workspace Guide

This guide explains how to use the test workspace functionality in your TaskFlow application.

## Overview

The test workspace (ID: `68a63eded82887a543145307`) is now globally available throughout your application, making it easy to test spaces, boards, and tasks without hardcoding IDs.

## Global Configuration

### Environment Variables
- **TEST_TOKEN**: The JWT token for authentication
- **TEST_WORKSPACE_ID**: The workspace ID for testing (`68a63eded82887a543145307`)

### Helper Functions
```typescript
import { getTestWorkspaceId, isTestEnvironment } from './config/env';

// Get the test workspace ID
const workspaceId = getTestWorkspaceId();

// Check if we're in test environment
const isTest = isTestEnvironment();
```

## Utility Functions

### Test Workspace Utilities
```typescript
import { 
  TEST_WORKSPACE, 
  getTestWorkspaceIdUtil,
  isTestWorkspace,
  TEST_WORKSPACE_ENDPOINTS 
} from './utils/testWorkspace';

// Access workspace info
const workspaceId = TEST_WORKSPACE.ID; // "68a63eded82887a543145307"
const shortId = TEST_WORKSPACE.SHORT_ID; // "145307"
const name = TEST_WORKSPACE.NAME; // "Test Workspace"

// Check if a workspace is the test workspace
const isTest = isTestWorkspace(someWorkspaceId);

// Get API endpoints
const spacesEndpoint = TEST_WORKSPACE_ENDPOINTS.SPACES;
const boardsEndpoint = TEST_WORKSPACE_ENDPOINTS.BOARDS(spaceId);
```

## Custom Hook

### useTestWorkspace Hook
```typescript
import { useTestWorkspace } from './hooks/useTestWorkspace';

const MyComponent = () => {
  const {
    workspace,
    spaces,
    boards,
    tasks,
    loading,
    error,
    loadWorkspace,
    loadSpaces,
    loadBoards,
    loadTasks,
    loadCompleteHierarchy,
    clearData
  } = useTestWorkspace();

  // Load complete hierarchy
  useEffect(() => {
    loadCompleteHierarchy();
  }, []);

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
};
```

## Example Component

### TestWorkspaceExample Component
```typescript
import { TestWorkspaceExample } from './components/TestWorkspaceExample';

// Use in your app
<TestWorkspaceExample />
```

This component provides:
- Load workspace details
- Load spaces within the workspace
- Load boards within spaces
- Load tasks within boards
- Interactive buttons to explore the hierarchy
- Real-time data display

## API Testing

### API Test Page
Navigate to `/apiTest` to test all services with the test workspace:

1. **Run All Tests**: Tests all services
2. **Test Workspace**: Specifically tests the test workspace hierarchy
3. **Clear Results**: Clears test results

### Test Results
The API test page will show:
- ✅ Success: Service working correctly
- ❌ Failed: Service error with details
- Response data for successful calls
- Error messages for failed calls

## Complete Hierarchy Testing

The test workspace allows you to test the complete hierarchy:

```
Workspace (68a63eded82887a543145307)
├── Spaces
│   ├── Space 1
│   │   ├── Board 1
│   │   │   ├── Task 1
│   │   │   ├── Task 2
│   │   │   └── Task 3
│   │   └── Board 2
│   │       ├── Task 4
│   │       └── Task 5
│   └── Space 2
│       └── Board 3
│           └── Task 6
└── Workspace Settings
```

## Usage Examples

### 1. Load Spaces in a Component
```typescript
import { useTestWorkspace } from './hooks/useTestWorkspace';

const SpacesList = () => {
  const { spaces, loadSpaces, loading } = useTestWorkspace();

  useEffect(() => {
    loadSpaces();
  }, []);

  if (loading) return <div>Loading spaces...</div>;

  return (
    <div>
      {spaces.map(space => (
        <div key={space._id}>{space.name}</div>
      ))}
    </div>
  );
};
```

### 2. Load Tasks for a Specific Board
```typescript
import { useTestWorkspace } from './hooks/useTestWorkspace';

const BoardTasks = ({ boardId }: { boardId: string }) => {
  const { tasks, loadTasks, loading } = useTestWorkspace();

  useEffect(() => {
    loadTasks(boardId);
  }, [boardId]);

  return (
    <div>
      {tasks.map(task => (
        <div key={task._id}>{task.title}</div>
      ))}
    </div>
  );
};
```

### 3. Check if Current Workspace is Test Workspace
```typescript
import { isTestWorkspace } from './utils/testWorkspace';

const WorkspaceHeader = ({ workspaceId }: { workspaceId: string }) => {
  const isTest = isTestWorkspace(workspaceId);

  return (
    <div>
      {isTest && <span className="test-badge">Test Environment</span>}
      {/* Rest of your header */}
    </div>
  );
};
```

## API Endpoints

### Workspace Level
- `GET /api/workspaces/68a63eded82887a543145307` - Get test workspace

### Space Level
- `GET /api/spaces?workspace=68a63eded82887a543145307` - Get spaces in test workspace

### Board Level
- `GET /api/boards?space={spaceId}` - Get boards in a space

### Task Level
- `GET /api/tasks?boardId={boardId}` - Get tasks in a board

## Best Practices

1. **Use the Hook**: Always use `useTestWorkspace` hook instead of direct API calls
2. **Check Environment**: Use `isTestEnvironment()` to conditionally show test features
3. **Clear Data**: Call `clearData()` when unmounting components
4. **Error Handling**: Always handle errors from the hook
5. **Loading States**: Use the `loading` state for better UX

## Troubleshooting

### Common Issues

1. **Token Expired**: Check if `TEST_TOKEN` is still valid
2. **Workspace Not Found**: Verify `TEST_WORKSPACE_ID` is correct
3. **Permission Denied**: Ensure the token has access to the workspace
4. **Network Errors**: Check if backend is running and accessible

### Debug Information

The test workspace components include debug information:
- Workspace ID display
- API response data
- Error messages
- Loading states

## Production Considerations

⚠️ **Important**: Remove test workspace functionality before production:

1. Remove `TEST_TOKEN` and `TEST_WORKSPACE_ID` from environment
2. Remove test workspace components
3. Remove test workspace hooks
4. Update API test page to remove test-specific features
5. Ensure proper authentication flow is in place

## Support

If you encounter issues with the test workspace:

1. Check the API test page for service status
2. Verify token and workspace ID are correct
3. Check browser console for error messages
4. Ensure backend services are running
5. Verify CORS configuration
