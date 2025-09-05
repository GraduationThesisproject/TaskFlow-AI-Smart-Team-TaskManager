const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp'); // For image processing
const env = require('./env');
const logger = require('./logger');

// Ensure upload directories exist
const ensureDirectoriesExist = async () => {
  const directories = [
    'uploads',
    'uploads/avatars',
    'uploads/tasks',
    'uploads/comments',
    'uploads/logos',
    'uploads/boards',
    'uploads/general',
    'uploads/thumbnails'
  ];

  for (const dir of directories) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      await fs.mkdir(fullPath, { recursive: true });
      logger.info(`✅ Created/verified directory: ${fullPath}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        logger.error(`❌ Failed to create directory ${dir}:`, error);
      } else {
        logger.info(`✅ Directory already exists: ${dir}`);
      }
    }
  }
};

// File type configurations (similar to Cloudinary upload options)
const fileTypeConfigs = {
  avatar: {
    folder: 'avatars',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB (increased from 2MB)
    thumbnails: [
      { name: 'small', width: 50, height: 50 },
      { name: 'medium', width: 150, height: 150 },
      { name: 'large', width: 300, height: 300 }
    ]
  },
  task_attachment: {
    folder: 'tasks',
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-zip-compressed'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    thumbnails: [
      { name: 'preview', width: 300, height: 200 }
    ]
  },
  comment_attachment: {
    folder: 'comments',
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    thumbnails: [
      { name: 'preview', width: 200, height: 150 }
    ]
  },
  logo: {
    folder: 'logos',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    thumbnails: [
      { name: 'small', width: 100, height: 100 },
      { name: 'medium', width: 200, height: 200 },
      { name: 'large', width: 400, height: 400 }
    ]
  },
  workspace_avatar: {
    folder: 'avatars',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    thumbnails: [
      { name: 'small', width: 50, height: 50 },
      { name: 'medium', width: 150, height: 150 },
      { name: 'large', width: 300, height: 300 }
    ]
  },
  board_background: {
    folder: 'boards',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 3 * 1024 * 1024, // 3MB
    thumbnails: [
      { name: 'preview', width: 800, height: 450 },
      { name: 'full', width: 1920, height: 1080 }
    ]
  },
  workspace_rules: {
    folder: 'rules',
    allowedMimeTypes: ['application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    thumbnails: []
  },
  general: {
    folder: 'general',
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    thumbnails: []
  }
};

// Validate file type configurations
const validateFileTypeConfigs = () => {
  const requiredProps = ['folder', 'allowedMimeTypes', 'maxFileSize'];
  
  for (const [category, config] of Object.entries(fileTypeConfigs)) {
    for (const prop of requiredProps) {
      if (!(prop in config)) {
        throw new Error(`Missing required property '${prop}' in fileTypeConfigs.${category}`);
      }
    }
    
    if (!Array.isArray(config.allowedMimeTypes)) {
      throw new Error(`allowedMimeTypes must be an array in fileTypeConfigs.${category}`);
    }
    
    if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
      throw new Error(`maxFileSize must be a positive number in fileTypeConfigs.${category}`);
    }
    
    if (config.thumbnails && !Array.isArray(config.thumbnails)) {
      throw new Error(`thumbnails must be an array in fileTypeConfigs.${category}`);
    }
  }
  
  logger.info('✅ File type configurations validated successfully');
};

// Validate configurations on module load
try {
  validateFileTypeConfigs();
} catch (error) {
  logger.error('❌ File type configuration validation failed:', error.message);
  throw error;
}

// Generate unique filename
const generateFilename = (originalname, category = 'general', userId = null) => {
  const ext = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, ext);
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(6).toString('hex');
  const userPrefix = userId ? `${userId}_` : '';
  
  return `${category}_${userPrefix}${timestamp}_${randomId}${ext}`;
};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Ensure workspaceId and spaceId are set to prevent undefined errors
      req.workspaceId = req.workspaceId || req.workspace || null;
      req.spaceId = req.spaceId || req.space || null;
      
      const category = req.fileCategory || 'general';
      const config = fileTypeConfigs[category] || fileTypeConfigs.general;
      const uploadPath = path.join(process.cwd(), 'uploads', config.folder);
      
      logger.info(`Storage destination: File ${file.originalname}`);
      logger.info(`Storage destination: req.fileCategory: ${req.fileCategory}`);
      logger.info(`Storage destination: category variable: ${category}`);
      logger.info(`Storage destination: config.folder: ${config.folder}`);
      logger.info(`Storage destination: uploadPath: ${uploadPath}`);
      
      // Ensure the destination directory exists
      try {
        await fs.mkdir(uploadPath, { recursive: true });
        logger.info(`✅ Destination directory ready: ${uploadPath}`);
        cb(null, uploadPath);
      } catch (mkdirError) {
        logger.error(`❌ Failed to create destination directory: ${uploadPath}`, mkdirError);
        cb(new Error(`Failed to create upload directory: ${mkdirError.message}`));
      }
    } catch (error) {
      logger.error(`❌ Storage destination error:`, error);
      cb(new Error(`Storage configuration error: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const category = req.fileCategory || 'general';
      const userId = req.user ? req.user._id || req.user.id : null;
      const filename = generateFilename(file.originalname, category, userId);
      
      logger.info(`Storage filename: File ${file.originalname} -> ${filename}, userId: ${userId}`);
      cb(null, filename);
    } catch (error) {
      logger.error(`❌ Storage filename error:`, error);
      cb(new Error(`Filename generation error: ${error.message}`));
    }
  }
});

// Helper function to validate file type
const isValidFileType = (mimeType, allowedTypes) => {
  return allowedTypes.some(allowedType => {
    // Handle wildcard MIME types (e.g., 'image/*')
    if (allowedType.endsWith('/*')) {
      const baseType = allowedType.split('/')[0];
      return mimeType.startsWith(baseType + '/');
    }
    // Handle exact MIME type matches
    return mimeType === allowedType;
  });
};

// File filter function
const fileFilter = (req, file, cb) => {
  const category = req.fileCategory || 'general';
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  
  logger.info(`File filter: Processing file ${file.originalname}, mimetype: ${file.mimetype}, category: ${category}`);
  logger.info(`File filter: Allowed types for ${category}:`, config.allowedMimeTypes);
  
  // Check if the file's MIME type is allowed
  const isAllowed = isValidFileType(file.mimetype, config.allowedMimeTypes);
  
  if (isAllowed) {
    logger.info(`File filter: File ${file.originalname} accepted (MIME type: ${file.mimetype})`);
    cb(null, true);
  } else {
    logger.error(`File filter: File type ${file.mimetype} is not allowed for ${category}`);
    cb(new Error(`File type ${file.mimetype} is not allowed for ${category}`), false);
  }
};

// Create multer instance
const createMulterUpload = (category = 'general') => {
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  
  logger.info(`createMulterUpload: Creating upload for category: ${category}`);
  logger.info(`createMulterUpload: Using config:`, {
    folder: config.folder,
    maxFileSize: config.maxFileSize,
    maxFileSizeMB: (config.maxFileSize / (1024 * 1024)).toFixed(2) + 'MB'
  });
  
  // Validate category configuration
  if (!config) {
    logger.error(`createMulterUpload: Invalid category: ${category}`);
    throw new Error(`Invalid upload category: ${category}`);
  }
  
  return multer({
    storage: storage,
    limits: {
      fileSize: config.maxFileSize
    },
    fileFilter: (req, file, cb) => {
      try {
        // Ensure the fileCategory is set for this request
        req.fileCategory = category;
        logger.info(`createMulterUpload: Set req.fileCategory to ${category} for file ${file.originalname}`);
        
        // Call the original fileFilter with the updated req object
        fileFilter(req, file, cb);
      } catch (error) {
        logger.error(`createMulterUpload: Error in fileFilter:`, error);
        cb(new Error(`File filter error: ${error.message}`));
      }
    }
  }); // Return multer instance without pre-configuring upload type
};

// Generate thumbnails for images
const generateThumbnails = async (filePath, category = 'general') => {
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  
  if (!config.thumbnails || config.thumbnails.length === 0) {
    return [];
  }
  
  const thumbnails = [];
  const baseDir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  
  // Check if file is an image
  const mimeType = await getFileMimeType(filePath);
  if (!mimeType.startsWith('image/')) {
    return [];
  }
  
  for (const thumbConfig of config.thumbnails) {
    try {
      const thumbPath = path.join(baseDir, '..', 'thumbnails', `${baseName}_${thumbConfig.name}${ext}`);
      const thumbDir = path.dirname(thumbPath);
      
      // Ensure thumbnail directory exists
      await fs.mkdir(thumbDir, { recursive: true });
      
      // Generate thumbnail
      await sharp(filePath)
        .resize(thumbConfig.width, thumbConfig.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      
      const baseUrl = env.BASE_URL || 'http://localhost:5000';
      const thumbUrl = `${baseUrl}/uploads/thumbnails/${path.basename(thumbPath)}`;
      
      thumbnails.push({
        size: thumbConfig.name,
        path: thumbPath,
        url: thumbUrl
      });
      
      logger.info(`Generated thumbnail: ${thumbConfig.name} for ${filePath}`);
    } catch (error) {
      logger.error(`Failed to generate thumbnail ${thumbConfig.name}:`, error);
    }
  }
  
  return thumbnails;
};

// Get file MIME type
const getFileMimeType = async (filePath) => {
  try {
    // Try to use file-type if available
    const fileType = require('file-type');
    if (fileType && fileType.fileTypeFromFile) {
      const result = await fileType.fileTypeFromFile(filePath);
      return result ? result.mime : 'application/octet-stream';
    }
  } catch (error) {
    // Fallback if file-type is not available
    logger.warn('file-type module not available, using fallback');
  }
  return 'application/octet-stream';
};

// Get file statistics
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const result = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
    
    // Try to get image dimensions if it's an image file
    try {
      const mimeType = await getFileMimeType(filePath);
      if (mimeType.startsWith('image/')) {
        const imageInfo = await sharp(filePath).metadata();
        result.dimensions = {
          width: imageInfo.width,
          height: imageInfo.height
        };
      }
    } catch (dimensionError) {
      logger.warn(`Failed to get image dimensions for ${filePath}:`, dimensionError);
      // Continue without dimensions
    }
    
    return result;
  } catch (error) {
    logger.error(`Failed to get file stats for ${filePath}:`, error);
    return null;
  }
};

// Delete file and its thumbnails
const deleteFile = async (filePath) => {
  try {
    // Delete main file
    await fs.unlink(filePath);
    logger.info(`Deleted file: ${filePath}`);
    
    // Delete thumbnails
    const baseDir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const thumbDir = path.join(baseDir, '..', 'thumbnails');
    
    try {
      const files = await fs.readdir(thumbDir);
      const thumbFiles = files.filter(file => file.startsWith(baseName));
      
      for (const thumbFile of thumbFiles) {
        await fs.unlink(path.join(thumbDir, thumbFile));
        logger.info(`Deleted thumbnail: ${thumbFile}`);
      }
    } catch (error) {
      logger.error(`Failed to delete thumbnails for ${filePath}:`, error);
    }
  } catch (error) {
    logger.error(`Failed to delete file ${filePath}:`, error);
  }
};

// Export functions
module.exports = {
  createMulterUpload,
  generateThumbnails,
  getFileStats,
  getFileMimeType,
  fileTypeConfigs, // Export the file type configurations
  ensureDirectoriesExist,
  deleteFile, // Add the missing deleteFile export
  isValidFileType, // Export the file type validation helper
  validateFileTypeConfigs // Export the configuration validation function
};



