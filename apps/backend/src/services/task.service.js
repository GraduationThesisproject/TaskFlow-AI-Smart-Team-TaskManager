const mongoose = require('mongoose');
const Task = require('../models/Task');
const Column = require('../models/Column');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

class TaskService {
    // Get task statistics
    async getTaskStats(filters = {}) {
        const matchStage = { archivedAt: null, ...filters };

        const stats = await Task.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    todo: {
                        $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'completed'] }
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

        return stats[0] || {
            total: 0,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0
        };
    }

    // Get tasks with advanced filtering, pagination, and totals
    async getFilteredTasks(filters, userId) {
        const { page = 1, limit = 25 } = filters;
        const allowedSort = ['createdAt', 'updatedAt', 'priority', 'dueDate', 'position', 'title'];
        const sortBy = allowedSort.includes(filters.sortBy) ? filters.sortBy : 'createdAt';
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

        const match = { archivedAt: null };
        
        // Apply filters with proper ObjectId casting
        if (filters.boardId) match.board = new mongoose.Types.ObjectId(filters.boardId);
        if (filters.columnId) match.column = new mongoose.Types.ObjectId(filters.columnId);
        if (filters.assignee) match.assignees = new mongoose.Types.ObjectId(filters.assignee);
        if (filters.status) match.status = filters.status;
        if (filters.priority) match.priority = filters.priority;
        
        if (filters.dueDate) {
            const date = new Date(filters.dueDate);
            match.dueDate = {
                $gte: date,
                $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
            };
        }
        
        if (filters.overdue) {
            match.dueDate = { $lt: new Date() };
            match.status = { $ne: 'done' };
        }
        
        if (filters.assignedToMe) {
            match.assignees = new mongoose.Types.ObjectId(userId);
        }
        
        // Handle search query
        if (filters.search) {
            match.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignees',
                    foreignField: '_id',
                    as: 'assignees'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reporter',
                    foreignField: '_id',
                    as: 'reporter'
                }
            },
            {
                $lookup: {
                    from: 'boards',
                    localField: 'board',
                    foreignField: '_id',
                    as: 'board'
                }
            },
            {
                $lookup: {
                    from: 'columns',
                    localField: 'column',
                    foreignField: '_id',
                    as: 'column'
                }
            },
            {
                $addFields: {
                    reporter: { $arrayElemAt: ['$reporter', 0] },
                    board: { $arrayElemAt: ['$board', 0] },
                    column: { $arrayElemAt: ['$column', 0] }
                }
            },
            { $sort: { [sortBy]: sortOrder } },
            {
                $facet: {
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit }
                    ],
                    meta: [{ $count: 'total' }]
                }
            }
        ];

        const [{ data, meta }] = await Task.aggregate(pipeline);
        return { 
            data, 
            total: meta?.[0]?.total ?? 0, 
            page, 
            limit,
            totalPages: Math.ceil((meta?.[0]?.total ?? 0) / limit)
        };
    }

    // Get sort options based on sort criteria
    getSortOptions(sortBy, sortOrder) {
        if (!sortBy) {
            return { position: 1, createdAt: -1 };
        }

        const sortFields = sortBy.split(',');
        const sortOrders = sortOrder ? sortOrder.split(',') : [];
        
        const sortOptions = {};
        
        sortFields.forEach((field, index) => {
            const order = sortOrders[index] === 'asc' ? 1 : -1;
            
            switch (field.trim()) {
                case 'dueDate':
                    sortOptions.dueDate = order;
                    break;
                case 'priority':
                    // Use custom priority sorting
                    sortOptions.priorityOrder = order;
                    break;
                case 'updated':
                    sortOptions.updatedAt = order;
                    break;
                case 'created':
                    sortOptions.createdAt = order;
                    break;
                case 'position':
                    sortOptions.position = order;
                    break;
                default:
                    sortOptions[field.trim()] = order;
            }
        });
        
        // Add default sort if no valid fields
        if (Object.keys(sortOptions).length === 0) {
            sortOptions.position = 1;
            sortOptions.createdAt = -1;
        }
        
        return sortOptions;
    }

    // Assign task to users
    async assignTask(taskId, assigneeIds, assignedBy) {
        const task = await Task.findById(taskId);
        
        if (!task) {
            throw new Error('Task not found');
        }

        const previousAssignees = [...task.assignees];
        task.assignees = assigneeIds;
        await task.save();

        // Create notifications for new assignees
        const newAssignees = assigneeIds.filter(
            id => !previousAssignees.includes(id)
        );

        for (const assigneeId of newAssignees) {
            await Notification.create({
                title: 'Task Assigned',
                message: `You have been assigned to task: ${task.title}`,
                type: 'task_assigned',
                recipient: assigneeId,
                sender: assignedBy,
                relatedEntity: {
                    entityType: 'task',
                    entityId: taskId
                }
            });
        }

        // Log analytics
        // await Analytics.create({
        //     scopeType: 'space',
        //     scopeId: task.space,
        //     kind: 'task_updated',
        //     data: {
        //         taskId,
        //         assigneeCount: assigneeIds.length
        //     }
        // });

        return task;
    }

    // Update task status with side effects
    async updateTaskStatus(taskId, newStatus, userId) {
        const task = await Task.findById(taskId);
        
        if (!task) {
            throw new Error('Task not found');
        }

        const previousStatus = task.status;
        task.status = newStatus;

        // Handle completion
        if (newStatus === 'completed' && previousStatus !== 'completed') {
            task.completedAt = new Date();
            
            // Notify watchers and assignees
            const recipients = [...new Set([...task.assignees, ...task.watchers])];
            for (const recipientId of recipients) {
                if (recipientId.toString() !== userId) {
                    await Notification.create({
                        title: 'Task Completed',
                        message: `Task "${task.title}" has been completed`,
                        type: 'task_completed',
                        recipient: recipientId,
                        sender: userId,
                        relatedEntity: {
                            entityType: 'task',
                            entityId: taskId
                        }
                    });
                }
            }
        } else if (previousStatus === 'completed' && newStatus !== 'completed') {
            task.completedAt = undefined;
        }

        await task.save();

        // Log analytics
        // await Analytics.create({
        //     scopeType: 'space',
        //     scopeId: task.space,
        //     kind: 'task_updated',
        //     data: {
        //         taskId,
        //         previousStatus,
        //         newStatus
        //     }
        // });

        return task;
    }

    // Add comment to task with mentions
    async addTaskComment(taskId, content, authorId, mentions = []) {
        const comment = await Comment.create({
            content,
            task: taskId,
            author: authorId,
            mentions: mentions.map(userId => ({ user: userId, mentionedAt: new Date() }))
        });

        // Notify mentioned users
        for (const mentionId of mentions) {
            await Notification.create({
                title: 'You were mentioned',
                message: `You were mentioned in a comment on task`,
                type: 'comment_mentioned',
                recipient: mentionId,
                sender: authorId,
                relatedEntity: {
                    entityType: 'comment',
                    entityId: comment._id
                }
            });
        }

        // Notify task assignees and watchers (excluding author)
        const task = await Task.findById(taskId);
        const recipients = [...new Set([...task.assignees, ...task.watchers])]
            .filter(id => id.toString() !== authorId);

        for (const recipientId of recipients) {
            await Notification.create({
                title: 'New Comment',
                message: `New comment added to task: ${task.title}`,
                type: 'comment_added',
                recipient: recipientId,
                sender: authorId,
                relatedEntity: {
                    entityType: 'task',
                    entityId: taskId
                }
            });
        }

        await comment.populate('author', 'name email avatar');
        await comment.populate('mentions', 'name email avatar');

        return comment;
    }

    // Get task activity timeline
    async getTaskActivity(taskId) {
        const task = await Task.findById(taskId);
        const comments = await Comment.find({ task: taskId })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        // Combine task updates and comments into activity timeline
        const activities = [
            {
                type: 'task_created',
                timestamp: task.createdAt,
                user: task.reporter,
                data: { title: task.title }
            },
            ...comments.map(comment => ({
                type: 'comment_added',
                timestamp: comment.createdAt,
                user: comment.author,
                data: { content: comment.content }
            }))
        ];

        // Add status change activities (if you track status history)
        if (task.completedAt) {
            activities.push({
                type: 'task_completed',
                timestamp: task.completedAt,
                data: { status: 'completed' }
            });
        }

        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Get overdue tasks for user
    async getOverdueTasks(userId) {
        const overdueTasks = await Task.find({
            assignees: userId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'done' },
            archivedAt: null
        })
        .populate('board', 'name')
        .sort({ dueDate: 1 });

        return overdueTasks;
    }

    // Get task recommendations for user
    async getTaskRecommendations(userId, limit = 5) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Get high priority tasks assigned to user
        const highPriorityTasks = await Task.find({
            assignees: userId,
            priority: 'high',
            status: { $in: ['todo', 'in_progress'] },
            archivedAt: null
        }).limit(3);

        // Get tasks due soon
        const tasksDueSoon = await Task.find({
            assignees: userId,
            dueDate: { $gte: now, $lte: tomorrow },
            status: { $ne: 'done' },
            archivedAt: null
        }).limit(2);

        const recommendations = {
            suggestedTasks: [
                ...highPriorityTasks.map(task => ({
                    task,
                    reason: 'High priority task',
                    score: 10
                })),
                ...tasksDueSoon.map(task => ({
                    task,
                    reason: 'Due soon',
                    score: 8
                }))
            ],
            optimizations: [
                'Consider grouping similar tasks together',
                'Prioritize tasks with approaching deadlines',
                'Break down large tasks into smaller subtasks'
            ],
            patterns: {
                highPriorityCount: highPriorityTasks.length,
                dueSoonCount: tasksDueSoon.length,
                totalRecommendations: highPriorityTasks.length + tasksDueSoon.length
            },
            personalized: true
        };

        return recommendations;
    }

    // Move task with transaction and proper automation handling
    async moveTask(taskId, targetColumnId, position, userId) {
        const session = await Task.db.startSession();
        
        try {
            return await session.withTransaction(async () => {
                const task = await Task.findById(taskId).session(session);
                if (!task) {
                    throw new Error('Task not found');
                }

                const sourceColumn = await Column.findById(task.column).session(session);
                const targetColumn = await Column.findById(targetColumnId).session(session);
                
                if (!targetColumn) {
                    throw new Error('Target column not found');
                }

                // Remove from source column
                if (sourceColumn) {
                    await sourceColumn.removeTask(taskId);
                }

                // Add to target column at specified position
                await targetColumn.addTask(taskId, position);

                // Update task properties
                task.column = targetColumnId;
                task.position = position;
                task.movedAt = new Date();

                // Handle column automation - treat mapping as object, not Map
                const mapping = targetColumn.settings?.automation?.statusMapping || {};
                if (targetColumn.settings?.automation?.autoUpdateStatus && mapping[targetColumn.name]) {
                    task.status = mapping[targetColumn.name];
                }

                await task.save({ session });

                // Populate task for response
                await task.populate('assignees', 'name email avatar');
                await task.populate('reporter', 'name email avatar');
                await task.populate('board', 'name');
                await task.populate('column', 'name color');

                return task;
            });
        } finally {
            session.endSession();
        }
    }

    // Bulk update tasks
    async bulkUpdateTasks(taskIds, updates, userId) {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        
        if (tasks.length !== taskIds.length) {
            throw new Error('Some tasks not found');
        }

        const updatedTasks = [];
        const updatesToApply = { ...updates };

        for (const task of tasks) {
            // Handle column change separately
            if (updatesToApply.columnId) {
                task.column = updatesToApply.columnId;
                delete updatesToApply.columnId;
            }
            
            // Apply other updates
            Object.assign(task, updatesToApply);
            
            if (updatesToApply.status === 'done' && task.status !== 'done') {
                task.completedAt = new Date();
            }

            await task.save();
            updatedTasks.push(task);

            // Log analytics for each task
            // await Analytics.create({
            //     space: task.space,
            //     user: userId,
            //     type: 'task_updated',
            //     metadata: {
            //         taskId: task._id,
            //         bulkUpdate: true
            //     }
            // });
        }

        return updatedTasks;
    }
}

module.exports = new TaskService();
