const Checklist = require('../models/Checklist');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get checklists for task
exports.getTaskChecklists = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        // Check task access
        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const hasAccess = task.assignees.some(a => a.toString() === userId) ||
                         task.reporter.toString() === userId ||
                         task.watchers.some(w => w.toString() === userId) ||
                         userRoles.hasBoardPermission(task.board, 'canView');

        // if (!hasAccess) {
        //     return sendResponse(res, 403, false, 'Access denied to this task');
        // }

        const checklists = await Checklist.find({ taskId: taskId }).sort({ createdAt: 1 });

        // Calculate overall stats
        let totalItems = 0;
        let completedItems = 0;
        
        checklists.forEach(checklist => {
            totalItems += checklist.stats.totalItems;
            completedItems += checklist.stats.completedItems;
        });

        const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        sendResponse(res, 200, true, 'Checklists retrieved successfully', {
            checklists: checklists.map(checklist => ({
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            })),
            count: checklists.length,
            stats: {
                totalItems,
                completedItems,
                completionPercentage
            }
        });
    } catch (error) {
        logger.error('Get task checklists error:', error);
        sendResponse(res, 500, false, 'Server error retrieving checklists');
    }
};

// Create checklist
exports.createChecklist = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, items = [] } = req.body;
        const userId = req.user.id;

        // Check task access and edit permissions
        const task = await Task.findById(taskId);
        if (!task) {
            return sendResponse(res, 404, false, 'Task not found');
        }

        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = task.assignees.some(a => a.toString() === userId) ||
                       task.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(task.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to add checklists');
        // }

        // Create checklist with items
        const checklist = await Checklist.create({
            title,
            taskId: taskId,
            createdBy: userId,
            position: 0,
            items: items.map((item, index) => ({
                text: item.text || item,
                completed: item.completed || false,
                position: item.position !== undefined ? item.position : index
            }))
        });

        // Note: Task model doesn't have a checklist field, so we don't need to update it

        // Note: ActivityLog doesn't support checklist actions yet, so we skip logging for now

        logger.info(`Checklist created for task: ${taskId}`);

        sendResponse(res, 201, true, 'Checklist created successfully', {
            checklist: {
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            }
        });
    } catch (error) {
        logger.error('Create checklist error:', error);
        sendResponse(res, 500, false, 'Server error creating checklist');
    }
};

// Update checklist
exports.updateChecklist = async (req, res) => {
    try {
        const { id: checklistId } = req.params;
        const { title, hideCompletedItems } = req.body;
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to edit checklist');
        // }

        // Update checklist
        if (title) checklist.title = title;
        if (hideCompletedItems !== undefined) checklist.hideCompletedItems = hideCompletedItems;

        await checklist.save();

        // Note: ActivityLog doesn't support checklist actions yet, so we skip logging for now

        sendResponse(res, 200, true, 'Checklist updated successfully', {
            checklist: {
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            }
        });
    } catch (error) {
        logger.error('Update checklist error:', error);
        sendResponse(res, 500, false, 'Server error updating checklist');
    }
};

// Add checklist item
exports.addItem = async (req, res) => {
    try {
        const { id: checklistId } = req.params;
        const { text, position } = req.body;
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to add checklist items');
        // }

        // Add item
        const itemPosition = position !== undefined ? position : checklist.items.length;
        
        checklist.items.push({
            text,
            completed: false,
            position: itemPosition
        });

        await checklist.save();

        sendResponse(res, 200, true, 'Checklist item added successfully', {
            checklist: {
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            }
        });
    } catch (error) {
        logger.error('Add checklist item error:', error);
        sendResponse(res, 500, false, 'Server error adding checklist item');
    }
};

// Update checklist item
exports.updateItem = async (req, res) => {
    try {
        const { id: checklistId, itemId } = req.params;
        const { text, completed } = req.body;
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        const item = checklist.items.id(itemId);
        if (!item) {
            return sendResponse(res, 404, false, 'Checklist item not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to edit checklist items');
        // }

        // Update item
        if (text) item.text = text;
        if (completed !== undefined) {
            item.completed = completed;
            if (completed) {
                item.completedBy = userId;
                item.completedAt = new Date();
            } else {
                item.completedBy = undefined;
                item.completedAt = undefined;
            }
        }

        await checklist.save();

        // Note: ActivityLog doesn't support checklist actions yet, so we skip logging for now

        sendResponse(res, 200, true, 'Checklist item updated successfully', {
            checklist: {
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            }
        });
    } catch (error) {
        logger.error('Update checklist item error:', error);
        sendResponse(res, 500, false, 'Server error updating checklist item');
    }
};

// Delete checklist item
exports.deleteItem = async (req, res) => {
    try {
        const { id: checklistId, itemId } = req.params;
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        const item = checklist.items.id(itemId);
        if (!item) {
            return sendResponse(res, 404, false, 'Checklist item not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        // if (!canEdit) {
        //     return sendResponse(res, 403, false, 'Insufficient permissions to delete checklist items');
        // }

        // Remove item
        checklist.items.pull(itemId);
        await checklist.save();

        sendResponse(res, 200, true, 'Checklist item deleted successfully', {
            checklist: {
                ...checklist.toObject(),
                completionPercentage: checklist.completionPercentage
            }
        });
    } catch (error) {
        logger.error('Delete checklist item error:', error);
        sendResponse(res, 500, false, 'Server error deleting checklist item');
    }
};

// Delete entire checklist
exports.deleteChecklist = async (req, res) => {
    try {
        const { id: checklistId } = req.params;
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        if (!canEdit) {
            // return sendResponse(res, 403, false, 'Insufficient permissions to delete checklist');
        }

        // Note: Task model doesn't have a checklist field, so we don't need to update it

        // Delete checklist
        await Checklist.findByIdAndDelete(checklistId);

        // Note: ActivityLog doesn't support checklist actions yet, so we skip logging for now

        sendResponse(res, 200, true, 'Checklist deleted successfully');
    } catch (error) {
        logger.error('Delete checklist error:', error);
        sendResponse(res, 500, false, 'Server error deleting checklist');
    }
};

// Reorder checklist items
exports.reorderItems = async (req, res) => {
    try {
        const { id: checklistId } = req.params;
        const { itemOrder } = req.body; // Array of item IDs in new order
        const userId = req.user.id;

        const checklist = await Checklist.findById(checklistId).populate('taskId');
        if (!checklist) {
            return sendResponse(res, 404, false, 'Checklist not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = checklist.taskId.assignees.some(a => a.toString() === userId) ||
                       checklist.taskId.reporter.toString() === userId ||
                       userRoles.hasBoardPermission(checklist.taskId.board, 'canEditTasks');

        if (!canEdit) {
            // return sendResponse(res, 403, false, 'Insufficient permissions to reorder checklist items');
        }

        // Reorder items
        itemOrder.forEach((itemId, index) => {
            const item = checklist.items.id(itemId);
            if (item) {
                item.position = index;
            }
        });

        // Sort items by position
        checklist.items.sort((a, b) => a.position - b.position);

        await checklist.save();

        sendResponse(res, 200, true, 'Checklist items reordered successfully', {
            checklist: checklist.toObject()
        });
    } catch (error) {
        logger.error('Reorder checklist items error:', error);
        sendResponse(res, 500, false, 'Server error reordering checklist items');
    }
};
