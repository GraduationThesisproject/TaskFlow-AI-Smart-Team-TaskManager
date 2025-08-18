const File = require('../models/File');
const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const { deleteFile, getFileMetadata } = require('../config/cloudinary');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.uploadedFile) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Delete old avatar if exists
        if (user.avatar) {
            const oldFile = await File.findOne({ 
                url: user.avatar,
                uploadedBy: userId,
                category: 'avatar'
            });
            
            if (oldFile) {
                await oldFile.deleteFromCloudinary();
            }
        }

        // Create file record
        const file = await File.create({
            publicId: req.uploadedFile.publicId,
            url: req.uploadedFile.url,
            secureUrl: req.uploadedFile.url,
            originalName: req.uploadedFile.originalName,
            mimeType: req.uploadedFile.mimeType,
            size: req.uploadedFile.size,
            format: req.uploadedFile.format,
            resourceType: req.uploadedFile.resourceType,
            category: 'avatar',
            uploadedBy: userId,
            dimensions: {
                width: req.uploadedFile.width,
                height: req.uploadedFile.height
            }
        });

        // Attach to user
        await file.attachTo('User', userId);

        // Update user avatar
        user.avatar = file.url;
        await user.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'profile_update',
            description: 'Updated profile avatar',
            entity: { type: 'User', id: userId, name: user.name },
            relatedEntities: [{ type: 'File', id: file._id, name: file.originalName }],
            metadata: {
                fileSize: file.size,
                fileType: file.mimeType,
                ipAddress: req.ip
            }
        });

        logger.info(`Avatar uploaded for user: ${user.email}`);

        sendResponse(res, 200, true, 'Avatar uploaded successfully', {
            file: {
                id: file._id,
                url: file.url,
                optimizedUrl: file.getOptimizedUrl('avatar'),
                originalName: file.originalName,
                size: file.humanSize
            }
        });
    } catch (error) {
        logger.error('Upload avatar error:', error);
        sendResponse(res, 500, false, 'Server error uploading avatar');
    }
};

// Upload task attachments
exports.uploadTaskAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
            return sendResponse(res, 400, false, 'No files uploaded');
        }

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
                         userRoles.hasBoardPermission(task.board, 'canEditTasks');

        if (!hasAccess) {
            return sendResponse(res, 403, false, 'Access denied to this task');
        }

        // Create file records and attach to task
        const uploadedFiles = [];
        
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
                uploadedBy: userId,
                project: task.project || null,
                dimensions: {
                    width: uploadedFile.width,
                    height: uploadedFile.height
                }
            });

            await file.attachTo('Task', taskId);

            // Add to task attachments
            task.attachments.push({
                filename: file.publicId,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                url: file.url,
                uploadedBy: userId,
                uploadedAt: new Date()
            });

            uploadedFiles.push(file);
        }

        await task.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'file_upload',
            description: `Uploaded ${uploadedFiles.length} attachment(s) to task: ${task.title}`,
            entity: { type: 'Task', id: taskId, name: task.title },
            relatedEntities: uploadedFiles.map(f => ({ type: 'File', id: f._id, name: f.originalName })),
            boardId: task.board,
            metadata: {
                fileCount: uploadedFiles.length,
                totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0),
                ipAddress: req.ip
            }
        });

        logger.info(`${uploadedFiles.length} attachments uploaded to task: ${taskId}`);

        sendResponse(res, 200, true, 'Attachments uploaded successfully', {
            files: uploadedFiles.map(file => ({
                id: file._id,
                url: file.url,
                originalName: file.originalName,
                size: file.humanSize,
                fileType: file.fileType,
                canPreview: file.canPreview
            })),
            count: uploadedFiles.length
        });
    } catch (error) {
        logger.error('Upload task attachments error:', error);
        sendResponse(res, 500, false, 'Server error uploading attachments');
    }
};

// Upload comment attachments
exports.uploadCommentAttachments = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
            return sendResponse(res, 400, false, 'No files uploaded');
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check if user is the comment author
        if (comment.author.toString() !== userId) {
            return sendResponse(res, 403, false, 'You can only upload attachments to your own comments');
        }

        // Create file records and attach to comment
        const uploadedFiles = [];
        
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

            await file.attachTo('Comment', commentId);

            // Add to comment attachments
            comment.attachments.push({
                filename: file.publicId,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                url: file.url
            });

            uploadedFiles.push(file);
        }

        await comment.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'file_upload',
            description: `Uploaded ${uploadedFiles.length} attachment(s) to comment`,
            entity: { type: 'Comment', id: commentId, name: 'Comment' },
            relatedEntities: uploadedFiles.map(f => ({ type: 'File', id: f._id, name: f.originalName })),
            metadata: {
                fileCount: uploadedFiles.length,
                totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0),
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Comment attachments uploaded successfully', {
            files: uploadedFiles.map(file => ({
                id: file._id,
                url: file.url,
                originalName: file.originalName,
                size: file.humanSize,
                fileType: file.fileType
            })),
            count: uploadedFiles.length
        });
    } catch (error) {
        logger.error('Upload comment attachments error:', error);
        sendResponse(res, 500, false, 'Server error uploading comment attachments');
    }
};

// Upload workspace/project logo
exports.uploadLogo = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const userId = req.user.id;

        if (!req.uploadedFile) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        // Check permissions based on entity type
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasPermission = false;
        let entity = null;

        if (entityType === 'workspace') {
            const Workspace = require('../models/Workspace');
            entity = await Workspace.findById(entityId);
            hasPermission = entity && userRoles.hasWorkspaceRole(entityId, 'admin');
        } else if (entityType === 'project') {
            const Project = require('../models/Project');
            entity = await Project.findById(entityId);
            hasPermission = entity && userRoles.hasProjectRole(entityId, 'admin');
        }

        if (!entity) {
            return sendResponse(res, 404, false, `${entityType} not found`);
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, `Insufficient permissions to upload ${entityType} logo`);
        }

        // Delete old logo if exists
        if (entity.settings && entity.settings.branding && entity.settings.branding.logo) {
            const oldFile = await File.findOne({ 
                url: entity.settings.branding.logo,
                category: 'logo'
            });
            
            if (oldFile) {
                await oldFile.deleteFromCloudinary();
            }
        }

        // Create file record
        const file = await File.create({
            publicId: req.uploadedFile.publicId,
            url: req.uploadedFile.url,
            secureUrl: req.uploadedFile.url,
            originalName: req.uploadedFile.originalName,
            mimeType: req.uploadedFile.mimeType,
            size: req.uploadedFile.size,
            format: req.uploadedFile.format,
            resourceType: req.uploadedFile.resourceType,
            category: 'logo',
            uploadedBy: userId,
            workspace: entityType === 'workspace' ? entityId : entity.workspace,
            project: entityType === 'project' ? entityId : null
        });

        await file.attachTo(entityType === 'workspace' ? 'Workspace' : 'Project', entityId);

        // Update entity logo
        if (!entity.settings) entity.settings = {};
        if (!entity.settings.branding) entity.settings.branding = {};
        entity.settings.branding.logo = file.url;
        await entity.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'file_upload',
            description: `Uploaded logo for ${entityType}: ${entity.name}`,
            entity: { type: entityType === 'workspace' ? 'Workspace' : 'Project', id: entityId, name: entity.name },
            relatedEntities: [{ type: 'File', id: file._id, name: file.originalName }],
            workspaceId: entityType === 'workspace' ? entityId : entity.workspace,
            projectId: entityType === 'project' ? entityId : null,
            metadata: {
                fileSize: file.size,
                fileType: file.mimeType,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Logo uploaded successfully', {
            file: {
                id: file._id,
                url: file.url,
                optimizedUrl: file.getOptimizedUrl('logo'),
                originalName: file.originalName,
                size: file.humanSize
            }
        });
    } catch (error) {
        logger.error('Upload logo error:', error);
        sendResponse(res, 500, false, 'Server error uploading logo');
    }
};

// Get file details
exports.getFile = async (req, res) => {
    try {
        const { id: fileId } = req.params;
        const userId = req.user.id;

        const file = await File.findById(fileId)
            .populate('uploadedBy', 'name avatar')
            .populate('attachedTo.entityId');

        if (!file || !file.isActive) {
            return sendResponse(res, 404, false, 'File not found');
        }

        // Check access permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasAccess = file.uploadedBy._id.toString() === userId || file.isPublic;

        // Check access based on attached entities
        if (!hasAccess) {
            for (const attachment of file.attachedTo) {
                switch (attachment.entityType) {
                    case 'Task':
                        const task = await Task.findById(attachment.entityId);
                        if (task) {
                            hasAccess = task.assignees.some(a => a.toString() === userId) ||
                                       task.reporter.toString() === userId ||
                                       task.watchers.some(w => w.toString() === userId) ||
                                       userRoles.hasBoardPermission(task.board, 'canView');
                        }
                        break;
                    case 'Project':
                        hasAccess = userRoles.hasProjectRole(attachment.entityId);
                        break;
                    case 'Workspace':
                        hasAccess = userRoles.hasWorkspaceRole(attachment.entityId);
                        break;
                }
                
                if (hasAccess) break;
            }
        }

        if (!hasAccess) {
            return sendResponse(res, 403, false, 'Access denied to this file');
        }

        // Increment download count
        await file.incrementDownloadCount();

        sendResponse(res, 200, true, 'File retrieved successfully', {
            file: {
                id: file._id,
                url: file.url,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.humanSize,
                fileType: file.fileType,
                canPreview: file.canPreview,
                dimensions: file.dimensions,
                uploadedBy: file.uploadedBy,
                uploadedAt: file.createdAt,
                downloadCount: file.downloadCount,
                attachedTo: file.attachedTo
            }
        });
    } catch (error) {
        logger.error('Get file error:', error);
        sendResponse(res, 500, false, 'Server error retrieving file');
    }
};

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        const { id: fileId } = req.params;
        const userId = req.user.id;

        const file = await File.findById(fileId);
        if (!file || !file.isActive) {
            return sendResponse(res, 404, false, 'File not found');
        }

        // Check permissions - file owner or admin of attached entities
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let canDelete = file.uploadedBy.toString() === userId;

        if (!canDelete) {
            // Check if user has admin access to any attached entity
            for (const attachment of file.attachedTo) {
                switch (attachment.entityType) {
                    case 'Task':
                        canDelete = userRoles.hasBoardPermission(attachment.entityId, 'canDeleteTasks');
                        break;
                    case 'Project':
                        canDelete = userRoles.hasProjectRole(attachment.entityId, 'admin');
                        break;
                    case 'Workspace':
                        canDelete = userRoles.hasWorkspaceRole(attachment.entityId, 'admin');
                        break;
                }
                
                if (canDelete) break;
            }
        }

        if (!canDelete) {
            return sendResponse(res, 403, false, 'Insufficient permissions to delete this file');
        }

        // Remove from attached entities
        for (const attachment of file.attachedTo) {
            switch (attachment.entityType) {
                case 'Task':
                    const task = await Task.findById(attachment.entityId);
                    if (task) {
                        task.attachments = task.attachments.filter(att => 
                            att.filename !== file.publicId
                        );
                        await task.save();
                    }
                    break;
                case 'Comment':
                    const comment = await Comment.findById(attachment.entityId);
                    if (comment) {
                        comment.attachments = comment.attachments.filter(att => 
                            att.filename !== file.publicId
                        );
                        await comment.save();
                    }
                    break;
            }
        }

        // Delete from Cloudinary
        await file.deleteFromCloudinary();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'file_delete',
            description: `Deleted file: ${file.originalName}`,
            entity: { type: 'File', id: fileId, name: file.originalName },
            metadata: {
                fileSize: file.size,
                fileType: file.mimeType,
                attachedToCount: file.attachedTo.length,
                ipAddress: req.ip
            },
            severity: 'warning'
        });

        sendResponse(res, 200, true, 'File deleted successfully');
    } catch (error) {
        logger.error('Delete file error:', error);
        sendResponse(res, 500, false, 'Server error deleting file');
    }
};

// Get files for entity
exports.getEntityFiles = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { category } = req.query;
        const userId = req.user.id;

        // Check permissions based on entity type
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasAccess = false;

        switch (entityType) {
            case 'task':
                const task = await Task.findById(entityId);
                if (task) {
                    hasAccess = task.assignees.some(a => a.toString() === userId) ||
                               task.reporter.toString() === userId ||
                               task.watchers.some(w => w.toString() === userId) ||
                               userRoles.hasBoardPermission(task.board, 'canView');
                }
                break;
            case 'project':
                hasAccess = userRoles.hasProjectRole(entityId);
                break;
            case 'workspace':
                hasAccess = userRoles.hasWorkspaceRole(entityId);
                break;
        }

        if (!hasAccess) {
            return sendResponse(res, 403, false, 'Access denied to this entity');
        }

        let query = {
            'attachedTo.entityType': entityType.charAt(0).toUpperCase() + entityType.slice(1),
            'attachedTo.entityId': entityId,
            isActive: true
        };

        if (category) {
            query.category = category;
        }

        const files = await File.find(query)
            .populate('uploadedBy', 'name avatar')
            .sort({ createdAt: -1 });

        const filesData = files.map(file => ({
            id: file._id,
            url: file.url,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.humanSize,
            fileType: file.fileType,
            canPreview: file.canPreview,
            uploadedBy: file.uploadedBy,
            uploadedAt: file.createdAt,
            downloadCount: file.downloadCount
        }));

        sendResponse(res, 200, true, 'Files retrieved successfully', {
            files: filesData,
            count: filesData.length
        });
    } catch (error) {
        logger.error('Get entity files error:', error);
        sendResponse(res, 500, false, 'Server error retrieving files');
    }
};

// Get user's uploaded files
exports.getUserFiles = async (req, res) => {
    try {
        const { category, limit = 50 } = req.query;
        const userId = req.user.id;

        const files = await File.findByUser(userId, category)
            .limit(parseInt(limit))
            .populate('attachedTo.entityId');

        const filesData = files.map(file => ({
            id: file._id,
            url: file.url,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.humanSize,
            fileType: file.fileType,
            category: file.category,
            uploadedAt: file.createdAt,
            downloadCount: file.downloadCount,
            attachedTo: file.attachedTo.map(att => ({
                entityType: att.entityType,
                entityId: att.entityId,
                attachedAt: att.attachedAt
            }))
        }));

        sendResponse(res, 200, true, 'User files retrieved successfully', {
            files: filesData,
            count: filesData.length
        });
    } catch (error) {
        logger.error('Get user files error:', error);
        sendResponse(res, 500, false, 'Server error retrieving user files');
    }
};

// Get storage statistics
exports.getStorageStats = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        const userId = req.user.id;

        // Check permissions
        if (workspaceId) {
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            if (!userRoles.hasWorkspaceRole(workspaceId)) {
                return sendResponse(res, 403, false, 'Access denied to workspace');
            }
        }

        const stats = await File.getStorageStats(workspaceId);

        sendResponse(res, 200, true, 'Storage statistics retrieved successfully', {
            stats
        });
    } catch (error) {
        logger.error('Get storage stats error:', error);
        sendResponse(res, 500, false, 'Server error retrieving storage statistics');
    }
};
