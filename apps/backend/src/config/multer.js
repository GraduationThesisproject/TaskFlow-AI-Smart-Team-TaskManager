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
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        logger.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }
};

// File type configurations (similar to Cloudinary upload options)
const fileTypeConfigs = {
  avatar: {
    folder: 'avatars',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
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
  board_background: {
    folder: 'boards',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 3 * 1024 * 1024, // 3MB
    thumbnails: [
      { name: 'preview', width: 800, height: 450 },
      { name: 'full', width: 1920, height: 1080 }
    ]
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
  destination: (req, file, cb) => {
    // Ensure workspaceId and spaceId are set to prevent undefined errors
    req.workspaceId = req.workspaceId || req.workspace || null;
    req.spaceId = req.spaceId || req.space || null;
    
    const category = req.fileCategory || 'general';
    const config = fileTypeConfigs[category] || fileTypeConfigs.general;
    const uploadPath = path.join(process.cwd(), 'uploads', config.folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const category = req.fileCategory || 'general';
    const userId = req.user ? req.user._id || req.user.id : null;
    const filename = generateFilename(file.originalname, category, userId);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const category = req.fileCategory || 'general';
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed for ${category}`), false);
  }
};

// Create multer instance
const createMulterUpload = (category = 'general') => {
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  
  return multer({
    storage: storage,
    limits: {
      fileSize: config.maxFileSize
    },
    fileFilter: fileFilter
  });
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
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
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
  deleteFile,
  ensureDirectoriesExist
};

