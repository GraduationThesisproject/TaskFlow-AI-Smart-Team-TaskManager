// ============================================================================
// SECTION 3: ROUTES
// ============================================================================

// ============================================================================
// 3.1 SPACE ROUTES
// ============================================================================
const express = require('express');
const spaceRouter = express.Router();
const spaceController = require('../controllers/space.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateSpace } = require('../middlewares/validation.middleware');

// Apply auth middleware to all space routes
spaceRouter.use(authMiddleware);

// Get all spaces for workspace
spaceRouter.get('/workspace/:workspaceId', spaceController.getSpaces);

// Get single space
spaceRouter.get('/:id', spaceController.getSpace);

// Create new space
spaceRouter.post('/', validateSpace, spaceController.createSpace);

// Update space
spaceRouter.put('/:id', validateSpace, spaceController.updateSpace);

// Delete space
spaceRouter.delete('/:id', spaceController.deleteSpace);

// Get space members
spaceRouter.get('/:id/members', spaceController.getSpaceMembers);

// Add space member
spaceRouter.post('/:id/members', spaceController.addSpaceMember);

// Remove space member
spaceRouter.delete('/:id/members/:memberId', spaceController.removeSpaceMember);

// ============================================================================
// 3.2 BOARD ROUTES
// ============================================================================
const boardRouter = express.Router();
const boardController = require('../controllers/board.controller');
const { validateBoard } = require('../middlewares/validation.middleware');

// Apply auth middleware to all board routes
boardRouter.use(authMiddleware);

// Get all boards for space
boardRouter.get('/space/:spaceId', boardController.getBoards);

// Get single board with columns and tasks
boardRouter.get('/:id', boardController.getBoard);

// Create new board
boardRouter.post('/', validateBoard, boardController.createBoard);

// Update board
boardRouter.put('/:id', validateBoard, boardController.updateBoard);

// Delete board
boardRouter.delete('/:id', boardController.deleteBoard);

// Column management
boardRouter.post('/:id/columns', boardController.addColumn);
boardRouter.put('/:id/columns/:columnId', boardController.updateColumn);
boardRouter.delete('/:id/columns/:columnId', boardController.deleteColumn);
boardRouter.put('/:id/columns/reorder', boardController.reorderColumns);

// ============================================================================
// 3.3 TASK ROUTES
// ============================================================================
const taskRouter = express.Router();
const taskController = require('../controllers/task.controller');
const { validateTask } = require('../middlewares/validation.middleware');

// Apply auth middleware to all task routes
taskRouter.use(authMiddleware);

// Get all tasks with filtering
taskRouter.get('/', taskController.getTasks);

// Get single task
taskRouter.get('/:id', taskController.getTask);

// Create new task
taskRouter.post('/', validateTask, taskController.createTask);

// Update task
taskRouter.put('/:id', validateTask, taskController.updateTask);

// Move task
taskRouter.put('/:id/move', taskController.moveTask);

// Delete task
taskRouter.delete('/:id', taskController.deleteTask);

// Comment management
taskRouter.post('/:id/comments', taskController.addComment);
taskRouter.put('/:id/comments/:commentId', taskController.updateComment);
taskRouter.delete('/:id/comments/:commentId', taskController.deleteComment);

// ============================================================================
// 3.4 USER ROUTES
// ============================================================================
const userRouter = express.Router();
const userController = require('../controllers/user.controller');

// Apply auth middleware to all user routes
userRouter.use(authMiddleware);

// Get all users (for autocomplete)
userRouter.get('/', userController.getAllUsers);

// Get user by ID
userRouter.get('/:id', userController.getUserById);

// Search users
userRouter.get('/search', userController.searchUsers);

// Export all routers
module.exports = {
  spaceRouter,
  boardRouter,
  taskRouter,
  userRouter
};

// ============================================================================
// SECTION 4: SERVICES
// ============================================================================

// ============================================================================
// 4.1 TASK SERVICE
// ============================================================================
const Task = require('../models/Task');
const Column = require('../models/Column');
const Board = require('../models/Board');
const User = require('../models/User');
const logger = require('../config/logger');

class TaskService {
  // Get filtered tasks with advanced querying
  static async getFilteredTasks(filters, userId) {
    try {
      const query = { isArchived: { $ne: true } };

      // Apply filters
      if (filters.boardId) {
        query.board = filters.boardId;
      }

      if (filters.columnId) {
        query.column = filters.columnId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.assignee) {
        query.assignees = filters.assignee;
      }

      if (filters.assignedToMe) {
        query.assignees = userId;
      }

      if (filters.overdue) {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: 'done' };
      }

      if (filters.dueDate) {
        const date = new Date(filters.dueDate);
        query.dueDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      // Build aggregation pipeline
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'assignees',
            foreignField: '_id',
            as: 'assigneeDetails'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reporter',
            foreignField: '_id',
            as: 'reporterDetails'
          }
        },
        {
          $lookup: {
            from: 'columns',
            localField: 'column',
            foreignField: '_id',
            as: 'columnDetails'
          }
        }
      ];

      // Add search functionality
      if (filters.search) {
        pipeline.unshift({
          $match: {
            $or: [
              { title: { $regex: filters.search, $options: 'i' } },
              { description: { $regex: filters.search, $options: 'i' } }
            ]
          }
        });
      }

      // Add sorting
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
        pipeline.push({ $sort: { [filters.sortBy]: sortOrder } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      // Add pagination
      if (filters.limit) {
        pipeline.push({ $limit: parseInt(filters.limit) });
      }

      const tasks = await Task.aggregate(pipeline);
      return tasks;
    } catch (error) {
      logger.error('TaskService.getFilteredTasks error:', error);
      throw error;
    }
  }

  // Get task statistics
  static async getTaskStats(boardId, userId) {
    try {
      const stats = await Task.aggregate([
        { $match: { board: boardId, isArchived: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todo: {
              $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            review: {
              $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] }
            },
            done: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', 'done'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            assignedToMe: {
              $sum: {
                $cond: [
                  { $in: [userId, '$assignees'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        overdue: 0,
        assignedToMe: 0
      };
    } catch (error) {
      logger.error('TaskService.getTaskStats error:', error);
      throw error;
    }
  }

  // Move task between columns
  static async moveTask(taskId, targetColumnId, position, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const sourceColumn = await Column.findById(task.column);
      const targetColumn = await Column.findById(targetColumnId);

      if (!targetColumn) {
        throw new Error('Target column not found');
      }

      // Check WIP limits
      if (!targetColumn.canAddTask()) {
        throw new Error('Target column WIP limit reached');
      }

      // Remove from source column
      if (sourceColumn) {
        await sourceColumn.removeTask(taskId);
      }

      // Add to target column
      await targetColumn.addTask(taskId, position);

      // Update task
      task.column = targetColumnId;
      task.position = position;
      task.movedAt = new Date();

      // Auto-update status based on column automation
      if (targetColumn.settings.automation.autoUpdateStatus) {
        const statusMapping = targetColumn.settings.automation.statusMapping;
        if (statusMapping && statusMapping.has(targetColumn.name)) {
          task.status = statusMapping.get(targetColumn.name);
        }
      }

      await task.save();

      return task;
    } catch (error) {
      logger.error('TaskService.moveTask error:', error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkUpdateTasks(taskIds, updates, userId) {
    try {
      const result = await Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      return result;
    } catch (error) {
      logger.error('TaskService.bulkUpdateTasks error:', error);
      throw error;
    }
  }

  static async bulkDeleteTasks(taskIds, userId) {
    try {
      // Remove tasks from columns first
      const tasks = await Task.find({ _id: { $in: taskIds } });
      
      for (const task of tasks) {
        const column = await Column.findById(task.column);
        if (column) {
          await column.removeTask(task._id);
        }
      }

      // Soft delete tasks
      const result = await Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: { isArchived: true, updatedAt: new Date() } }
      );

      return result;
    } catch (error) {
      logger.error('TaskService.bulkDeleteTasks error:', error);
      throw error;
    }
  }
}

module.exports = TaskService;

// ============================================================================
// 4.2 BOARD SERVICE
// ============================================================================
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Space = require('../models/Space');
const logger = require('../config/logger');

class BoardService {
  // Get board with full details
  static async getBoardWithDetails(boardId, userId) {
    try {
      const board = await Board.findById(boardId)
        .populate('space', 'name')
        .populate('owner', 'name email avatar');

      if (!board) {
        throw new Error('Board not found');
      }

      // Get columns with task counts
      const columns = await Column.find({ board: boardId })
        .sort({ position: 1 });

      // Get tasks grouped by column
      const tasks = await Task.find({ 
        board: boardId,
        isArchived: { $ne: true }
      })
      .populate('assignees', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ position: 1 });

      // Group tasks by column
      const tasksByColumn = tasks.reduce((acc, task) => {
        const columnId = task.column.toString();
        if (!acc[columnId]) {
          acc[columnId] = [];
        }
        acc[columnId].push(task);
        return acc;
      }, {});

      // Add task count to columns
      const columnsWithTasks = columns.map(column => ({
        ...column.toObject(),
        tasks: tasksByColumn[column._id.toString()] || [],
        taskCount: (tasksByColumn[column._id.toString()] || []).length
      }));

      return {
        board,
        columns: columnsWithTasks,
        tasks
      };
    } catch (error) {
      logger.error('BoardService.getBoardWithDetails error:', error);
      throw error;
    }
  }

  // Create board with default columns
  static async createBoardWithDefaults(boardData, userId) {
    try {
      const board = await Board.create({
        ...boardData,
        owner: userId,
        members: [{
          user: userId,
          role: 'owner',
          joinedAt: new Date()
        }]
      });

      // Create default columns based on board type
      const defaultColumns = this.getDefaultColumns(boardData.type || 'kanban');
      const columns = await Column.insertMany(
        defaultColumns.map((col, index) => ({
          ...col,
          board: board._id,
          position: index
        }))
      );

      return {
        board,
        columns
      };
    } catch (error) {
      logger.error('BoardService.createBoardWithDefaults error:', error);
      throw error;
    }
  }

  // Get board statistics
  static async getBoardStats(boardId) {
    try {
      const stats = await Task.aggregate([
        { $match: { board: boardId, isArchived: { $ne: true } } },
        {
          $group: {
            _id: '$column',
            taskCount: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', 'done'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('BoardService.getBoardStats error:', error);
      throw error;
    }
  }

  // Get default columns for board type
  static getDefaultColumns(boardType) {
    switch (boardType) {
      case 'kanban':
        return [
          { name: 'To Do', color: '#e2e8f0', isDefault: true },
          { name: 'In Progress', color: '#fef3c7', isDefault: false },
          { name: 'Done', color: '#d1fae5', isDefault: false }
        ];
      case 'list':
        return [
          { name: 'Backlog', color: '#e2e8f0', isDefault: true },
          { name: 'In Progress', color: '#fef3c7', isDefault: false },
          { name: 'Review', color: '#fbbf24', isDefault: false },
          { name: 'Done', color: '#d1fae5', isDefault: false }
        ];
      case 'timeline':
        return [
          { name: 'Planning', color: '#e2e8f0', isDefault: true },
          { name: 'Development', color: '#fef3c7', isDefault: false },
          { name: 'Testing', color: '#fbbf24', isDefault: false },
          { name: 'Deployment', color: '#d1fae5', isDefault: false }
        ];
      default:
        return [
          { name: 'To Do', color: '#e2e8f0', isDefault: true },
          { name: 'Done', color: '#d1fae5', isDefault: false }
        ];
    }
  }
}

module.exports = BoardService;

// ============================================================================
// 4.3 SPACE SERVICE
// ============================================================================
const Space = require('../models/Space');
const Board = require('../models/Board');
const User = require('../models/User');
const logger = require('../config/logger');

class SpaceService {
  // Get space with statistics
  static async getSpaceWithStats(spaceId, userId) {
    try {
      const space = await Space.findById(spaceId)
        .populate('members.user', 'name email avatar')
        .populate('owner', 'name email avatar');

      if (!space) {
        throw new Error('Space not found');
      }

      // Get boards with task counts
      const boards = await Board.find({ 
        space: spaceId,
        isArchived: { $ne: true }
      }).populate('columns');

      // Get space statistics
      const stats = await Board.aggregate([
        { $match: { space: spaceId, isArchived: { $ne: true } } },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'board',
            as: 'tasks'
          }
        },
        {
          $group: {
            _id: null,
            totalBoards: { $sum: 1 },
            totalTasks: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    cond: { $ne: ['$$this.isArchived', true] }
                  }
                }
              }
            },
            completedTasks: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    cond: { $eq: ['$$this.status', 'done'] }
                  }
                }
              }
            }
          }
        }
      ]);

      return {
        space,
        boards,
        stats: stats[0] || {
          totalBoards: 0,
          totalTasks: 0,
          completedTasks: 0
        }
      };
    } catch (error) {
      logger.error('SpaceService.getSpaceWithStats error:', error);
      throw error;
    }
  }

  // Add member to space with role
  static async addMemberToSpace(spaceId, userId, role, addedBy) {
    try {
      const space = await Space.findById(spaceId);
      if (!space) {
        throw new Error('Space not found');
      }

      // Check if user is already a member
      const existingMember = space.members.find(
        member => member.user.toString() === userId
      );

      if (existingMember) {
        throw new Error('User is already a member of this space');
      }

      // Add member
      space.members.push({
        user: userId,
        role: role || 'member',
        permissions: this.getDefaultPermissions(role),
        joinedAt: new Date()
      });

      await space.save();

      return space;
    } catch (error) {
      logger.error('SpaceService.addMemberToSpace error:', error);
      throw error;
    }
  }

  // Get default permissions for role
  static getDefaultPermissions(role) {
    switch (role) {
      case 'owner':
        return ['view', 'edit', 'delete', 'manage_members', 'manage_boards'];
      case 'admin':
        return ['view', 'edit', 'manage_members', 'manage_boards'];
      case 'member':
        return ['view', 'edit'];
      case 'viewer':
        return ['view'];
      default:
        return ['view'];
    }
  }
}

module.exports = SpaceService;

// ============================================================================
// SECTION 5: SOCKET EVENTS
// ============================================================================

// ============================================================================
// 5.1 SOCKET SERVICE
// ============================================================================
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

class SocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Socket authenticated: ${socket.user.email}`);

      // Join board room
      socket.on('join:board', (data) => {
        const { boardId } = data;
        socket.join(`board:${boardId}`);
        logger.info(`User ${socket.user.email} joined board ${boardId}`);
      });

      // Leave board room
      socket.on('leave:board', (data) => {
        const { boardId } = data;
        socket.leave(`board:${boardId}`);
        logger.info(`User ${socket.user.email} left board ${boardId}`);
      });

      // Join space room
      socket.on('join:space', (data) => {
        const { spaceId } = data;
        socket.join(`space:${spaceId}`);
        logger.info(`User ${socket.user.email} joined space ${spaceId}`);
      });

      // Leave space room
      socket.on('leave:space', (data) => {
        const { spaceId } = data;
        socket.leave(`space:${spaceId}`);
        logger.info(`User ${socket.user.email} left space ${spaceId}`);
      });

      // Task events
      socket.on('task:create', (data) => {
        this.broadcastToBoard(data.boardId, 'task:created', data.task);
      });

      socket.on('task:update', (data) => {
        this.broadcastToBoard(data.boardId, 'task:updated', data.task);
      });

      socket.on('task:delete', (data) => {
        this.broadcastToBoard(data.boardId, 'task:deleted', data.taskId);
      });

      socket.on('task:move', (data) => {
        this.broadcastToBoard(data.boardId, 'task:moved', data.task);
      });

      // Column events
      socket.on('column:create', (data) => {
        this.broadcastToBoard(data.boardId, 'column:created', data.column);
      });

      socket.on('column:update', (data) => {
        this.broadcastToBoard(data.boardId, 'column:updated', data.column);
      });

      socket.on('column:delete', (data) => {
        this.broadcastToBoard(data.boardId, 'column:deleted', data.columnId);
      });

      socket.on('column:reorder', (data) => {
        this.broadcastToBoard(data.boardId, 'column:reordered', data.columns);
      });

      // Comment events
      socket.on('comment:add', (data) => {
        this.broadcastToBoard(data.boardId, 'comment:added', data.comment);
      });

      socket.on('comment:update', (data) => {
        this.broadcastToBoard(data.boardId, 'comment:updated', data.comment);
      });

      socket.on('comment:delete', (data) => {
        this.broadcastToBoard(data.boardId, 'comment:deleted', data.commentId);
      });

      // Disconnect
      socket.on('disconnect', () => {
        logger.info(`User ${socket.user.email} disconnected`);
      });
    });
  }

  // Broadcast to board room
  broadcastToBoard(boardId, event, data) {
    this.io.to(`board:${boardId}`).emit(event, data);
  }

  // Broadcast to space room
  broadcastToSpace(spaceId, event, data) {
    this.io.to(`space:${spaceId}`).emit(event, data);
  }

  // Broadcast to specific user
  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketService;

// ============================================================================
// 5.2 SOCKET EVENT EMITTERS
// ============================================================================
class SocketEventEmitter {
  constructor(socketService) {
    this.socketService = socketService;
  }

  // Task events
  emitTaskCreated(task) {
    this.socketService.broadcastToBoard(task.board, 'task:created', task);
  }

  emitTaskUpdated(task) {
    this.socketService.broadcastToBoard(task.board, 'task:updated', task);
  }

  emitTaskDeleted(taskId, boardId) {
    this.socketService.broadcastToBoard(boardId, 'task:deleted', taskId);
  }

  emitTaskMoved(task) {
    this.socketService.broadcastToBoard(task.board, 'task:moved', task);
  }

  // Column events
  emitColumnCreated(column) {
    this.socketService.broadcastToBoard(column.board, 'column:created', column);
  }

  emitColumnUpdated(column) {
    this.socketService.broadcastToBoard(column.board, 'column:updated', column);
  }

  emitColumnDeleted(columnId, boardId) {
    this.socketService.broadcastToBoard(boardId, 'column:deleted', columnId);
  }

  emitColumnsReordered(columns, boardId) {
    this.socketService.broadcastToBoard(boardId, 'column:reordered', columns);
  }

  // Board events
  emitBoardUpdated(board) {
    this.socketService.broadcastToSpace(board.space, 'board:updated', board);
  }

  emitBoardDeleted(boardId, spaceId) {
    this.socketService.broadcastToSpace(spaceId, 'board:deleted', boardId);
  }

  // Space events
  emitSpaceUpdated(space) {
    this.socketService.broadcastToSpace(space._id, 'space:updated', space);
  }

  // Comment events
  emitCommentAdded(comment, boardId) {
    this.socketService.broadcastToBoard(boardId, 'comment:added', comment);
  }

  emitCommentUpdated(comment, boardId) {
    this.socketService.broadcastToBoard(boardId, 'comment:updated', comment);
  }

  emitCommentDeleted(commentId, boardId) {
    this.socketService.broadcastToBoard(boardId, 'comment:deleted', commentId);
  }

  // Notification events
  emitNotification(notification, userId) {
    this.socketService.broadcastToUser(userId, 'notification:new', notification);
  }
}

module.exports = SocketEventEmitter;
