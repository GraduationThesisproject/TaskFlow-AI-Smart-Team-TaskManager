const express = require('express');
const router = express.Router();
const { 
  uploadFile, 
  uploadMultipleFiles, 
  getFile, 
  downloadFile, 
  deleteFileById,
  getUserFiles
} = require('../controllers/file.controller');
const {authMiddleware} = require('../middlewares/auth.middleware');
const { 
  uploadMiddlewares, 
  processUploadedFiles, 
  validateUploadPermissions,
  setUploadContext
} = require('../middlewares/upload.middleware');

// Apply authentication to all routes
router.use((req, res, next) => authMiddleware(req, res, next));

// Single file upload routes by category
router.post('/upload/avatar', 
  validateUploadPermissions(['user', 'admin'], ['avatar']),
  setUploadContext(),
  uploadMiddlewares.avatar,
  processUploadedFiles,
  uploadFile
);

router.post('/upload/task-attachments',
  validateUploadPermissions(['user', 'admin'], ['task_attachment']),
  setUploadContext(),
  uploadMiddlewares.taskAttachment,
  processUploadedFiles,
  uploadMultipleFiles
);

router.post('/upload/comment-attachment',
  validateUploadPermissions(['user', 'admin'], ['comment_attachment']),
  setUploadContext(),
  uploadMiddlewares.commentAttachment,
  processUploadedFiles,
  uploadMultipleFiles
);

router.post('/upload/logo',
  validateUploadPermissions(['admin'], ['logo']),
  setUploadContext(),
  uploadMiddlewares.logo,
  processUploadedFiles,
  uploadFile
);

router.post('/upload/board-background',
  validateUploadPermissions(['user', 'admin'], ['board_background']),
  setUploadContext(),
  uploadMiddlewares.boardBackground,
  processUploadedFiles,
  uploadFile
);

router.post('/upload/general',
  validateUploadPermissions(['user', 'admin'], ['general']),
  setUploadContext(),
  uploadMiddlewares.general,
  processUploadedFiles,
  uploadMultipleFiles
);

// File management routes
router.get('/', getUserFiles);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFileById);

module.exports = router;