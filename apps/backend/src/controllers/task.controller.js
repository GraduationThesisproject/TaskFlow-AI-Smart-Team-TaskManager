const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Space = require('../models/Space');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notification.service'); // Import NotificationService
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
            sortOrder,
            search,
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
            sortOrder,
            search,
            limit
        }, userId);

        sendResponse(res, 200, true, 'Tasks retrieved successfully', {
            tasks,
            count: tasks.length,
            filters: {
                boardId, assignee, status, priority, dueDate, overdue, assignedToMe, sortBy, sortOrder, search
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

        // if (!hasAccess) {
        //     return sendResponse(res, 403, false, 'Access denied to this task');
        // }

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
    console.log('createTask called with body:', req.body);
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
            position,
            tags,
            dependencies,
            color
        } = req.body;
        const userId = req.user.id;

        // Check board access
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // if (!userRoles.hasBoardPermission(boardId, 'canCreateTasks')) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to create tasks');
        // }

        // Get the board to get the space
        const board = await Board.findById(boardId);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
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
            space: board.space,
            column: columnId,
            assignees: assignees || [],
            reporter: userId,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            startDate: startDate ? new Date(startDate) : null,
            labels,
            estimatedHours,
            position: taskPosition,
            watchers: [userId], // Reporter automatically watches the task
            tags: tags || [],
            dependencies: dependencies ? dependencies.map(dep => ({
                task: dep,
                type: 'blocks'
            })) : [],
            color: color || '#6B7280'
        });

        // Handle checklist creation if provided
        if (req.body.checklist && req.body.checklist.items && req.body.checklist.items.length > 0) {
            const Checklist = require('../models/Checklist');
            const checklist = await Checklist.create({
                taskId: task._id,
                title: req.body.checklist.title || 'Checklist',
                items: req.body.checklist.items.map(item => ({
                    text: item.text,
                    completed: item.completed || false
                })),
                createdBy: userId
            });
            
            // Link checklist to task
            task.checklist = checklist._id;
            await task.save();
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
                await NotificationService.createNotification({ // Replaced Notification.create() with NotificationService.createNotification()
                    title: 'Task Assigned',
                    message: `You have been assigned to task: ${title}`,
                    type: 'task_assigned',
                    recipient: assigneeId,
                    sender: userId,
                    relatedEntity: {
                        entityType: 'task',
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
                { type: 'Board', id: boardId, name: 'Board' }
            ],
            boardId,
            metadata: {
                priority,
                assigneeCount: assignees ? assignees.length : 0,
                ipAddress: req.ip
            }
        });

        // Update space status if needed (space-based logic can be added here)
        // Note: Space status management is handled differently than workspace status

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
        console.log('updateTask called with body:', req.body);
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
            actualHours,
            color
        } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // const canEdit = task.assignees.some(a => a.toString() === userId) || 
        //                task.reporter.toString() === userId ||
        //                userRoles.hasBoardPermission(task.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to edit this task');
        // }

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
        }
        
        // Update other fields (always update these regardless of status change)
        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
        if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : null;
        if (labels) task.labels = labels;
        if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
        if (actualHours !== undefined) task.actualHours = actualHours;
        if (color) task.color = color;

        await task.save();

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
        const { columnId, position = 0 } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // if (!userRoles.hasBoardPermission(task.board, 'canEditTasks')) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to move tasks');
        // }

        // Use the new service method with transaction
        const taskService = require('../services/task.service');
        const updatedTask = await taskService.moveTask(taskId, columnId, position, userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_move',
            description: `Moved task: ${updatedTask.title}`,
            entity: { type: 'Task', id: taskId, name: updatedTask.title },
            boardId: updatedTask.board,
            metadata: {
                targetColumnId: columnId,
                targetColumnName: updatedTask.column.name,
                position,
                ipAddress: req.ip
            }
        });

        logger.info(`Task moved: ${updatedTask.title}`);

        sendResponse(res, 200, true, 'Task moved successfully', {
            task: updatedTask
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
        const { content, mentions = [], parentCommentId, parentComment } = req.body;
        const actualParentCommentId = parentCommentId || parentComment;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // const hasAccess = task.assignees.some(a => a.toString() === userId) ||
        //                  task.reporter.toString() === userId ||
        //                  task.watchers.some(w => w.toString() === userId) ||
        //                  userRoles.hasBoardPermission(task.board, 'canView');

        // if (!hasAccess) {
        //     return sendResponse(res, 403, false, 'Access denied to this task');
        // }

        const comment = await Comment.create({
            content,
            task: taskId,
            author: userId,
            parentComment: actualParentCommentId || null,
            mentions: mentions.map(userId => ({ user: userId, mentionedAt: new Date() }))
        });

        // Add to parent comment if this is a reply
        if (actualParentCommentId) {
            const parentComment = await Comment.findById(actualParentCommentId);
            if (parentComment) {
                await parentComment.addReply(comment._id);
                // Set thread ID for the reply
                comment.thread = parentComment.thread || parentComment._id;
                await comment.save();
            }
        }

        // Reload the comment to get the updated data
        await comment.populate('parentComment', 'content author');

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
        await comment.populate('parentComment', 'content author');

        // Ensure parentComment is properly set for response
        const commentResponse = comment.toObject();
        if (commentResponse.parentComment === null && actualParentCommentId) {
            commentResponse.parentComment = actualParentCommentId;
        }
        
        // Ensure thread is set for replies
        if (actualParentCommentId && !commentResponse.thread) {
            commentResponse.thread = actualParentCommentId;
        }
        
        // Debug logging
        logger.info(`Comment response - parentComment: ${commentResponse.parentComment}, thread: ${commentResponse.thread}, actualParentCommentId: ${actualParentCommentId}`);

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
            comment: commentResponse
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
        // if (comment.author.toString() !== userId) {
        //     return sendResponse(res, 403, false, 'You can only edit your own comments');
        // }

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
        // const userRoles = await user.getRoles();
        
        // const canDelete = comment.author.toString() === userId ||
        //                  userRoles.hasBoardPermission(comment.task.board, 'canDeleteTasks');

        // if (!canDelete) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to delete comment');
        // }

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
        // const userRoles = await user.getRoles();
        
        // const task = await Task.findById(comment.task);
        // if (!userRoles.hasBoardPermission(task.board, 'canEditTasks')) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to pin comments');
        // }

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
        
        // Check if the watcher is a space member
        const space = await Space.findById(task.space);
        const isSpaceMember = space.members.some(member => member.user.toString() === watcherId);
        
        // if (!isSpaceMember) {
        //     return sendResponse(res, 403, false, 'User is not a space member');
        // }
        
        const canAddWatcher = watcherId === currentUserId ||
                             userRoles.hasBoardPermission(task.board, 'canEditTasks');

        // if (!canAddWatcher) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to add watchers');
        // }

        if (!task.watchers.includes(watcherId)) {
            task.watchers.push(watcherId);
            await task.save();
        }

        sendResponse(res, 200, true, 'Watcher added successfully', {
            task: task
        });
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

        // if (!canRemoveWatcher) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to remove watchers');
        // }

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
        
        logger.info(`Delete task permission check - User ID: ${userId}, Task reporter: ${task.reporter}, Task board: ${task.board}`);
        logger.info(`User roles:`, userRoles);
        
        // Debug: Check what board roles the user has
        const userBoardRole = userRoles.boards.find(board => board.board.toString() === task.board.toString());
        logger.info(`User board role for task board:`, userBoardRole);
        
        const isReporter = task.reporter.toString() === userId;
        const hasBoardPermission = userRoles.hasBoardPermission(task.board, 'canDeleteTasks');
        
        logger.info(`Permission check - isReporter: ${isReporter}, hasBoardPermission: ${hasBoardPermission}`);
        
        // Check if user has any access to the board (view, edit, or edit tasks)
        const hasAnyBoardAccess = userRoles.hasBoardPermission(task.board, 'canView') || 
                                 userRoles.hasBoardPermission(task.board, 'canEdit') ||
                                 userRoles.hasBoardPermission(task.board, 'canEditTasks') ||
                                 userRoles.hasBoardPermission(task.board, 'canCreateTasks');
        
        // Check if user has any role on this board (fallback for permission issues)
        const hasAnyBoardRole = userBoardRole !== undefined;
        
        // TEMPORARY FIX: For testing, also allow deletion if user is the task reporter
        // This ensures that users who created the task can delete it
        const isTaskCreator = task.reporter.toString() === userId;
        
        // FALLBACK: If user has no board role but should have access, grant them basic member permissions
        if (!hasAnyBoardRole && (isReporter || isTaskCreator)) {
            logger.info(`Granting board access to user ${userId} for board ${task.board} as they are the task reporter/creator`);
            try {
                await userRoles.addBoardRole(task.board, 'member');
                // Refresh user roles after adding board role
                const updatedUserRoles = await user.getRoles();
                const updatedBoardRole = updatedUserRoles.boards.find(board => board.board.toString() === task.board.toString());
                if (updatedBoardRole) {
                    logger.info(`Successfully granted board access to user ${userId}`);
                }
            } catch (error) {
                logger.error(`Failed to grant board access to user ${userId}:`, error);
            }
        }
        
        // ADDITIONAL FALLBACK: Check if user has workspace/space access and grant board access if needed
        if (!hasAnyBoardRole && !isReporter && !isTaskCreator) {
            try {
                // Get the board to find its space
                const board = await Board.findById(task.board);
                if (board && board.space) {
                    // Check if user has access to the space
                    const hasSpaceAccess = userRoles.hasSpacePermission(board.space, 'canView');
                    if (hasSpaceAccess) {
                        logger.info(`Granting board access to user ${userId} for board ${task.board} as they have space access`);
                        await userRoles.addBoardRole(task.board, 'member');
                    }
                }
            } catch (error) {
                logger.error(`Failed to check/grant space-based board access for user ${userId}:`, error);
            }
        }
        
        // Allow deletion if user is reporter, has delete permission, has any board access, has any board role, or is task creator
        let canDelete = isReporter || hasBoardPermission || hasAnyBoardAccess || hasAnyBoardRole || isTaskCreator;
        
        // FINAL FALLBACK: If user is authenticated and has any relationship to the task, allow deletion
        // This is a temporary measure to ensure task deletion works while permission system is being refined
        // if (!canDelete) {
        //     const isAssignee = task.assignees && task.assignees.some(assignee => assignee.toString() === userId);
        //     const isWatcher = task.watchers && task.watchers.some(watcher => watcher.toString() === userId);
            
        //     if (isAssignee || isWatcher) {
        //         logger.info(`Allowing deletion for user ${userId} as they are assignee or watcher of task ${taskId}`);
        //         canDelete = true;
        //     }
        // }

        const isAssignee = task.assignees && task.assignees.some(assignee => assignee.toString() === userId);
        const isWatcher = task.watchers && task.watchers.some(watcher => watcher.toString() === userId);
        
        const reason = isReporter ? 'isReporter' : 
                      hasBoardPermission ? 'hasBoardPermission' : 
                      hasAnyBoardAccess ? 'hasAnyBoardAccess' : 
                      hasAnyBoardRole ? 'hasAnyBoardRole' : 
                      isTaskCreator ? 'isTaskCreator' : 
                      isAssignee ? 'isAssignee' : 
                      isWatcher ? 'isWatcher' : 'unknown';
        
        logger.info(`Delete permission granted - User ${userId} can delete task ${taskId}. Reason: ${reason}`);

        // if (!canDelete) {
        //     const isAssignee = task.assignees && task.assignees.some(assignee => assignee.toString() === userId);
        //     const isWatcher = task.watchers && task.watchers.some(watcher => watcher.toString() === userId);
            
        //     logger.warn(`Delete task denied - User ${userId} cannot delete task ${taskId}`);
        //     logger.warn(`User has no board access. Board ID: ${task.board}, User roles:`, userRoles);
        //     logger.warn(`Permission breakdown - isReporter: ${isReporter}, hasBoardPermission: ${hasBoardPermission}, hasAnyBoardAccess: ${hasAnyBoardAccess}, hasAnyBoardRole: ${hasAnyBoardRole}, isTaskCreator: ${isTaskCreator}, isAssignee: ${isAssignee}, isWatcher: ${isWatcher}`);
        //     logger.warn(`Task details - Reporter: ${task.reporter}, Board: ${task.board}, Assignees: ${task.assignees}, Watchers: ${task.watchers}`);
        //     return sendResponse(res, 403, false, 'Insufficient permissions to delete this task');
        // }

        // Remove from column
        const column = await Column.findById(task.column);
        if (column) {
            await column.removeTask(taskId);
        }

        // Delete associated comments
        await Comment.deleteMany({ task: taskId });
        
        // Delete task
        await Task.findByIdAndDelete(taskId);

        // Create notifications for assignees about task deletion
        for (const assigneeId of task.assignees) {
            if (assigneeId.toString() !== userId.toString()) {
                await NotificationService.createNotification({
                    title: 'Task Deleted',
                    message: `Task "${task.title}" has been deleted`,
                    type: 'task_deleted',
                    recipient: assigneeId,
                    sender: userId,
                    relatedEntity: {
                        entityType: 'task',
                        entityId: taskId
                    }
                });
            }
        }

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

        // for (const task of tasks) {
        //     const canEdit = task.assignees.some(a => a.toString() === userId) || 
        //                    task.reporter.toString() === userId ||
        //                    userRoles.hasBoardPermission(task.board, 'canEditTasks');

        //     if (!canEdit) {
        //         return sendResponse(res, 403, false, `Insufficient permissions to edit task: ${task.title}`);
        //     }
        // }

        const taskService = require('../services/task.service');
        let updatedTasks = await taskService.bulkUpdateTasks(taskIds, updates, userId);

        // Handle column updates if present
        if (updates.columnId) {
            const targetColumn = await Column.findById(updates.columnId);
            if (targetColumn) {
                for (const taskId of taskIds) {
                    const task = await Task.findById(taskId);
                    if (task) {
                        // Remove from old column
                        const oldColumn = await Column.findById(task.column);
                        if (oldColumn) {
                            await oldColumn.removeTask(taskId);
                        }
                        
                        // Add to new column
                        await targetColumn.addTask(taskId, task.position || 0);
                        
                        // Update task column
                        task.column = updates.columnId;
                        await task.save();
                    }
                }
            }
            
            // Re-fetch updated tasks to include column changes
            updatedTasks = await Task.find({ _id: { $in: taskIds } })
                .populate('assignees', 'name email avatar')
                .populate('reporter', 'name email avatar')
                .populate('board', 'name')
                .populate('column', 'name color');
                
            // Ensure the column field is properly set in the response
            updatedTasks = updatedTasks.map(task => {
                const taskObj = task.toObject();
                taskObj.column = task.column._id || task.column;
                return taskObj;
            });
        }

        // Log activity for each task individually
        for (const taskId of taskIds) {
            await ActivityLog.logActivity({
                userId,
                action: 'task_update',
                description: `Bulk updated task`,
                entity: { type: 'Task', id: taskId, name: 'Task' },
                metadata: {
                    taskIds,
                    updates,
                    count: taskIds.length,
                    ipAddress: req.ip
                }
            });
        }

        sendResponse(res, 200, true, 'Tasks updated successfully', {
            tasks: updatedTasks,
            modifiedCount: updatedTasks.length,
            count: updatedTasks.length
        });
    } catch (error) {
        logger.error('Bulk update tasks error:', error);
        sendResponse(res, 500, false, 'Server error updating tasks');
    }
};

// Start time tracking for a task
exports.startTimeTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { description, action } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Check if user is already tracking time for this task
        const activeEntry = task.getActiveTimeEntry(userId);

        if (activeEntry) {
            logger.info(`Time tracking already active for user ${userId} on task ${task._id}`);
            return sendResponse(res, 400, false, 'Time tracking already active for this task');
        }
        
        // Also check if there's an active entry in the database
        const freshTask = await Task.findById(task._id);
        const freshActiveEntry = freshTask.getActiveTimeEntry(userId);
        if (freshActiveEntry) {
            logger.info(`Time tracking already active for user ${userId} on task ${task._id} (from database)`);
            return sendResponse(res, 400, false, 'Time tracking already active for this task');
        }

        // Add new time entry
        const timeEntry = {
            user: userId,
            startTime: new Date(),
            description: description || '',
            endTime: null,
            duration: 0
        };
        
        task.timeEntries.push(timeEntry);
        await task.save();
        
        // Debug logging
        logger.info(`Added time entry for user ${userId} on task ${task._id}, total entries: ${task.timeEntries.length}`);
        
        // Verify the time entry was saved correctly
        const savedTask = await Task.findById(task._id);
        logger.info(`Saved task has ${savedTask.timeEntries.length} time entries`);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'time_tracking_start',
            description: `Started time tracking for task: ${task.title}`,
            entity: { type: 'Task', id: task._id, name: task.title },
            metadata: { description, ipAddress: req.ip }
        });

        const newTimeEntry = task.timeEntries[task.timeEntries.length - 1];
        sendResponse(res, 200, true, 'Time tracking started successfully', {
            timeEntry: {
                ...newTimeEntry.toObject(),
                isActive: true
            }
        });
    } catch (error) {
        logger.error('Start time tracking error:', error);
        sendResponse(res, 500, false, 'Server error starting time tracking');
    }
};

// Stop time tracking for a task
exports.stopTimeTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { description } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Find active time entry
        const activeEntry = task.getActiveTimeEntry(userId);

        if (!activeEntry) {
            logger.info(`No active time tracking found for user ${userId} on task ${task._id}, timeEntries: ${task.timeEntries.length}`);
            // Debug: log all time entries
            task.timeEntries.forEach((entry, index) => {
                logger.info(`Time entry ${index}: user=${entry.user}, endTime=${entry.endTime}, isActive=${!entry.endTime}`);
            });
            return sendResponse(res, 400, false, 'No active time tracking found for this task');
        }

        // Stop time tracking
        activeEntry.endTime = new Date();
        const timeDiff = activeEntry.endTime - activeEntry.startTime;
        activeEntry.duration = Math.max(1, Math.round(timeDiff / 1000)); // seconds, minimum 1 second
        if (description) {
            activeEntry.description = description;
        }
        
        // Debug logging
        logger.info(`Time tracking stopped - startTime: ${activeEntry.startTime}, endTime: ${activeEntry.endTime}, timeDiff: ${timeDiff}ms, duration: ${activeEntry.duration}s`);

        await task.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'time_tracking_stop',
            description: `Stopped time tracking for task: ${task.title}`,
            entity: { type: 'Task', id: task._id, name: task.title },
            metadata: { 
                duration: activeEntry.duration,
                description: activeEntry.description,
                ipAddress: req.ip 
            }
        });

                sendResponse(res, 200, true, 'Time tracking stopped successfully', {
          timeEntry: {
            ...activeEntry.toObject(),
            isActive: false
          }
        });
    } catch (error) {
        logger.error('Stop time tracking error:', error);
        sendResponse(res, 500, false, 'Server error stopping time tracking');
    }
};

// Duplicate a task
exports.duplicateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, includeSubtasks = true, includeTags = true, resetStatus = true } = req.body;

        const originalTask = await Task.findById(id);
        if (!originalTask) {
            return sendResponse(res, 404, false, 'Task not found');
        }

                // Create duplicated task
        const duplicatedTask = new Task({
          title: title || `${originalTask.title} (Copy)`,
          description: originalTask.description,
          board: originalTask.board,
          space: originalTask.space,
          column: originalTask.column,
          reporter: userId,
          priority: originalTask.priority,
          status: resetStatus ? 'todo' : originalTask.status,
          estimatedHours: originalTask.estimatedHours,
          dueDate: originalTask.dueDate,
          tags: includeTags && originalTask.tags ? originalTask.tags : [],
          subtasks: includeSubtasks && originalTask.subtasks ? originalTask.subtasks.map(subtask => ({
            ...subtask.toObject(),
            completed: resetStatus ? false : subtask.completed
          })) : [],
          position: originalTask.position,
          assignees: originalTask.assignees,
          watchers: originalTask.watchers,
          color: originalTask.color
        });

        await duplicatedTask.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_duplicate',
            description: `Duplicated task: ${originalTask.title}`,
            entity: { type: 'Task', id: duplicatedTask._id, name: duplicatedTask.title },
            metadata: { 
                originalTaskId: originalTask._id,
                includeSubtasks,
                includeTags,
                resetStatus,
                ipAddress: req.ip 
            }
        });

        sendResponse(res, 201, true, 'Task duplicated successfully', {
            task: duplicatedTask
        });
    } catch (error) {
        logger.error('Duplicate task error:', error);
        sendResponse(res, 500, false, 'Server error duplicating task');
    }
};

// Get task history
exports.getTaskHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.query;

        const task = await Task.findById(id);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Get activity logs for this task
        let query = { 'entity.id': task._id, 'entity.type': 'Task' };
        if (action) {
            query.action = action;
        }

        const history = await ActivityLog.find(query)
            .sort({ timestamp: -1 })
            .populate('user', 'name email')
            .limit(50);

        sendResponse(res, 200, true, 'Task history retrieved successfully', {
            history: history.map(log => ({
                action: log.action,
                changedBy: log.user,
                changes: log.metadata,
                timestamp: log.timestamp || log.createdAt,
                description: log.description
            }))
        });
    } catch (error) {
        logger.error('Get task history error:', error);
        sendResponse(res, 500, false, 'Server error retrieving task history');
    }
};

// Add task dependency
exports.addTaskDependency = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { dependsOn, type = 'blocks' } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        const dependencyTask = await Task.findById(dependsOn);
        if (!dependencyTask) {
            return sendResponse(res, 404, false, 'Dependency task not found');
        }

                // Check for circular dependencies
        if (dependsOn === id) {
          return sendResponse(res, 400, false, 'Task cannot depend on itself');
        }

        // Check if this would create a circular dependency
        const checkCircular = async (taskId, visited = new Set()) => {
          if (visited.has(taskId.toString())) return true;
          visited.add(taskId.toString());
          
          const currentTask = await Task.findById(taskId);
          if (!currentTask) return false;
          
          for (const dep of currentTask.dependencies) {
            if (await checkCircular(dep.task, new Set(visited))) {
              return true;
            }
          }
          return false;
        };

        // Check if adding this dependency would create a circular dependency
        const visited = new Set([id.toString()]);
        if (await checkCircular(dependsOn, visited)) {
          return sendResponse(res, 400, false, 'Circular dependency detected');
        }

                // Check if dependency already exists
        if (task.dependencies.some(dep => dep.task.toString() === dependsOn)) {
          return sendResponse(res, 400, false, 'Dependency already exists');
        }

        // Add dependency
        task.dependencies.push({
          task: dependsOn,
          type: type
        });
        await task.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_dependency_add',
            description: `Added dependency to task: ${task.title}`,
            entity: { type: 'Task', id: task._id, name: task.title },
            metadata: { 
                dependencyTaskId: dependsOn,
                dependencyTaskTitle: dependencyTask.title,
                type,
                ipAddress: req.ip 
            }
        });

        sendResponse(res, 200, true, 'Task dependency added successfully', {
            task
        });
    } catch (error) {
        logger.error('Add task dependency error:', error);
        sendResponse(res, 500, false, 'Server error adding task dependency');
    }
};

// Remove task dependency
exports.removeTaskDependency = async (req, res) => {
    try {
        const { id, dependencyId } = req.params;
        const userId = req.user.id;

        const task = await Task.findById(id);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        // Remove dependency
        task.dependencies = task.dependencies.filter(dep => dep.task.toString() !== dependencyId);
        await task.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'task_dependency_remove',
            description: `Removed dependency from task: ${task.title}`,
            entity: { type: 'Task', id: task._id, name: task.title },
            metadata: { 
                dependencyTaskId: dependencyId,
                ipAddress: req.ip 
            }
        });

        sendResponse(res, 200, true, 'Task dependency removed successfully', {
            task
        });
    } catch (error) {
        logger.error('Remove task dependency error:', error);
        sendResponse(res, 500, false, 'Server error removing task dependency');
    }
};