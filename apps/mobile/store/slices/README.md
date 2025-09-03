# Separated Slice Architecture

This directory contains the separated Redux slices for the TaskFlow application. The original combined `taskSlice.ts` has been split into four focused slices to improve maintainability and separation of concerns.

## Architecture Overview

### 1. Task Slice (`taskSlice.ts`)
**Purpose**: Manages task-related state and operations
**State**:
- `tasks`: Array of tasks
- `currentTask`: Currently selected task
- `filters`: Task filtering options
- `sortBy`: Sorting configuration
- `searchQuery`: Search term
- `dragState`: Task drag and drop state

**Key Actions**:
- `fetchTasks`, `createTask`, `updateTask`, `deleteTask`
- `moveTask`, `fetchTasksByColumn`, `fetchTasksBySpace`
- `updateFilters`, `clearFilters`, `updateSort`
- Real-time updates via socket events

### 2. Board Slice (`boardSlice.ts`)
**Purpose**: Manages board-related state and operations
**State**:
- `boards`: Array of boards
- `currentBoard`: Currently selected board
- `loading`, `error`, `socketConnected`

**Key Actions**:
- `fetchBoard`, `fetchBoardsBySpace`
- `createBoard`, `updateBoard`, `deleteBoard`
- Real-time updates via socket events

### 3. Column Slice (`columnSlice.ts`)
**Purpose**: Manages column-related state and operations
**State**:
- `columns`: Array of columns
- `dragState`: Column drag and drop state
- `loading`, `error`, `socketConnected`

**Key Actions**:
- `fetchColumnsByBoard`, `createColumn`, `updateColumn`, `deleteColumn`
- `reorderColumns`, `startDraggingColumn`, `stopDraggingColumn`
- Real-time updates via socket events

### 4. Space Slice (`spaceSlice.ts`)
**Purpose**: Manages space-related state and operations
**State**:
- `spaces`: Array of spaces
- `currentSpace`: Currently selected space
- `loading`, `error`, `socketConnected`

**Key Actions**:
- `fetchSpace`, `fetchSpacesByWorkspace`
- `createSpace`, `updateSpace`, `deleteSpace`
- `getSpaceMembers`, `addSpaceMember`, `removeSpaceMember`
- Real-time updates via socket events

## Usage

### Individual Hooks
Use the specific hooks for focused functionality:

```typescript
import { useTasks, useBoards, useColumns, useSpaces } from '../hooks';

// Task operations
const { tasks, addTask, updateTask, deleteTask } = useTasks();

// Board operations
const { boards, addBoard, updateBoard, deleteBoard } = useBoards();

// Column operations
const { columns, addColumn, reorderColumns } = useColumns();

// Space operations
const { spaces, addSpace, updateSpace } = useSpaces();
```

### Combined Hook (Backward Compatibility)
For components that need access to all functionality:

```typescript
import { useTaskManager } from '../hooks';

const {
  // Task functionality
  tasks, addTask, updateTask, deleteTask,
  // Board functionality
  boards, addBoard, updateBoard, deleteBoard,
  // Column functionality
  columns, addColumn, reorderColumns,
  // Space functionality
  spaces, addSpace, updateSpace
} = useTaskManager();
```

## Benefits of Separation

1. **Focused Responsibility**: Each slice handles only its domain
2. **Better Performance**: Components can subscribe to only the state they need
3. **Easier Testing**: Smaller, focused slices are easier to test
4. **Improved Maintainability**: Changes to one domain don't affect others
5. **Better Code Organization**: Clear separation of concerns
6. **Reduced Bundle Size**: Tree-shaking can eliminate unused code

## Migration Guide

### From Combined to Separated

**Before (Combined)**:
```typescript
const { tasks, boards, columns, spaces } = useSelector(state => state.tasks);
```

**After (Separated)**:
```typescript
// Option 1: Use specific hooks
const { tasks } = useTasks();
const { boards } = useBoards();
const { columns } = useColumns();
const { spaces } = useSpaces();

// Option 2: Use combined hook for backward compatibility
const { tasks, boards, columns, spaces } = useTaskManager();
```

### Store Configuration

The store now includes all four slices:

```typescript
export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    boards: boardReducer,
    columns: columnReducer,
    spaces: spaceReducer,
    // ... other reducers
  },
});
```

## Socket Integration

All slices support real-time updates via socket events:

- **Task Slice**: `updateTaskRealTime`, `addTaskRealTime`, `removeTaskRealTime`
- **Board Slice**: `updateBoardRealTime`, `addBoardRealTime`, `removeBoardRealTime`
- **Column Slice**: `updateColumnRealTime`, `addColumnRealTime`, `removeColumnRealTime`
- **Space Slice**: `updateSpaceRealTime`, `addSpaceRealTime`, `removeSpaceRealTime`

## Selectors

Each slice provides focused selectors:

- **Task Selectors**: `selectTasks`, `selectCurrentTask`, `selectFilteredTasks`
- **Board Selectors**: `selectBoards`, `selectCurrentBoard`
- **Column Selectors**: `selectColumns`, `selectColumnsByBoard`, `selectSortedColumns`
- **Space Selectors**: `selectSpaces`, `selectCurrentSpace`, `selectSpacesByWorkspace`

## Future Considerations

1. **Type Safety**: Consider adding more specific TypeScript types for action payloads
2. **Optimization**: Implement memoized selectors for expensive computations
3. **Persistence**: Add persistence layer for offline functionality
4. **Caching**: Implement intelligent caching strategies
5. **Error Handling**: Add more sophisticated error handling and recovery
