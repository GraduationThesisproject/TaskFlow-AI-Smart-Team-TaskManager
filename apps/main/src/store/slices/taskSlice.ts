import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Task, 
  TaskState, 
  CreateTaskForm, 
  UpdateTaskForm, 
  MoveTaskForm,
  TaskFilters 
} from '../../types/task.types';
import type { Column, Board } from '../../types/board.types';
import type { Space } from '../../types/space.types';
import { TaskService } from '../../services/taskService';
import { BoardService } from '../../services/boardService';
import { SpaceService } from '../../services/spaceService';

// Async thunks for API calls
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (boardId: string) => {
    try {
      const response = await TaskService.getTasks({ boardId });
      // Backend returns { data: [...tasks...], total, page, limit, totalPages }
      const tasks = response.data?.data || response.data?.tasks || response.data?.items || response.data || [];
      // Ensure we always return an array
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'tasks/fetchBoard',
  async (boardId: string) => {
    const response = await BoardService.getBoard(boardId);
    return response.data;
  }
);

export const fetchSpace = createAsyncThunk(
  'tasks/fetchSpace',
  async (spaceId: string) => {
    const response = await SpaceService.getSpace(spaceId);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskForm) => {
    const response = await TaskService.createTask(taskData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: UpdateTaskForm }) => {
    const response = await TaskService.updateTask(id, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await TaskService.deleteTask(taskId);
    return taskId;
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ id, moveData }: { id: string; moveData: MoveTaskForm }) => {
    const response = await TaskService.moveTask(id, moveData);
    return response.data;
  }
);

export const fetchTasksByColumn = createAsyncThunk(
  'tasks/fetchTasksByColumn',
  async (columnId: string) => {
    const response = await TaskService.getTasks({ columnId });
    return response.data?.items || response.data || [];
  }
);

export const fetchTasksBySpace = createAsyncThunk(
  'tasks/fetchTasksBySpace',
  async (spaceId: string) => {
    const response = await TaskService.getTasks({ spaceId });
    return response.data?.items || response.data || [];
  }
);

export const fetchBoardsBySpace = createAsyncThunk(
  'tasks/fetchBoardsBySpace',
  async (spaceId: string) => {
    const response = await BoardService.getBoardsBySpace(spaceId);
    return response.data || [];
  }
);


// Column operations are now handled via sockets - only keeping fetch operations here

// All column operations (create, update, delete, reorder) are now handled via sockets

export const fetchOverdueTasks = createAsyncThunk(
  'tasks/fetchOverdueTasks',
  async () => {
    const response = await TaskService.getOverdueTasks();
    return response.data || [];
  }
);

export const fetchTaskRecommendations = createAsyncThunk(
  'tasks/fetchTaskRecommendations',
  async () => {
    const response = await TaskService.getTaskRecommendations();
    return response.data || [];
  }
);

export const bulkUpdateTasks = createAsyncThunk(
  'tasks/bulkUpdateTasks',
  async ({ taskIds, updates }: { taskIds: string[]; updates: Partial<UpdateTaskForm> }) => {
    const response = await TaskService.bulkUpdateTasks(taskIds, updates);
    return response.data;
  }
);

export const duplicateTask = createAsyncThunk(
  'tasks/duplicateTask',
  async (taskId: string) => {
    const response = await TaskService.duplicateTask(taskId);
    return response.data;
  }
);

export const startTimeTracking = createAsyncThunk(
  'tasks/startTimeTracking',
  async ({ taskId, description }: { taskId: string; description?: string }) => {
    const response = await TaskService.startTimeTracking(taskId, description);
    return response.data;
  }
);

export const stopTimeTracking = createAsyncThunk(
  'tasks/stopTimeTracking',
  async (taskId: string) => {
    const response = await TaskService.stopTimeTracking(taskId);
    return response.data;
  }
);

// Comment-related async thunks
export const fetchTaskComments = createAsyncThunk(
  'tasks/fetchTaskComments',
  async (taskId: string) => {
    const response = await TaskService.getTaskComments(taskId);
    return response.data || [];
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ taskId, commentData }: { taskId: string; commentData: { content: string; mentions?: string[]; parentCommentId?: string } }) => {
    const response = await TaskService.addComment(taskId, commentData);
    return response.data;
  }
);

export const updateTaskComment = createAsyncThunk(
  'tasks/updateTaskComment',
  async ({ commentId, commentData }: { commentId: string; commentData: { content: string } }) => {
    const response = await TaskService.updateComment(commentId, commentData);
    return response.data;
  }
);

export const deleteTaskComment = createAsyncThunk(
  'tasks/deleteTaskComment',
  async (commentId: string) => {
    await TaskService.deleteComment(commentId);
    return commentId;
  }
);

export const addCommentReaction = createAsyncThunk(
  'tasks/addCommentReaction',
  async ({ commentId, reactionData }: { commentId: string; reactionData: { emoji: string } }) => {
    const response = await TaskService.addCommentReaction(commentId, reactionData);
    return response.data;
  }
);

export const removeCommentReaction = createAsyncThunk(
  'tasks/removeCommentReaction',
  async ({ commentId, emoji }: { commentId: string; emoji: string }) => {
    await TaskService.removeCommentReaction(commentId, emoji);
    return { commentId, emoji };
  }
);

export const toggleCommentPin = createAsyncThunk(
  'tasks/toggleCommentPin',
  async (commentId: string) => {
    const response = await TaskService.toggleCommentPin(commentId);
    return response.data;
  }
);

export const toggleCommentResolve = createAsyncThunk(
  'tasks/toggleCommentResolve',
  async (commentId: string) => {
    const response = await TaskService.toggleCommentResolve(commentId);
    return response.data;
  }
);

// Initial state
const initialState: TaskState = {
  tasks: [], // Always initialize as empty array

  currentTask: null,
  currentBoard: null,
  currentSpace: null,
  columns: [],
  boards: [],
  spaces: [],
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assignee: [],
    tags: []
  },
  sortBy: {
    field: 'createdAt',
    direction: 'desc'
  },
  searchQuery: '',
  socketConnected: false,
  dragState: {
    isDragging: false,
    draggedTask: null,
    draggedColumn: null,
    sourceColumn: null,
    targetColumn: null
  },
  comments: {} // Added for storing comments by taskId
};

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Set current task
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    
    // Set current board
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    
    // Set current space
    setCurrentSpace: (state, action: PayloadAction<Space | null>) => {
      state.currentSpace = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: [],
        priority: [],
        assignee: [],
        tags: []
      };
    },
    
    // Update sort
    updateSort: (state, action: PayloadAction<{ field: keyof Task; direction: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload;
    },
    
    // Update search query
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Drag and drop state
    setDragState: (state, action: PayloadAction<Partial<TaskState['dragState']>>) => {
      state.dragState = { ...state.dragState, ...action.payload };
    },
    
    // Start dragging
    startDragging: (state, action: PayloadAction<{ task: Task; column: Column }>) => {
      state.dragState = {
        isDragging: true,
        draggedTask: action.payload.task,
        draggedColumn: action.payload.column,
        sourceColumn: action.payload.column._id,
        targetColumn: null
      };
    },
    
    // Stop dragging
    stopDragging: (state) => {
      state.dragState = {
        isDragging: false,
        draggedTask: null,
        draggedColumn: null,
        sourceColumn: null,
        targetColumn: null
      };
    },
    
    // Update task in real-time (for socket events)
    updateTaskRealTime: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    
    // Add task in real-time (for socket events)
    addTaskRealTime: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    
    // Remove task in real-time (for socket events)
    removeTaskRealTime: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
      if (state.currentTask?._id === action.payload) {
        state.currentTask = null;
      }
    },
    
    // Move task in real-time (for socket events)
    moveTaskRealTime: (state, action: PayloadAction<{ taskId: string; sourceColumnId: string; targetColumnId: string; targetPosition: number }>) => {
      const { taskId, targetColumnId, targetPosition } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].column = targetColumnId;
        state.tasks[taskIndex].position = targetPosition;
      }
    },
    
    // Update column in real-time (for socket events)
    updateColumnRealTime: (state, action: PayloadAction<Column>) => {
      if (Array.isArray(state.columns)) {
        const index = state.columns.findIndex(col => col._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      } else {
        state.columns = [];
      }
    },
    
    // Add column in real-time (for socket events)
    addColumnRealTime: (state, action: PayloadAction<Column>) => {
      if (!Array.isArray(state.columns)) {
        state.columns = [];
      }
      state.columns.push(action.payload);
    },
    
    // Remove column in real-time (for socket events)
    removeColumnRealTime: (state, action: PayloadAction<string>) => {
      if (Array.isArray(state.columns)) {
        state.columns = state.columns.filter(col => col._id !== action.payload);
      } else {
        state.columns = [];
      }
    },

    // Reorder columns in real-time (for socket events)
    reorderColumnsRealTime: (state, action: PayloadAction<Column[]>) => {
      if (Array.isArray(action.payload)) {
        state.columns = action.payload;
      } else {
        state.columns = [];
      }
    },

    // Update column positions in real-time (for socket events)
    updateColumnPositionsRealTime: (state, action: PayloadAction<Array<{ columnId: string; position: number }>>) => {
      if (Array.isArray(state.columns) && Array.isArray(action.payload)) {
        // Update positions for each column
        action.payload.forEach(({ columnId, position }) => {
          const column = state.columns.find(col => col._id === columnId);
          if (column) {
            column.position = position;
          }
        });
        // Sort columns by position to maintain order
        state.columns.sort((a, b) => (a.position || 0) - (b.position || 0));
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure tasks is always an array
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
        // Ensure tasks remains an array even on error
        state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
      });
    
    // Fetch board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        // The API returns { board, columns, tasks } structure
        const response = action.payload as any;
        
        state.currentBoard = response.board || response;
        // Extract columns and tasks from the response
        if (response.columns) {
          state.columns = Array.isArray(response.columns) ? response.columns : [];
        }
        if (response.tasks) {
          // Ensure tasks is always an array
          state.tasks = Array.isArray(response.tasks) ? response.tasks : [];
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      });
    
    // Fetch space
    builder
      .addCase(fetchSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSpace = action.payload;
        // state.boards = getBoardsBySpace(action.payload._id); // This line is removed as per the new_code
      })
      .addCase(fetchSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch space';
      });
    
    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      });


    // Column operations are now handled via socket events and real-time reducers
    
    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      });
    
    // Move task
    builder
      .addCase(moveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move task';
      });
    
    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      });

    // Comment-related extraReducers
    // Fetch task comments
    builder
      .addCase(fetchTaskComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.loading = false;
        // Store comments by taskId
        const taskId = action.meta.arg;
        state.comments[taskId] = action.payload;
      })
      .addCase(fetchTaskComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task comments';
      });

    // Add task comment
    builder
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const taskId = action.meta.arg.taskId;
        if (!state.comments[taskId]) {
          state.comments[taskId] = [];
        }
        state.comments[taskId].push(action.payload);
      });

    // Update task comment
    builder
      .addCase(updateTaskComment.fulfilled, (state, action) => {
        const commentId = action.meta.arg.commentId;
        // Find and update the comment in all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          const commentIndex = state.comments[taskId].findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            state.comments[taskId][commentIndex] = action.payload;
          }
        });
      });

    // Delete task comment
    builder
      .addCase(deleteTaskComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        // Remove the comment from all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          state.comments[taskId] = state.comments[taskId].filter(comment => comment._id !== commentId);
        });
      });

    // Add comment reaction
    builder
      .addCase(addCommentReaction.fulfilled, (state, action) => {
        const commentId = action.meta.arg.commentId;
        // Update the comment in all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          const commentIndex = state.comments[taskId].findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            state.comments[taskId][commentIndex] = action.payload;
          }
        });
      });

    // Remove comment reaction
    builder
      .addCase(removeCommentReaction.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        // Update the comment in all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          const commentIndex = state.comments[taskId].findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            // Remove the specific reaction
            const comment = state.comments[taskId][commentIndex];
            if (comment.reactions) {
              comment.reactions = comment.reactions.filter(reaction => 
                reaction.emoji !== action.payload.emoji
              );
            }
          }
        });
      });

    // Toggle comment pin
    builder
      .addCase(toggleCommentPin.fulfilled, (state, action) => {
        const commentId = action.meta.arg;
        // Update the comment in all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          const commentIndex = state.comments[taskId].findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            state.comments[taskId][commentIndex] = action.payload;
          }
        });
      });

    // Toggle comment resolve
    builder
      .addCase(toggleCommentResolve.fulfilled, (state, action) => {
        const commentId = action.meta.arg;
        // Update the comment in all task comment arrays
        Object.keys(state.comments).forEach(taskId => {
          const commentIndex = state.comments[taskId].findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            state.comments[taskId][commentIndex] = action.payload;
          }
        });
      });
  }
});

// Export actions
export const {
  setCurrentTask,
  setCurrentBoard,
  setCurrentSpace,
  updateFilters,
  clearFilters,
  updateSort,
  updateSearchQuery,
  setSocketConnected,
  setDragState,
  startDragging,
  stopDragging,
  updateTaskRealTime,
  addTaskRealTime,
  removeTaskRealTime,
  moveTaskRealTime,
  updateColumnRealTime,
  addColumnRealTime,
  removeColumnRealTime,
  reorderColumnsRealTime,
  updateColumnPositionsRealTime
} = taskSlice.actions;

// Export reducer
export default taskSlice.reducer;

// Selectors
export const selectTasks = (state: { tasks: TaskState }) => state.tasks.tasks;
export const selectColumns = (state: { tasks: TaskState }) => state.tasks.columns;
export const selectBoards = (state: { tasks: TaskState }) => state.tasks.boards;
export const selectSpaces = (state: { tasks: TaskState }) => state.tasks.spaces;
export const selectCurrentTask = (state: { tasks: TaskState }) => state.tasks.currentTask;
export const selectCurrentBoard = (state: { tasks: TaskState }) => state.tasks.currentBoard;
export const selectCurrentSpace = (state: { tasks: TaskState }) => state.tasks.currentSpace;
export const selectLoading = (state: { tasks: TaskState }) => state.tasks.loading;
export const selectError = (state: { tasks: TaskState }) => state.tasks.error;
export const selectFilters = (state: { tasks: TaskState }) => state.tasks.filters;
export const selectSortBy = (state: { tasks: TaskState }) => state.tasks.sortBy;
export const selectSearchQuery = (state: { tasks: TaskState }) => state.tasks.searchQuery;
export const selectSocketConnected = (state: { tasks: TaskState }) => state.tasks.socketConnected;
export const selectDragState = (state: { tasks: TaskState }) => state.tasks.dragState;

// Computed selectors
export const selectTasksByColumn = (state: { tasks: TaskState }, columnId: string) => {
  return state.tasks.tasks.filter(task => task.column === columnId);
};

export const selectFilteredTasks = (state: { tasks: TaskState }) => {
  const { tasks, filters, searchQuery, sortBy } = state.tasks;
  
  let filteredTasks = [...tasks];
  
  // Apply status filter
  if (filters.status.length > 0) {
    filteredTasks = filteredTasks.filter(task => filters.status.includes(task.status));
  }
  
  // Apply priority filter
  if (filters.priority.length > 0) {
    filteredTasks = filteredTasks.filter(task => filters.priority.includes(task.priority));
  }
  
  // Apply assignee filter
  if (filters.assignee.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      task.assignees.some(assignee => filters.assignee.includes(assignee))
    );
  }
  
  // Apply tags filter
  if (filters.tags.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      task.tags.some(tag => filters.tags.includes(tag))
    );
  }
  
  // Apply search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  filteredTasks.sort((a, b) => {
    const aValue = a[sortBy.field];
    const bValue = b[sortBy.field];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortBy.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortBy.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
  
  return filteredTasks;
};
