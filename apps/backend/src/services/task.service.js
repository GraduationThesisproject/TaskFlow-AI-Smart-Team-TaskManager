const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

class TaskService {
    // Get task statistics
    async getTaskStats(filters = {}) {
        const matchStage = { archived: false, ...filters };

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

    // Get tasks with advanced filtering
    async getFilteredTasks(filters, userId) {
        let query = { archived: false };

        // Apply filters
        if (filters.boardId) query.board = filters.boardId;
        if (filters.assignee) query.assignees = filters.assignee;
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.dueDate) {
            const date = new Date(filters.dueDate);
            query.dueDate = {
                $gte: date,
                $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
            };
        }
        if (filters.overdue) {
            query.dueDate = { $lt: new Date() };
            query.status = { $ne: 'completed' };
        }
        if (filters.assignedToMe) {
            query.assignees = userId;
        }

        const tasks = await Task.find(query)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('board', 'name')
            .populate('column', 'name color')
            .sort(this.getSortOptions(filters.sortBy))
            .limit(parseInt(filters.limit) || 50);

        return tasks;
    }

    // Get sort options based on sort criteria
    getSortOptions(sortBy) {
        switch (sortBy) {
            case 'dueDate':
                return { dueDate: 1 };
            case 'priority':
                return { priority: -1, createdAt: -1 };
            case 'updated':
                return { updatedAt: -1 };
            case 'created':
                return { createdAt: -1 };
            default:
                return { position: 1, createdAt: -1 };
        }
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
                    entityType: 'Task',
                    entityId: taskId
                }
            });
        }

        // Log analytics
        await Analytics.create({
            project: task.project,
            user: assignedBy,
            type: 'task_updated',
            metadata: {
                taskId,
                assigneeCount: assigneeIds.length
            }
        });

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
                            entityType: 'Task',
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
        await Analytics.create({
            project: task.project,
            user: userId,
            type: 'task_updated',
            metadata: {
                taskId,
                previousStatus,
                newStatus
            }
        });

        return task;
    }

    // Add comment to task with mentions
    async addTaskComment(taskId, content, authorId, mentions = []) {
        const comment = await Comment.create({
            content,
            task: taskId,
            author: authorId,
            mentions
        });

        // Notify mentioned users
        for (const mentionId of mentions) {
            await Notification.create({
                title: 'You were mentioned',
                message: `You were mentioned in a comment on task`,
                type: 'mention',
                recipient: mentionId,
                sender: authorId,
                relatedEntity: {
                    entityType: 'Comment',
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
                    entityType: 'Task',
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
            status: { $ne: 'completed' },
            archived: false
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
            status: { $in: ['todo', 'in-progress'] },
            archived: false
        }).limit(3);

        // Get tasks due soon
        const tasksDueSoon = await Task.find({
            assignees: userId,
            dueDate: { $gte: now, $lte: tomorrow },
            status: { $ne: 'completed' },
            archived: false
        }).limit(2);

        const recommendations = [
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
        ];

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Bulk update tasks
    async bulkUpdateTasks(taskIds, updates, userId) {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        
        if (tasks.length !== taskIds.length) {
            throw new Error('Some tasks not found');
        }

        const updatedTasks = [];

        for (const task of tasks) {
            Object.assign(task, updates);
            
            if (updates.status === 'completed' && task.status !== 'completed') {
                task.completedAt = new Date();
            }

            await task.save();
            updatedTasks.push(task);

            // Log analytics for each task
            await Analytics.create({
                project: task.project,
                user: userId,
                type: 'task_updated',
                metadata: {
                    taskId: task._id,
                    bulkUpdate: true
                }
            });
        }

        return updatedTasks;
    }
}

module.exports = new TaskService();
