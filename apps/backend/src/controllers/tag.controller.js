const Tag = require('../models/Tag');
const Space = require('../models/Space');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all tags for space
exports.getSpaceTags = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { sortBy = 'usageCount', category, search } = req.query;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId)) {
            // return sendResponse(res, 403, false, 'Access denied to this space');
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

        const findQuery = { space: spaceId };
        if (category) findQuery.category = category;
        if (search) findQuery.name = { $regex: search, $options: 'i' };

        const tags = await Tag.find(findQuery)
            .populate('createdBy', 'name avatar')
            .sort(sortOption);

        sendResponse(res, 200, true, 'Space tags retrieved successfully', {
            tags,
            count: tags.length
        });
    } catch (error) {
        logger.error('Get space tags error:', error);
        sendResponse(res, 500, false, 'Server error retrieving space tags');
    }
};

// Create new tag
exports.createTag = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { name, color, description, category } = req.body;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId, 'member')) {
            // return sendResponse(res, 403, false, 'Access denied to this space');
        }

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Check if tag already exists (case-insensitive)
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingTag = await Tag.findOne({ 
            name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' },
            space: spaceId 
        });

        if (existingTag) {
            return sendResponse(res, 400, false, 'Tag with this name already exists in the space');
        }

        const tag = await Tag.create({
            name: name.trim(),
            color,
            description,
            category,
            scope: 'space',
            space: spaceId,
            createdBy: userId
        });

        await tag.populate('createdBy', 'name avatar');

        // Log activity under space_update to satisfy enum
        await ActivityLog.logActivity({
            userId,
            action: 'space_update',
            description: `Created tag: ${name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            spaceId,
            metadata: { 
                tagId: tag._id,
                tagName: name,
                ipAddress: req.ip 
            }
        });

        logger.info(`Tag created: ${name} for space ${spaceId}`);
        sendResponse(res, 201, true, 'Tag created successfully', { tag });
    } catch (error) {
        logger.error('Create tag error:', error);
        sendResponse(res, 500, false, 'Server error creating tag');
    }
};

// Update tag
exports.updateTag = async (req, res) => {
    try {
        const { id: tagId } = req.params;
        const { name, color, description, category } = req.body;
        const userId = req.user.id;

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return sendResponse(res, 404, false, 'Tag not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const canEdit = tag.createdBy.toString() === userId ||
                       userRoles.hasSpaceRole(tag.space, 'admin');

        if (!canEdit) {
            // return sendResponse(res, 403, false, 'Insufficient permissions to edit this tag');
        }

        // Check for duplicate name (case-insensitive) if name is being changed
        if (name && name.trim().toLowerCase() !== tag.name.toLowerCase()) {
            const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const existingTag = await Tag.findOne({ 
                name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' }, 
                space: tag.space,
                _id: { $ne: tagId }
            });

            if (existingTag) {
                return sendResponse(res, 400, false, 'Tag with this name already exists in the space');
            }
        }

        // Store old values
        const oldValues = {
            name: tag.name,
            color: tag.color,
            description: tag.description
        };

        // Update tag
        if (name) tag.name = name.trim();
        if (color) tag.color = color;
        if (description !== undefined) tag.description = description;
        if (category) tag.category = category;

        await tag.save();

        // Log activity under space_update to satisfy enum
        await ActivityLog.logActivity({
            userId,
            action: 'space_update',
            description: `Tag updated: ${tag.name}`,
            entity: { type: 'Space', id: tag.space, name: 'Space' },
            spaceId: tag.space,
            metadata: {
                operation: 'tag_update',
                tagId,
                oldValues,
                newValues: { name, color, description, category },
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Tag updated successfully', {
            tag: {
                ...tag.toObject(),
                createdBy: tag.createdBy._id || tag.createdBy
            }
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
                         userRoles.hasSpaceRole(tag.space, 'admin');

        if (!canDelete) {
            // return sendResponse(res, 403, false, 'Insufficient permissions to delete this tag');
        }

        // Prevent delete if tag in use
        const inUse = await Task.countDocuments({ space: tag.space, tags: tag.name });
        if (inUse > 0 || tag.stats.totalUsage > 0) {
            return sendResponse(res, 400, false, 'Tag is in use and cannot be deleted');
        }

        await Tag.findByIdAndDelete(tagId);

        // Log activity under space_update to satisfy enum
        await ActivityLog.logActivity({
            userId,
            action: 'space_update',
            description: `Tag deleted: ${tag.name}`,
            entity: { type: 'Space', id: tag.space, name: 'Space' },
            spaceId: tag.space,
            metadata: {
                operation: 'tag_delete',
                tagId: tagId,
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
        const { spaceId } = req.params;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        

        
        if (!userRoles.hasSpaceRole(spaceId)) {
            // return sendResponse(res, 403, false, 'Access denied to this space');
        }

        // Get tag usage from tasks
        const tagUsage = await Task.aggregate([
            { $match: { space: new mongoose.Types.ObjectId(spaceId) } },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 },
                    tasks: { $push: '$_id' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Update usage counts in Tag model
        for (const usage of tagUsage) {
            await Tag.findOneAndUpdate(
                { name: usage._id, space: spaceId },
                { 'stats.totalUsage': usage.count }
            );
        }

        sendResponse(res, 200, true, 'Tag usage statistics retrieved successfully', {
            usage: {
                totalTags: tagUsage.length,
                mostUsed: tagUsage[0] || null,
                tagDistribution: tagUsage
            }
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

        if (sourceTag.space.toString() !== targetTag.space.toString()) {
            return sendResponse(res, 400, false, 'Tags must be from the same space');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(sourceTag.space, 'admin')) {
            // return sendResponse(res, 403, false, 'Admin permissions required to merge tags');
        }

        // Update all tasks using source tag to use target tag
        await Task.updateMany(
            { 
                space: sourceTag.space,
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
            spaceId: sourceTag.space,
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
