const Tag = require('../models/Tag');
const Task = require('../models/Task');
const Project = require('../models/Project');
const logger = require('../config/logger');

class TagService {

    // Create or get existing tag
    static async createOrGetTag(projectId, tagName, color, userId) {
        try {
            const normalizedName = tagName.toLowerCase().trim();

            // Check if tag already exists
            let tag = await Tag.findOne({ 
                name: normalizedName, 
                project: projectId 
            });

            if (tag) {
                return tag;
            }

            // Create new tag
            tag = await Tag.create({
                name: normalizedName,
                color: color || this.generateRandomColor(),
                project: projectId,
                createdBy: userId
            });

            return tag;

        } catch (error) {
            logger.error('Create or get tag error:', error);
            throw error;
        }
    }

    // Apply tags to task
    static async applyTagsToTask(taskId, tagNames, userId) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const project = await Project.findById(task.project);
            if (!project) {
                throw new Error('Project not found');
            }

            // Process each tag
            const appliedTags = [];
            for (const tagName of tagNames) {
                const tag = await this.createOrGetTag(task.project, tagName, null, userId);
                
                // Check if tag is already applied to task
                const existingLabel = task.labels.find(label => label.name === tag.name);
                if (!existingLabel) {
                    task.labels.push({
                        name: tag.name,
                        color: tag.color
                    });
                    
                    // Increment usage count
                    tag.usageCount += 1;
                    await tag.save();
                }
                
                appliedTags.push(tag);
            }

            await task.save();
            return appliedTags;

        } catch (error) {
            logger.error('Apply tags to task error:', error);
            throw error;
        }
    }

    // Remove tags from task
    static async removeTagsFromTask(taskId, tagNames) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const normalizedNames = tagNames.map(name => name.toLowerCase().trim());

            // Remove tags from task
            const removedTags = [];
            task.labels = task.labels.filter(label => {
                if (normalizedNames.includes(label.name)) {
                    removedTags.push(label.name);
                    return false;
                }
                return true;
            });

            await task.save();

            // Decrement usage count for removed tags
            for (const tagName of removedTags) {
                const tag = await Tag.findOne({ 
                    name: tagName, 
                    project: task.project 
                });
                
                if (tag && tag.usageCount > 0) {
                    tag.usageCount -= 1;
                    await tag.save();
                }
            }

            return removedTags;

        } catch (error) {
            logger.error('Remove tags from task error:', error);
            throw error;
        }
    }

    // Get popular tags for project
    static async getPopularTags(projectId, limit = 20) {
        try {
            const tags = await Tag.find({ project: projectId })
                .sort({ usageCount: -1 })
                .limit(limit);

            return tags;

        } catch (error) {
            logger.error('Get popular tags error:', error);
            throw error;
        }
    }

    // Update tag usage counts
    static async updateTagUsageCounts(projectId) {
        try {
            const usageCounts = await Task.aggregate([
                { $match: { project: mongoose.Types.ObjectId(projectId) } },
                { $unwind: '$labels' },
                {
                    $group: {
                        _id: '$labels.name',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Update each tag's usage count
            for (const usage of usageCounts) {
                await Tag.findOneAndUpdate(
                    { name: usage._id, project: projectId },
                    { usageCount: usage.count }
                );
            }

            // Set usage count to 0 for tags not in use
            await Tag.updateMany(
                {
                    project: projectId,
                    name: { $nin: usageCounts.map(u => u._id) }
                },
                { usageCount: 0 }
            );

            return usageCounts;

        } catch (error) {
            logger.error('Update tag usage counts error:', error);
            throw error;
        }
    }

    // Merge two tags
    static async mergeTags(sourceTagId, targetTagId, userId) {
        try {
            const [sourceTag, targetTag] = await Promise.all([
                Tag.findById(sourceTagId),
                Tag.findById(targetTagId)
            ]);

            if (!sourceTag || !targetTag) {
                throw new Error('One or both tags not found');
            }

            if (sourceTag.project.toString() !== targetTag.project.toString()) {
                throw new Error('Tags must be from the same project');
            }

            // Update all tasks using source tag to use target tag
            await Task.updateMany(
                { 
                    project: sourceTag.project,
                    'labels.name': sourceTag.name
                },
                {
                    $set: { 'labels.$.name': targetTag.name, 'labels.$.color': targetTag.color }
                }
            );

            // Update target tag usage count
            targetTag.usageCount += sourceTag.usageCount;
            await targetTag.save();

            // Delete source tag
            await Tag.findByIdAndDelete(sourceTagId);

            return {
                mergedTag: targetTag,
                transferredUsage: sourceTag.usageCount
            };

        } catch (error) {
            logger.error('Merge tags error:', error);
            throw error;
        }
    }

    // Get tag suggestions based on task content
    static async suggestTags(taskTitle, taskDescription, projectId, limit = 5) {
        try {
            // Simple keyword-based suggestion
            const text = `${taskTitle} ${taskDescription}`.toLowerCase();
            const keywords = text.split(/\s+/).filter(word => word.length > 3);

            // Find existing tags that match keywords
            const matchingTags = await Tag.find({
                project: projectId,
                name: { $in: keywords }
            }).sort({ usageCount: -1 }).limit(limit);

            // Get popular tags as fallback
            if (matchingTags.length < limit) {
                const popularTags = await this.getPopularTags(projectId, limit - matchingTags.length);
                matchingTags.push(...popularTags.filter(tag => 
                    !matchingTags.some(mt => mt._id.toString() === tag._id.toString())
                ));
            }

            return matchingTags;

        } catch (error) {
            logger.error('Suggest tags error:', error);
            throw error;
        }
    }

    // Create tag template for project
    static async createTagTemplate(projectId, templateData, userId) {
        try {
            const { name, tags } = templateData;

            const template = {
                name,
                tags: tags.map(tag => ({
                    name: tag.name.toLowerCase().trim(),
                    color: tag.color || this.generateRandomColor(),
                    description: tag.description
                })),
                createdBy: userId,
                project: projectId
            };

            // Store template (could be in separate collection)
            // For now, we'll create the tags and mark them as template
            const createdTags = [];
            for (const tagData of template.tags) {
                const tag = await this.createOrGetTag(projectId, tagData.name, tagData.color, userId);
                tag.isTemplate = true;
                tag.description = tagData.description;
                await tag.save();
                createdTags.push(tag);
            }

            return {
                template: template.name,
                tags: createdTags
            };

        } catch (error) {
            logger.error('Create tag template error:', error);
            throw error;
        }
    }

    // Apply tag template to project
    static async applyTagTemplate(projectId, templateName, userId) {
        try {
            const templateTags = await Tag.find({
                project: projectId,
                isTemplate: true
            });

            // Create/ensure all template tags exist
            const appliedTags = [];
            for (const templateTag of templateTags) {
                const tag = await this.createOrGetTag(
                    projectId, 
                    templateTag.name, 
                    templateTag.color, 
                    userId
                );
                appliedTags.push(tag);
            }

            return appliedTags;

        } catch (error) {
            logger.error('Apply tag template error:', error);
            throw error;
        }
    }

    // Cleanup unused tags
    static async cleanupUnusedTags(projectId, daysUnused = 30) {
        try {
            const cutoffDate = new Date(Date.now() - daysUnused * 24 * 60 * 60 * 1000);

            const unusedTags = await Tag.find({
                project: projectId,
                usageCount: 0,
                createdAt: { $lt: cutoffDate },
                isTemplate: { $ne: true }
            });

            const deleteResult = await Tag.deleteMany({
                _id: { $in: unusedTags.map(t => t._id) }
            });

            return {
                deletedCount: deleteResult.deletedCount,
                deletedTags: unusedTags.map(t => t.name)
            };

        } catch (error) {
            logger.error('Cleanup unused tags error:', error);
            throw error;
        }
    }

    // Get tag analytics
    static async getTagAnalytics(projectId) {
        try {
            const analytics = await Tag.aggregate([
                { $match: { project: mongoose.Types.ObjectId(projectId) } },
                {
                    $group: {
                        _id: null,
                        totalTags: { $sum: 1 },
                        totalUsage: { $sum: '$usageCount' },
                        averageUsage: { $avg: '$usageCount' },
                        mostUsedTag: { $max: '$usageCount' },
                        unusedTags: {
                            $sum: { $cond: [{ $eq: ['$usageCount', 0] }, 1, 0] }
                        }
                    }
                }
            ]);

            const topTags = await Tag.find({ project: projectId })
                .sort({ usageCount: -1 })
                .limit(10)
                .select('name usageCount color');

            const result = analytics[0] || {
                totalTags: 0,
                totalUsage: 0,
                averageUsage: 0,
                mostUsedTag: 0,
                unusedTags: 0
            };

            return {
                ...result,
                topTags,
                utilizationRate: result.totalTags > 0 ? 
                    ((result.totalTags - result.unusedTags) / result.totalTags * 100).toFixed(2) : 0
            };

        } catch (error) {
            logger.error('Get tag analytics error:', error);
            throw error;
        }
    }

    // Helper methods
    static generateRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Validate tag name
    static validateTagName(name) {
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            throw new Error('Tag name cannot be empty');
        }
        
        if (trimmedName.length > 50) {
            throw new Error('Tag name cannot exceed 50 characters');
        }
        
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
            throw new Error('Tag name can only contain letters, numbers, spaces, hyphens, and underscores');
        }
        
        return trimmedName.toLowerCase();
    }

    // Batch create tags
    static async batchCreateTags(projectId, tagData, userId) {
        try {
            const createdTags = [];
            
            for (const data of tagData) {
                const validatedName = this.validateTagName(data.name);
                const tag = await this.createOrGetTag(projectId, validatedName, data.color, userId);
                createdTags.push(tag);
            }
            
            return createdTags;

        } catch (error) {
            logger.error('Batch create tags error:', error);
            throw error;
        }
    }
}

module.exports = TagService;
