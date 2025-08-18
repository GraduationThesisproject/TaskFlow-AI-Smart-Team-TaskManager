const express = require('express');
const fileController = require('../controllers/file.controller');
const { 
    avatarUpload, 
    taskAttachmentUpload, 
    commentAttachmentUpload, 
    logoUpload,
    singleAttachmentUpload 
} = require('../middlewares/upload.middleware');
const { requireProjectPermission, requireWorkspacePermission } = require('../middlewares/permission.middleware');

const router = express.Router();

// Avatar upload
router.post('/avatar', 
    avatarUpload,
    fileController.uploadAvatar
);

// Task attachment upload
router.post('/tasks/:taskId/attachments',
    taskAttachmentUpload,
    fileController.uploadTaskAttachments
);

// Comment attachment upload
router.post('/comments/:commentId/attachments',
    commentAttachmentUpload,
    fileController.uploadCommentAttachments
);

// Logo upload for workspace or project
router.post('/logo/:entityType/:entityId',
    logoUpload,
    fileController.uploadLogo
);

// General file operations
router.get('/:id', fileController.getFile);
router.delete('/:id', fileController.deleteFile);

// Get files by entity
router.get('/entity/:entityType/:entityId', fileController.getEntityFiles);

// Get user's files
router.get('/user/my-files', fileController.getUserFiles);

// Storage statistics
router.get('/storage/stats', fileController.getStorageStats);

module.exports = router;
