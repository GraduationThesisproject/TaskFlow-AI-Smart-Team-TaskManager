const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Board = require('../models/Board');
const Column = require('../models/Column');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all tasks with advanced filtering
exports.getTasks = async (req, res) => {
    try {
        const { 
            boardId, 
            assignee, 
            status, 
            priority, 
            dueDate,
            overdue,
            assignedToMe,
            sortBy,
            limit = 50,
            page = 1
        } = req.query;
        const userId = req.user.id;

        // Use task service for advanced filtering
        const taskService = require('../services/task.service');
        const tasks = await taskService.getFilteredTasks({
            boardId,
            assignee,
            status,
            priority,
            dueDate,
            overdue: overdue === 'true',
            assignedToMe: assignedToMe === 'true',
            sortBy,
            limit
        }, userId);

        sendResponse(res, 200, true, 'Tasks retrieved successfully', {
            tasks,
            count: tasks.length,
            filters: {
                boardId, assignee, status, priority, dueDate, overdue, assignedToMe, sortBy
            }
        });
    } catch (error) {
        logger.error('Get tasks error:', error);
        sendResponse(res, 500, false, 'Server error retrieving tasks');
    }
};

// Get single task with full details
exports.getTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const userId = req.user.id;

        const task = await Task.findById(taskId)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('board', 'name type')
            .populate('column', 'name color')
            .populate('checklist')
            .populate('watchers', 'name email avatar');

        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check access (user must be assignee, reporter, watcher, or have board access)
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const hasAccess = task.assignees.some(assignee => assignee._id.toString() === userId) ||
                         task.reporter._id.toString() === userId ||
                         task.watchers.some(watcher => watcher._id.toString() === userId) ||
                         userRoles.hasBoardPermission(task.board._id, 'canView');

        if (!hasAccess) {
            return sendResponse(res, 403, false, 'Access denied to this task');
        }

        // Get comments for this task
        const comments = await Comment.findByTask(taskId);

        // Get task activity
        const taskService = require('../services/task.service');
        const activity = await taskService.getTaskActivity(taskId);

        const taskData = {
            ...task.toObject(),
            comments,
            activity,
            canEdit: task.assignees.some(a => a._id.toString() === userId) || 
                    task.reporter._id.toString() === userId ||
                    userRoles.hasBoardPermission(task.board._id, 'canEditTasks')
        };

        sendResponse(res, 200, true, 'Task retrieved successfully', {
            task: taskData
        });
    } catch (error) {
        logger.error('Get task error:', error);
        sendResponse(res, 500, false, 'Server error retrieving task');
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            boardId, 
            columnId, 
            assignees, 
            priority, 
            dueDate,
            startDate,
            labels,
            estimatedHours,
            position 
        } = req.body;
        const userId = req.user.id;

        // Check board access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasBoardPermission(boardId, 'canCreateTasks')) {
            return sendResponse(res, 403, false, 'Insufficient permissions to create tasks');
        }

        // Get the column and check WIP limits
        const column = await Column.findById(columnId);
        if (!column) {
            return sendResponse(res, 404, false, 'Column not found');
        }

        if (!column.canAddTask()) {
            return sendResponse(res, 400, false, 'Column WIP limit reached');
        }

        // Get the next position if not provided
        let taskPosition = position;
        if (taskPosition === undefined) {
            taskPosition = column.taskIds.length;
        }

        const task = await Task.create({
            title,
            description,
            board: boardId,
            column: columnId,
            assignees: assignees || [],
            reporter: userId,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            startDate: startDate ? new Date(startDate) : null,
            labels,
            estimatedHours,
            position: taskPosition,
            watchers: [userId] // Reporter automatically watches the task
        });

        // Handle file attachments if present
        if (req.uploadedFiles && req.uploadedFiles.length > 0) {
            const File = require('../models/File');
            
            for (const uploadedFile of req.uploadedFiles) {
                const file = await File.create({
                    publicId: uploadedFile.publicId,
                    url: uploadedFile.url,
                    secureUrl: uploadedFile.url,
                    originalName: uploadedFile.originalName,
                    mimeType: uploadedFile.mimeType,
                    size: uploadedFile.size,
                    format: uploadedFile.format,
                    resourceType: uploadedFile.resourceType,
                    category: 'task_attachment',
                    uploadedBy: userId
                });

                await file.attachTo('Task', task._id);

                task.attachments.push({
                    filename: file.publicId,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    size: file.size,
                    url: file.url,
                    uploadedBy: userId,
                    uploadedAt: new Date()
                });
            }
        }

        // Add task to column
        await column.addTask(task._id, taskPosition);

        await task.populate('assignees', 'name email avatar');
        await task.populate('reporter', 'name email avatar');

        // Create notifications for assignees
        for (const assigneeId of assignees || []) {
            if (assigneeId !== userId) {
                await Notification.create({
                    title: 'Task Assigned',
                    message: `You have been assigned to task: ${title}`,
                    type: 'task_assigned',
                    recipient: assigneeId,
                    sender: userId,
                    relatedEntity: {
                        entityType: 'Task',
                        entityId: task._id
                    }
                });
            }
        }

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_create',
            description: `Created task: ${title}`,
            entity: { type: 'Task', id: task._id, name: title },
            relatedEntities: [
                { type: 'Board', id: boardId, name: 'Board' },
                { type: 'Column', id: columnId, name: column.name }
            ],
            boardId,
            metadata: {
                priority,
                assigneeCount: assignees ? assignees.length : 0,
                ipAddress: req.ip
            }
        });

        logger.info(`Task created: ${title}`);

        sendResponse(res, 201, true, 'Task created successfully', {
            task: task.toObject()
        });
    } catch (error) {
        logger.error('Create task error:', error);
        sendResponse(res, 500, false, 'Server error creating task');
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { 
            title, 
            description, 
            assignees, 
            priority, 
            status, 
            dueDate,
            startDate,
            labels,
            estimatedHours,
            actualHours 
        } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = task.assignees.some(a => a.toString() === userId) || 
                       task.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(task.board, 'canEditTasks');

        if (!canEdit) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit this task');
        }

        // Store old values for audit
        const oldValues = {
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignees: [...task.assignees]
        };

        // Handle assignee changes
        if (assignees && JSON.stringify(assignees) !== JSON.stringify(task.assignees.map(a => a.toString()))) {
            const taskService = require('../services/task.service');
            await taskService.assignTask(taskId, assignees, userId);
        }

        // Handle status changes
        if (status && status !== task.status) {
            const taskService = require('../services/task.service');
            await taskService.updateTaskStatus(taskId, status, userId);
        } else {
            // Update other fields
            if (title) task.title = title;
            if (description) task.description = description;
            if (priority) task.priority = priority;
            if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
            if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : null;
            if (labels) task.labels = labels;
            if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
            if (actualHours !== undefined) task.actualHours = actualHours;

            await task.save();
        }

        await task.populate('assignees', 'name email avatar');
        await task.populate('reporter', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_update',
            description: `Updated task: ${task.title}`,
            entity: { type: 'Task', id: taskId, name: task.title },
            boardId: task.board,
            metadata: {
                oldValues,
                newValues: { title, status, priority },
                ipAddress: req.ip
            }
        });

        logger.info(`Task updated: ${task.title}`);

        sendResponse(res, 200, true, 'Task updated successfully', {
            task: task.toObject()
        });
    } catch (error) {
        logger.error('Update task error:', error);
        sendResponse(res, 500, false, 'Server error updating task');
    }
};

// Move task to different column
exports.moveTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { columnId, position } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasBoardPermission(task.board, 'canEditTasks')) {
            return sendResponse(res, 403, false, 'Insufficient permissions to move tasks');
        }

        const [sourceColumn, targetColumn] = await Promise.all([
            Column.findById(task.column),
            Column.findById(columnId)
        ]);

        if (!targetColumn) {
            return sendResponse(res, 404, false, 'Target column not found');
        }

        // Check WIP limits
        if (!targetColumn.canAddTask()) {
            return sendResponse(res, 400, false, 'Target column WIP limit reached');
        }

        // Remove from source column
        if (sourceColumn) {
            await sourceColumn.removeTask(taskId);
        }

        // Add to target column
        await targetColumn.addTask(taskId, position);

        // Update task
        task.column = columnId;
        task.position = position;

        // Auto-update status based on column automation settings
        if (targetColumn.settings.automation.statusUpdate.enabled) {
            const targetStatus = targetColumn.settings.automation.statusUpdate.targetStatus;
            if (targetStatus) {
                const taskService = require('../services/task.service');
                await taskService.updateTaskStatus(taskId, targetStatus, userId);
            }
        }

        await task.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_move',
            description: `Moved task: ${task.title}`,
            entity: { type: 'Task', id: taskId, name: task.title },
            boardId: task.board,
            metadata: {
                sourceColumnId: sourceColumn ? sourceColumn._id : null,
                targetColumnId: columnId,
                sourceColumnName: sourceColumn ? sourceColumn.name : null,
                targetColumnName: targetColumn.name,
                position,
                ipAddress: req.ip
            }
        });

        logger.info(`Task moved: ${task.title}`);

        sendResponse(res, 200, true, 'Task moved successfully', {
            task: task.toObject(),
            sourceColumn: sourceColumn ? sourceColumn.name : null,
            targetColumn: targetColumn.name
        });
    } catch (error) {
        logger.error('Move task error:', error);
        sendResponse(res, 500, false, 'Server error moving task');
    }
};

// Add comment to task
exports.addComment = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { content, mentions = [], parentCommentId } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const hasAccess = task.assignees.some(a => a.toString() === userId) ||
                         task.reporter.toString() === userId ||
                         task.watchers.some(w => w.toString() === userId) ||
                         userRoles.hasBoardPermission(task.board, 'canView');

        if (!hasAccess) {
            return sendResponse(res, 403, false, 'Access denied to this task');
        }

        const comment = await Comment.create({
            content,
            task: taskId,
            author: userId,
            parentComment: parentCommentId || null,
            mentions: mentions.map(userId => ({ user: userId }))
        });

        // Add to parent comment if this is a reply
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment) {
                await parentComment.addReply(comment._id);
            }
        }

        // Handle file attachments if present
        if (req.uploadedFiles && req.uploadedFiles.length > 0) {
            const File = require('../models/File');
            
            for (const uploadedFile of req.uploadedFiles) {
                const file = await File.create({
                    publicId: uploadedFile.publicId,
                    url: uploadedFile.url,
                    secureUrl: uploadedFile.url,
                    originalName: uploadedFile.originalName,
                    mimeType: uploadedFile.mimeType,
                    size: uploadedFile.size,
                    format: uploadedFile.format,
                    resourceType: uploadedFile.resourceType,
                    category: 'comment_attachment',
                    uploadedBy: userId
                });

                await file.attachTo('Comment', comment._id);

                comment.attachments.push({
                    filename: file.publicId,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    size: file.size,
                    url: file.url
                });
            }
        }

        // Add task service for advanced comment handling
        const taskService = require('../services/task.service');
        await taskService.addTaskComment(taskId, content, userId, mentions);

        await comment.populate('author', 'name email avatar');
        await comment.populate('mentions.user', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'comment_create',
            description: `Added comment to task: ${task.title}`,
            entity: { type: 'Comment', id: comment._id, name: 'Comment' },
            relatedEntities: [{ type: 'Task', id: taskId, name: task.title }],
            boardId: task.board,
            metadata: {
                mentionCount: mentions.length,
                isReply: !!parentCommentId,
                ipAddress: req.ip
            }
        });

        logger.info(`Comment added to task: ${taskId}`);

        sendResponse(res, 201, true, 'Comment added successfully', {
            comment: comment.toObject()
        });
    } catch (error) {
        logger.error('Add comment error:', error);
        sendResponse(res, 500, false, 'Server error adding comment');
    }
};

// Update comment
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check if user is the author
        if (comment.author.toString() !== userId) {
            return sendResponse(res, 403, false, 'You can only edit your own comments');
        }

        // Update comment using model method
        await comment.edit(content);

        await comment.populate('author', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'comment_update',
            description: 'Updated comment',
            entity: { type: 'Comment', id: commentId, name: 'Comment' },
            metadata: { ipAddress: req.ip }
        });

        sendResponse(res, 200, true, 'Comment updated successfully', {
            comment: comment.toObject()
        });
    } catch (error) {
        logger.error('Update comment error:', error);
        sendResponse(res, 500, false, 'Server error updating comment');
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check permissions - author or admin can delete
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canDelete = comment.author.toString() === userId ||
                         userRoles.hasBoardPermission(comment.task.board, 'canDeleteTasks');

        if (!canDelete) {
            return sendResponse(res, 403, false, 'Insufficient permissions to delete comment');
        }

        await Comment.findByIdAndDelete(commentId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'comment_delete',
            description: 'Deleted comment',
            entity: { type: 'Comment', id: commentId, name: 'Comment' },
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

        sendResponse(res, 200, true, 'Comment deleted successfully');
    } catch (error) {
        logger.error('Delete comment error:', error);
        sendResponse(res, 500, false, 'Server error deleting comment');
    }
};

// Add reaction to comment
exports.addReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        await comment.addReaction(userId, emoji);

        sendResponse(res, 200, true, 'Reaction added successfully', {
            reactions: comment.reactions
        });
    } catch (error) {
        logger.error('Add reaction error:', error);
        sendResponse(res, 500, false, 'Server error adding reaction');
    }
};

// Remove reaction from comment
exports.removeReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        await comment.removeReaction(userId, emoji);

        sendResponse(res, 200, true, 'Reaction removed successfully', {
            reactions: comment.reactions
        });
    } catch (error) {
        logger.error('Remove reaction error:', error);
        sendResponse(res, 500, false, 'Server error removing reaction');
    }
};

// Pin/unpin comment
exports.toggleCommentPin = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check permissions - need board admin access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const task = await Task.findById(comment.task);
        if (!userRoles.hasBoardPermission(task.board, 'canEditTasks')) {
            return sendResponse(res, 403, false, 'Insufficient permissions to pin comments');
        }

        if (comment.isPinned) {
            await comment.unpin();
        } else {
            await comment.pin(userId);
        }

        sendResponse(res, 200, true, comment.isPinned ? 'Comment pinned successfully' : 'Comment unpinned successfully', {
            comment: {
                id: comment._id,
                isPinned: comment.isPinned,
                pinnedAt: comment.pinnedAt
            }
        });
    } catch (error) {
        logger.error('Toggle comment pin error:', error);
        sendResponse(res, 500, false, 'Server error toggling comment pin');
    }
};

// Resolve/unresolve comment
exports.toggleCommentResolve = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        if (comment.isResolved) {
            await comment.unresolve();
        } else {
            await comment.resolve(userId);
        }

        sendResponse(res, 200, true, comment.isResolved ? 'Comment resolved successfully' : 'Comment unresolved successfully', {
            comment: {
                id: comment._id,
                isResolved: comment.isResolved,
                resolvedAt: comment.resolvedAt
            }
        });
    } catch (error) {
        logger.error('Toggle comment resolve error:', error);
        sendResponse(res, 500, false, 'Server error toggling comment resolve');
    }
};

// Add watcher to task
exports.addWatcher = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { userId: watcherId } = req.body;
        const currentUserId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Users can add themselves or admins can add others
        const user = await User.findById(currentUserId);
        const userRoles = await user.getRoles();
        
        const canAddWatcher = watcherId === currentUserId ||
                             userRoles.hasBoardPermission(task.board, 'canEditTasks');

        if (!canAddWatcher) {
            return sendResponse(res, 403, false, 'Insufficient permissions to add watchers');
        }

        if (!task.watchers.includes(watcherId)) {
            task.watchers.push(watcherId);
            await task.save();
        }

        sendResponse(res, 200, true, 'Watcher added successfully');
    } catch (error) {
        logger.error('Add watcher error:', error);
        sendResponse(res, 500, false, 'Server error adding watcher');
    }
};

// Remove watcher from task
exports.removeWatcher = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const { userId: watcherId } = req.body;
        const currentUserId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Users can remove themselves or admins can remove others
        const user = await User.findById(currentUserId);
        const userRoles = await user.getRoles();
        
        const canRemoveWatcher = watcherId === currentUserId ||
                                userRoles.hasBoardPermission(task.board, 'canEditTasks');

        if (!canRemoveWatcher) {
            return sendResponse(res, 403, false, 'Insufficient permissions to remove watchers');
        }

        task.watchers = task.watchers.filter(w => w.toString() !== watcherId);
        await task.save();

        sendResponse(res, 200, true, 'Watcher removed successfully');
    } catch (error) {
        logger.error('Remove watcher error:', error);
        sendResponse(res, 500, false, 'Server error removing watcher');
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const { id: taskId } = req.params;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canDelete = task.reporter.toString() === userId ||
                         userRoles.hasBoardPermission(task.board, 'canDeleteTasks');

        if (!canDelete) {
            return sendResponse(res, 403, false, 'Insufficient permissions to delete this task');
        }

        // Remove from column
        const column = await Column.findById(task.column);
        if (column) {
            await column.removeTask(taskId);
        }

        // Delete associated comments
        await Comment.deleteMany({ task: taskId });
        
        // Delete task
        await Task.findByIdAndDelete(taskId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_delete',
            description: `Deleted task: ${task.title}`,
            entity: { type: 'Task', id: taskId, name: task.title },
            boardId: task.board,
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

        logger.info(`Task deleted: ${task.title}`);

        sendResponse(res, 200, true, 'Task deleted successfully');
    } catch (error) {
        logger.error('Delete task error:', error);
        sendResponse(res, 500, false, 'Server error deleting task');
    }
};

// Get task recommendations for user
exports.getTaskRecommendations = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const userId = req.user.id;

        const taskService = require('../services/task.service');
        const recommendations = await taskService.getTaskRecommendations(userId, parseInt(limit));

        sendResponse(res, 200, true, 'Task recommendations retrieved successfully', {
            recommendations,
            count: recommendations.length
        });
    } catch (error) {
        logger.error('Get task recommendations error:', error);
        sendResponse(res, 500, false, 'Server error retrieving task recommendations');
    }
};

// Get overdue tasks for user
exports.getOverdueTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        const taskService = require('../services/task.service');
        const overdueTasks = await taskService.getOverdueTasks(userId);

        sendResponse(res, 200, true, 'Overdue tasks retrieved successfully', {
            tasks: overdueTasks,
            count: overdueTasks.length
        });
    } catch (error) {
        logger.error('Get overdue tasks error:', error);
        sendResponse(res, 500, false, 'Server error retrieving overdue tasks');
    }
};

// Bulk update tasks
exports.bulkUpdateTasks = async (req, res) => {
    try {
        const { taskIds, updates } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return sendResponse(res, 400, false, 'Task IDs array is required');
        }

        // Check permissions for all tasks
        const tasks = await Task.find({ _id: { $in: taskIds } });
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        for (const task of tasks) {
            const canEdit = task.assignees.some(a => a.toString() === userId) || 
                           task.reporter.toString() === userId ||
                           userRoles.hasBoardPermission(task.board, 'canEditTasks');

            if (!canEdit) {
                return sendResponse(res, 403, false, `Insufficient permissions to edit task: ${task.title}`);
            }
        }

        const taskService = require('../services/task.service');
        const updatedTasks = await taskService.bulkUpdateTasks(taskIds, updates, userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_update',
            description: `Bulk updated ${taskIds.length} tasks`,
            entity: { type: 'Task', id: null, name: 'Multiple Tasks' },
            metadata: {
                taskIds,
                updates,
                count: taskIds.length,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Tasks updated successfully', {
            tasks: updatedTasks,
            count: updatedTasks.length
        });
    } catch (error) {
        logger.error('Bulk update tasks error:', error);
        sendResponse(res, 500, false, 'Server error updating tasks');
    }
};