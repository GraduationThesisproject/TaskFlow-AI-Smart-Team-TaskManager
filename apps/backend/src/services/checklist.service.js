const Checklist = require('../models/Checklist');
const Task = require('../models/Task');
const NotificationService = require('./notification.service');
const logger = require('../config/logger');

class ChecklistService {

    // Create checklist for task
    static async createTaskChecklist(taskId, checklistData, userId) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const checklist = await Checklist.create({
                ...checklistData,
                task: taskId
            });

            // Add checklist reference to task
            task.checklist.push(checklist._id);
            await task.save();

            // Notify task assignees about new checklist
            await NotificationService.notifyTaskEvent(
                'checklist_added',
                task,
                userId,
                {
                    metadata: {
                        checklistTitle: checklist.title,
                        itemCount: checklist.items.length
                    }
                }
            );

            return checklist;
        } catch (error) {
            logger.error('Create task checklist error:', error);
            throw error;
        }
    }

    // Update checklist completion status
    static async updateChecklistProgress(checklistId, userId) {
        try {
            const checklist = await Checklist.findById(checklistId).populate('task');
            if (!checklist) {
                throw new Error('Checklist not found');
            }

            const completionPercentage = checklist.completionPercentage;

            // If checklist is fully completed, notify task assignees
            if (completionPercentage === 100) {
                await NotificationService.notifyTaskEvent(
                    'checklist_completed',
                    checklist.task,
                    userId,
                    {
                        metadata: {
                            checklistTitle: checklist.title
                        }
                    }
                );
            }

            return checklist;
        } catch (error) {
            logger.error('Update checklist progress error:', error);
            throw error;
        }
    }

    // Get checklist statistics for task
    static async getTaskChecklistStats(taskId) {
        try {
            const checklists = await Checklist.find({ task: taskId });
            
            const stats = {
                totalChecklists: checklists.length,
                completedChecklists: checklists.filter(c => c.completionPercentage === 100).length,
                totalItems: checklists.reduce((sum, c) => sum + c.items.length, 0),
                completedItems: checklists.reduce((sum, c) => sum + c.items.filter(i => i.completed).length, 0),
                overallProgress: 0
            };

            if (stats.totalItems > 0) {
                stats.overallProgress = (stats.completedItems / stats.totalItems * 100).toFixed(2);
            }

            return stats;
        } catch (error) {
            logger.error('Get task checklist stats error:', error);
            throw error;
        }
    }

    // Copy checklist to another task
    static async copyChecklistToTask(sourceChecklistId, targetTaskId, userId) {
        try {
            const sourceChecklist = await Checklist.findById(sourceChecklistId);
            if (!sourceChecklist) {
                throw new Error('Source checklist not found');
            }

            const targetTask = await Task.findById(targetTaskId);
            if (!targetTask) {
                throw new Error('Target task not found');
            }

            const newChecklist = await Checklist.create({
                title: sourceChecklist.title + ' (Copy)',
                task: targetTaskId,
                items: sourceChecklist.items.map(item => ({
                    text: item.text,
                    completed: false,
                    position: item.position
                }))
            });

            // Add to target task
            targetTask.checklist.push(newChecklist._id);
            await targetTask.save();

            return newChecklist;
        } catch (error) {
            logger.error('Copy checklist error:', error);
            throw error;
        }
    }

    // Create checklist template
    static async createTemplate(templateData, userId) {
        try {
            const template = await Checklist.create({
                ...templateData,
                isTemplate: true,
                createdBy: userId
            });

            return template;
        } catch (error) {
            logger.error('Create checklist template error:', error);
            throw error;
        }
    }

    // Apply template to task
    static async applyTemplate(templateId, taskId, userId) {
        try {
            const template = await Checklist.findById(templateId);
            if (!template || !template.isTemplate) {
                throw new Error('Template not found');
            }

            return await this.copyChecklistToTask(templateId, taskId, userId);
        } catch (error) {
            logger.error('Apply checklist template error:', error);
            throw error;
        }
    }

    // Get checklist templates
    static async getTemplates(userId) {
        try {
            const templates = await Checklist.find({
                isTemplate: true,
                $or: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            }).sort({ createdAt: -1 });

            return templates;
        } catch (error) {
            logger.error('Get checklist templates error:', error);
            throw error;
        }
    }

    // Bulk operations on checklist items
    static async bulkUpdateItems(checklistId, itemUpdates, userId) {
        try {
            const checklist = await Checklist.findById(checklistId);
            if (!checklist) {
                throw new Error('Checklist not found');
            }

            itemUpdates.forEach(update => {
                const item = checklist.items.id(update.itemId);
                if (item) {
                    Object.assign(item, update.changes);
                }
            });

            await checklist.save();
            await this.updateChecklistProgress(checklistId, userId);

            return checklist;
        } catch (error) {
            logger.error('Bulk update checklist items error:', error);
            throw error;
        }
    }
}

module.exports = ChecklistService;
