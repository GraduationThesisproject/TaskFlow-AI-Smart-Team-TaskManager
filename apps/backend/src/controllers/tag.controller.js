const Tag = require('../models/Tag');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all tags for project
exports.getProjectTags = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sortBy = 'usageCount' } = req.query;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        let sortOption = {};
        switch (sortBy) {
            case 'name':
                sortOption = { name: 1 };
                break;
            case 'usageCount':
                sortOption = { usageCount: -1 };
                break;
            case 'created':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { usageCount: -1 };
        }

        const tags = await Tag.find({ project: projectId })
            .populate('createdBy', 'name avatar')
            .sort(sortOption);

        sendResponse(res, 200, true, 'Project tags retrieved successfully', {
            tags,
            count: tags.length
        });
    } catch (error) {
        logger.error('Get project tags error:', error);
        sendResponse(res, 500, false, 'Server error retrieving project tags');
    }
};

// Create new tag
exports.createTag = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, color, description } = req.body;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId, 'member')) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Check if tag already exists
        const existingTag = await Tag.findOne({ 
            name: name.toLowerCase().trim(), 
            project: projectId 
        });

        if (existingTag) {
            return sendResponse(res, 400, false, 'Tag with this name already exists in the project');
        }

        const tag = await Tag.create({
            name: name.toLowerCase().trim(),
            color,
            description,
            project: projectId,
            createdBy: userId
        });

        await tag.populate('createdBy', 'name avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'tag_create',
            description: `Created tag: ${name}`,
            entity: { type: 'Tag', id: tag._id, name },
            relatedEntities: [{ type: 'Project', id: projectId, name: project.name }],
            projectId,
            metadata: {
                color,
                ipAddress: req.ip
            }
        });

        logger.info(`Tag created: ${name} for project ${projectId}`);

        sendResponse(res, 201, true, 'Tag created successfully', {
            tag
        });
    } catch (error) {
        logger.error('Create tag error:', error);
        sendResponse(res, 500, false, 'Server error creating tag');
    }
};

// Update tag
exports.updateTag = async (req, res) => {
    try {
        const { id: tagId } = req.params;
        const { name, color, description } = req.body;
        const userId = req.user.id;

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return sendResponse(res, 404, false, 'Tag not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = tag.createdBy.toString() === userId ||
                       userRoles.hasProjectRole(tag.project, 'admin');

        if (!canEdit) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit this tag');
        }

        // Check for duplicate name if name is being changed
        if (name && name.toLowerCase().trim() !== tag.name) {
            const existingTag = await Tag.findOne({ 
                name: name.toLowerCase().trim(), 
                project: tag.project,
                _id: { $ne: tagId }
            });

            if (existingTag) {
                return sendResponse(res, 400, false, 'Tag with this name already exists in the project');
            }
        }

        // Store old values
        const oldValues = {
            name: tag.name,
            color: tag.color,
            description: tag.description
        };

        // Update tag
        if (name) tag.name = name.toLowerCase().trim();
        if (color) tag.color = color;
        if (description !== undefined) tag.description = description;

        await tag.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'tag_update',
            description: `Updated tag: ${tag.name}`,
            entity: { type: 'Tag', id: tagId, name: tag.name },
            projectId: tag.project,
            metadata: {
                oldValues,
                newValues: { name, color, description },
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Tag updated successfully', {
            tag
        });
    } catch (error) {
        logger.error('Update tag error:', error);
        sendResponse(res, 500, false, 'Server error updating tag');
    }
};

// Delete tag
exports.deleteTag = async (req, res) => {
    try {
        const { id: tagId } = req.params;
        const userId = req.user.id;

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return sendResponse(res, 404, false, 'Tag not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canDelete = tag.createdBy.toString() === userId ||
                         userRoles.hasProjectRole(tag.project, 'admin');

        if (!canDelete) {
            return sendResponse(res, 403, false, 'Insufficient permissions to delete this tag');
        }

        // Remove tag from all tasks in the project
        await Task.updateMany(
            { 
                project: tag.project,
                'labels.name': tag.name
            },
            { 
                $pull: { labels: { name: tag.name } }
            }
        );

        await Tag.findByIdAndDelete(tagId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'tag_delete',
            description: `Deleted tag: ${tag.name}`,
            entity: { type: 'Tag', id: tagId, name: tag.name },
            projectId: tag.project,
            metadata: {
                usageCount: tag.usageCount,
                ipAddress: req.ip
            },
            severity: 'warning'
        });

        sendResponse(res, 200, true, 'Tag deleted successfully');
    } catch (error) {
        logger.error('Delete tag error:', error);
        sendResponse(res, 500, false, 'Server error deleting tag');
    }
};

// Get tag usage statistics
exports.getTagUsage = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        // Get tag usage from tasks
        const tagUsage = await Task.aggregate([
            { $match: { project: mongoose.Types.ObjectId(projectId) } },
            { $unwind: '$labels' },
            {
                $group: {
                    _id: '$labels.name',
                    count: { $sum: 1 },
                    color: { $first: '$labels.color' },
                    tasks: { $push: '$_id' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Update usage counts in Tag model
        for (const usage of tagUsage) {
            await Tag.findOneAndUpdate(
                { name: usage._id, project: projectId },
                { usageCount: usage.count }
            );
        }

        sendResponse(res, 200, true, 'Tag usage statistics retrieved successfully', {
            usage: tagUsage,
            count: tagUsage.length
        });
    } catch (error) {
        logger.error('Get tag usage error:', error);
        sendResponse(res, 500, false, 'Server error retrieving tag usage');
    }
};

// Merge tags
exports.mergeTags = async (req, res) => {
    try {
        const { sourceTagId, targetTagId } = req.body;
        const userId = req.user.id;

        const [sourceTag, targetTag] = await Promise.all([
            Tag.findById(sourceTagId),
            Tag.findById(targetTagId)
        ]);

        if (!sourceTag || !targetTag) {
            return sendResponse(res, 404, false, 'One or both tags not found');
        }

        if (sourceTag.project.toString() !== targetTag.project.toString()) {
            return sendResponse(res, 400, false, 'Tags must be from the same project');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(sourceTag.project, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to merge tags');
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

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'tag_merge',
            description: `Merged tag ${sourceTag.name} into ${targetTag.name}`,
            entity: { type: 'Tag', id: targetTagId, name: targetTag.name },
            relatedEntities: [{ type: 'Tag', id: sourceTagId, name: sourceTag.name }],
            projectId: sourceTag.project,
            metadata: {
                sourceUsage: sourceTag.usageCount,
                targetUsage: targetTag.usageCount,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Tags merged successfully', {
            targetTag,
            mergedUsageCount: sourceTag.usageCount
        });
    } catch (error) {
        logger.error('Merge tags error:', error);
        sendResponse(res, 500, false, 'Server error merging tags');
    }
};
