const { createMulterUpload, generateThumbnails, getFileStats } = require('../config/multer');
const File = require('../models/File');
const logger = require('../config/logger');
const express = require('express'); // Added for express.json and express.urlencoded

/**
 * Create upload middleware for specific file category
 * @param {string} category - File category (avatar, task_attachment, etc.)
 * @param {boolean} multiple - Allow multiple files
 * @param {number} maxCount - Maximum number of files (for multiple uploads)
 * @param {boolean} optional - Whether file upload is optional (default: false)
 * @returns {Function} Express middleware
 */
const createUploadMiddleware = (category = 'general', multiple = false, maxCount = 5, optional = false) => {
  const upload = createMulterUpload(category);
  
  return (req, res, next) => {
    // Set file category for storage configuration
    req.fileCategory = category;
    
    // Ensure workspaceId is set to prevent undefined errors
    req.workspaceId = req.workspaceId || req.workspace || null;
    req.projectId = req.projectId || req.project || null;
    
    logger.info(`Upload middleware: Processing ${category} upload, multiple: ${multiple}, optional: ${optional}`);
    
    const uploadHandler = multiple 
      ? upload.array('files', maxCount)
      : upload.single('avatar'); // single-file upload for avatar
    
    uploadHandler(req, res, (error) => {
      // Add request details logging
      logger.info(`Upload middleware: Request details - Content-Type: ${req.headers['content-type']}, Content-Length: ${req.headers['content-length']}`);
      logger.info(`Upload middleware: Request method: ${req.method}, URL: ${req.url}`);
      logger.info(`Upload middleware: Request body keys: ${Object.keys(req.body || {})}`);
      logger.info(`Upload middleware: Request files: ${req.files ? req.files.length : 'null'}`);
      logger.info(`Upload middleware: Request file: ${req.file ? 'exists' : 'null'}`);
      
      if (error) {
        logger.error('Upload middleware error:', error);
        logger.error('Error details:', { code: error.code, message: error.message, field: error.field });
        
        // Handle specific Multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large',
            error: error.message
          });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files',
            error: error.message
          });
        }
        
        if (error.message.includes('File type') && error.message.includes('not allowed')) {
          return res.status(400).json({
            success: false,
            message: 'File type not allowed',
            error: error.message
          });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Too many files or unexpected field',
            error: error.message
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Upload failed',
          error: error.message
        });
      }
      
      // Log what we received
      logger.info(`Upload middleware: Received files - req.file: ${req.file ? 'exists' : 'null'}, req.files: ${req.files ? req.files.length : 'null'}`);
      if (req.file) {
        logger.info(`Upload middleware: File details - fieldname: ${req.file.fieldname}, originalname: ${req.file.originalname}, mimetype: ${req.file.mimetype}, size: ${req.file.size}`);
      }
      if (req.files && req.files.length > 0) {
        logger.info(`Upload middleware: Multiple files received: ${req.files.length}`);
        req.files.forEach((file, index) => {
          logger.info(`Upload middleware: File ${index} - fieldname: ${file.fieldname}, originalname: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}`);
        });
      }
      
      // Check if files were uploaded (only if not optional)
      if (!optional) {
        if (multiple && (!req.files || req.files.length === 0)) {
          logger.error('Upload middleware: No files uploaded for multiple upload');
          return res.status(400).json({
            success: false,
            message: 'No files uploaded'
          });
        }
        
        if (!multiple && !req.file) {
          logger.error('Upload middleware: No file uploaded for single upload');
          logger.error('Upload middleware: Request body keys:', Object.keys(req.body || {}));
          logger.error('Upload middleware: Request files:', req.files);
          logger.error('Upload middleware: Request file:', req.file);
          return res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
        }
      }
      
      next();
    });
  };
};

/**
 * Create admin route middleware that handles both file uploads and JSON parsing
 * @param {string} category - File category for uploads
 * @param {boolean} optional - Whether file upload is optional
 * @returns {Function} Express middleware
 */
const createAdminRouteMiddleware = (category = 'general', optional = true) => {
  return [
    // First handle file uploads if present
    (req, res, next) => {
      // Check if this is a multipart request (file upload)
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        logger.info('Admin route middleware: Detected multipart request, processing file upload');
        logger.info(`Admin route middleware: Setting fileCategory to: ${category}`);
        
        // Set the file category for the request BEFORE calling createMulterUpload
        req.fileCategory = category;
        
        const upload = createMulterUpload(category);
        // upload is now pre-configured with .single('file'), so we don't need to call .single('file') again
        upload(req, res, (error) => {
          if (error) {
            logger.error('Admin route middleware: File upload error:', error);
            return res.status(400).json({
              success: false,
              message: 'File upload failed',
              error: error.message
            });
          }
          
          // Check if file was uploaded (only if not optional)
          if (!optional && !req.file) {
            logger.error('Admin route middleware: No file uploaded for required upload');
            return res.status(400).json({
              success: false,
              message: 'No file uploaded'
            });
          }
          
          logger.info('Admin route middleware: File upload processed successfully');
          logger.info(`Admin route middleware: req.fileCategory set to: ${req.fileCategory}`);
          next();
        });
      } else {
        // Not a file upload, skip to next middleware
        logger.info('Admin route middleware: Not a file upload, skipping file processing');
        next();
      }
    },
    // Then parse JSON body if present
    (req, res, next) => {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        logger.info('Admin route middleware: Detected JSON request, parsing body');
        express.json({ limit: '10mb' })(req, res, next);
      } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        logger.info('Admin route middleware: Detected form data, parsing body');
        express.urlencoded({ extended: true })(req, res, next);
      } else {
        // No body parsing needed
        logger.info('Admin route middleware: No body parsing needed');
        next();
      }
    }
  ];
};

/**
 * Process uploaded files and create File documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const processUploadedFiles = async (req, res, next) => {
  try {
    const uploadedBy = req.user ? (req.user._id || req.user.id) : null;
    const category = req.fileCategory || 'general';
    const files = req.files || (req.file ? [req.file] : []);
    
    logger.info(`processUploadedFiles: Starting processing`);
    logger.info(`processUploadedFiles: req.fileCategory: ${req.fileCategory}`);
    logger.info(`processUploadedFiles: category variable: ${category}`);
    logger.info(`processUploadedFiles: Processing ${files.length} files for category ${category}`);
    logger.info(`processUploadedFiles: req.file exists: ${!!req.file}, req.files exists: ${!!req.files}`);
    
    if (files.length === 0) {
      logger.warn('processUploadedFiles: No files to process, calling next()');
      return next();
    }
    
    const processedFiles = [];
    
    for (const file of files) {
      try {
        logger.info(`processUploadedFiles: Processing file: ${file.filename}, path: ${file.path}`);
        
        // Get file stats
        const stats = await getFileStats(file.path);
        logger.info(`processUploadedFiles: File stats:`, stats);
        
        // Create File document using the static method
        const fileDoc = File.createFromUpload(file, uploadedBy, category, {
          dimensions: stats?.dimensions || null,
          workspace: req.workspace || null,
          project: req.project || null
        });
        
        // Save file document
        await fileDoc.save();
        logger.info(`processUploadedFiles: File document saved: ${fileDoc.filename}`);
        
        // Generate thumbnails for images
        const thumbnails = await generateThumbnails(file.path, category);
        
        // Add thumbnails to file document
        for (const thumbnail of thumbnails) {
          await fileDoc.addThumbnail(thumbnail.size, thumbnail.path, thumbnail.url);
        }
        
        processedFiles.push(fileDoc);
        
        logger.info(`File processed: ${fileDoc.filename}`);
      } catch (error) {
        logger.error(`Failed to process file ${file.filename}:`, error);
        // Continue processing other files
      }
    }
    
    // Attach processed files to request
    req.processedFiles = processedFiles;
    req.uploadedFile = processedFiles[0] || null; // For single file uploads
    
    logger.info(`processUploadedFiles: Final processed files count: ${processedFiles.length}, uploadedFile: ${req.uploadedFile ? req.uploadedFile.filename : 'null'}`);
    
    next();
  } catch (error) {
    logger.error('File processing error:', error);
    res.status(500).json({
      success: false,
      message: 'File processing failed',
      error: error.message
    });
  }
};

/**
 * Middleware to attach files to entities (tasks, comments, etc.)
 * @param {string} entityType - Type of entity to attach to
 * @returns {Function} Express middleware
 */
const attachFilesToEntity = (entityType) => {
  return async (req, res, next) => {
    try {
      const files = req.processedFiles || [];
      const entityId = req.params.id || req.body.entityId;
      
      if (!entityId || files.length === 0) {
        return next();
      }
      
      // Attach files to the specified entity
      for (const file of files) {
        await file.attachTo(entityType, entityId);
      }
      
      logger.info(`Attached ${files.length} files to ${entityType} ${entityId}`);
      next();
    } catch (error) {
      logger.error('File attachment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to attach files to entity',
        error: error.message
      });
    }
  };
};

/**
 * Validate file upload permissions
 * @param {Array} allowedRoles - Allowed user roles
 * @param {Array} allowedCategories - Allowed file categories
 * @returns {Function} Express middleware
 */
const validateUploadPermissions = (allowedRoles = [], allowedCategories = []) => {
  return (req, res, next) => {
    // Check user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for file upload'
      });
    }
    
    // Check user role if specified
    if (allowedRoles.length > 0) {
      const userRole = req.user.role || 'user';
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for file upload'
        });
      }
    }
    
    // Check file category if specified
    if (allowedCategories.length > 0 && req.fileCategory) {
      if (!allowedCategories.includes(req.fileCategory)) {
        return res.status(403).json({
          success: false,
          message: `File category '${req.fileCategory}' not allowed`
        });
      }
    }
    
    next();
  };
};

/**
 * Set workspace/project context for file uploads
 * @returns {Function} Express middleware
 */
const setUploadContext = () => {
  return (req, res, next) => {
    // Extract workspace/project from params or body
    req.workspace = (req.params && req.params.workspaceId) || (req.body && req.body.workspaceId) || null;
    req.project = (req.params && req.params.projectId) || (req.body && req.body.projectId) || null;
    
    // Set default values to prevent undefined errors
    req.workspaceId = req.workspace;
    req.projectId = req.project;
    
    next();
  };
};

// Pre-configured middleware for common use cases
const uploadMiddlewares = {
  avatar: createMulterUpload('avatar').single('avatar'),
  taskAttachment: createUploadMiddleware('task_attachment', true, 10, true), // Make task attachments optional
  commentAttachment: createUploadMiddleware('comment_attachment', true, 5, true), // Make comment attachments optional
  logo: createUploadMiddleware('logo', false),
  boardBackground: createUploadMiddleware('board_background', false),
  general: createUploadMiddleware('general', true, 5)
};

module.exports = {
  createUploadMiddleware,
  processUploadedFiles,
  attachFilesToEntity,
  validateUploadPermissions,
  setUploadContext,
  uploadMiddlewares,
  createAdminRouteMiddleware
};