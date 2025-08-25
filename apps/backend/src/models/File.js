const mongoose = require('mongoose');
const path = require('path');

// NOTE: This File model supports ONLY local disk storage.
// Cloud/CDN integrations (url field) are not supported in this version.

const fileSchema = new mongoose.Schema({
  // Local file information
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  extension: {
    type: String,
    required: true
  },
  
  // File integrity and security
  checksum: {
    type: String,
    required: [true, 'File checksum is required for integrity verification']
  },
  
  // File categorization
  category: {
    type: String,
    enum: ['avatar', 'task_attachment', 'comment_attachment', 'logo', 'board_background', 'general'],
    required: true
  },
  
  // Ownership and access
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    default: null
  },
  
  // Usage tracking - Enhanced with model reference
  attachedTo: {
    model: {
      type: String,
      enum: ['User', 'Task', 'Comment', 'Space', 'Workspace', 'Board'],
      required: true
    },
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    attachedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // File properties
  dimensions: {
    width: Number,
    height: Number
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // File status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Additional fields needed for uploads
  url: {
    type: String,
    required: true
  },
  encoding: {
    type: String,
    default: '7bit'
  },
  fieldname: {
    type: String,
    default: 'file'
  },
  
  // File transformations (for images)
  thumbnails: [{
    size: String, // e.g., 'small', 'medium', 'large' or '150x150'
    path: String,
    url: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file type
fileSchema.virtual('fileType').get(function() {
  if (this.mimeType.startsWith('image/')) return 'image';
  if (this.mimeType.startsWith('video/')) return 'video';
  if (this.mimeType.startsWith('audio/')) return 'audio';
  if (this.mimeType.includes('pdf')) return 'pdf';
  if (this.mimeType.includes('word') || this.mimeType.includes('document')) return 'document';
  if (this.mimeType.includes('sheet') || this.mimeType.includes('excel')) return 'spreadsheet';
  if (this.mimeType.includes('text')) return 'text';
  if (this.mimeType.includes('zip') || this.mimeType.includes('archive')) return 'archive';
  return 'unknown';
});

// Virtual for human readable file size
fileSchema.virtual('humanSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for is image
fileSchema.virtual('isImage').get(function() {
  return this.fileType === 'image';
});

// Virtual for can preview
fileSchema.virtual('canPreview').get(function() {
  const previewableTypes = ['image', 'pdf', 'text'];
  return previewableTypes.includes(this.fileType);
});

// Indexes for efficient queries
// Filename index is created automatically by 'unique: true' in schema
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ workspace: 1, category: 1 });
fileSchema.index({ space: 1, category: 1 });
fileSchema.index({ 'attachedTo.entityType': 1, 'attachedTo.entityId': 1 });
fileSchema.index({ category: 1, isActive: 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ size: 1 });
fileSchema.index({ originalName: 1 });

// Method to attach to entity
fileSchema.methods.attachTo = function(model, objectId) {
  this.attachedTo = {
    model,
    objectId,
    attachedAt: new Date()
  };
  
  return this.save();
};

// Method to detach from entity
fileSchema.methods.detachFrom = function() {
  this.attachedTo = null;
  return this.save();
};

// Method to increment download count
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to add thumbnail
fileSchema.methods.addThumbnail = function(size, thumbnailPath, thumbnailUrl) {
  this.thumbnails.push({
    size,
    path: thumbnailPath,
    url: thumbnailUrl
  });
  return this.save();
};

// Method to get thumbnail URL
fileSchema.methods.getThumbnailUrl = function(size = 'medium') {
  const thumbnail = this.thumbnails.find(thumb => thumb.size === size);
  return thumbnail ? thumbnail.url : this.url;
};

// Method to verify file integrity
fileSchema.methods.verifyIntegrity = async function() {
  const crypto = require('crypto');
  const fs = require('fs');
  
  try {
    if (!fs.existsSync(this.path)) {
      return { valid: false, error: 'File not found on disk' };
    }
    
    const fileBuffer = fs.readFileSync(this.path);
    const currentChecksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
    
    return {
      valid: currentChecksum === this.checksum,
      currentChecksum,
      storedChecksum: this.checksum,
      fileSize: fileBuffer.length
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Method to delete file from local storage
fileSchema.methods.deleteFromStorage = async function() {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Delete main file
    await fs.unlink(this.path);
    
    // Delete thumbnails
    for (const thumbnail of this.thumbnails) {
      try {
        await fs.unlink(thumbnail.path);
      } catch (error) {
        console.warn(`Failed to delete thumbnail: ${thumbnail.path}`, error.message);
      }
    }
    
    this.isActive = false;
    await this.save();
    return true;
  } catch (error) {
    throw new Error(`Failed to delete file from storage: ${error.message}`);
  }
};

// Static method to find by entity
fileSchema.statics.findByEntity = function(model, objectId) {
  return this.find({
    'attachedTo.model': model,
    'attachedTo.objectId': objectId,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to find by user
fileSchema.statics.findByUser = function(userId, category = null) {
  const query = { uploadedBy: userId, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find by workspace
fileSchema.statics.findByWorkspace = function(workspaceId, category = null) {
  const query = { workspace: workspaceId, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find by space
fileSchema.statics.findBySpace = function(spaceId, category = null) {
  const query = { space: spaceId, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get storage statistics
fileSchema.statics.getStorageStats = async function(workspaceId = null) {
  const matchStage = { isActive: true };
  if (workspaceId) {
    matchStage.workspace = new mongoose.Types.ObjectId(workspaceId);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        averageSize: { $avg: '$size' }
      }
    },
    {
      $group: {
        _id: null,
        categories: {
          $push: {
            category: '$_id',
            count: '$count',
            totalSize: '$totalSize',
            averageSize: '$averageSize'
          }
        },
        totalFiles: { $sum: '$count' },
        totalStorage: { $sum: '$totalSize' }
      }
    }
  ]);

  return stats[0] || {
    categories: [],
    totalFiles: 0,
    totalStorage: 0
  };
};

// Static method to cleanup orphaned files
fileSchema.statics.cleanupOrphaned = function() {
  return this.updateMany(
    { attachedTo: null, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    { isActive: false }
  );
};

// Static method to create from Multer upload
fileSchema.statics.createFromUpload = function(multerFile, uploadedBy, category = 'general', additionalData = {}) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  
  // Import fileTypeConfigs from multer config to get the correct storage folder
  const { fileTypeConfigs } = require('../config/multer');
  const config = fileTypeConfigs[category] || fileTypeConfigs.general;
  const storageFolder = config.folder;
  
  // Use the actual storage folder name in the URL
  const url = `${baseUrl}/uploads/${storageFolder}/${multerFile.filename}`;
  
  // Log the URL construction for debugging
  console.log(`File.createFromUpload: category: ${category}, storageFolder: ${storageFolder}, url: ${url}`);
  
  const crypto = require('crypto');
  const fs = require('fs');
  
  // Generate checksum for file integrity
  const fileBuffer = fs.readFileSync(multerFile.path);
  const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
  
  return new this({
    filename: multerFile.filename,
    originalName: multerFile.originalname,
    mimeType: multerFile.mimetype,
    size: multerFile.size,
    path: multerFile.path,
    url: url,
    extension: require('path').extname(multerFile.originalname).substring(1), // Remove the dot
    checksum: checksum,
    encoding: multerFile.encoding || '7bit',
    fieldname: multerFile.fieldname || 'file',
    uploadedBy: uploadedBy,
    category: category,
    attachedTo: {
      model: 'User', // Default to User for avatar uploads
      objectId: uploadedBy,
      attachedAt: new Date()
    },
    ...additionalData
  });
};

    // Pre-save middleware to set workspace/space context and file extension
fileSchema.pre('save', async function(next) {
  // Set file extension if not already set
  if (this.isNew && !this.extension && this.originalName) {
    this.extension = require('path').extname(this.originalName).substring(1); // Remove the dot
  }
  
  if (this.isNew && this.attachedTo) {
    try {
              // Try to determine workspace/space context
      switch (this.attachedTo.model) {
        case 'Task':
          const Task = require('./Task');
          const task = await Task.findById(this.attachedTo.objectId).populate('board');
                      if (task && task.board && task.board.space) {
                this.space = task.board.space;
            }
          break;
                  case 'Space':
            this.space = this.attachedTo.objectId;
          break;
        case 'Workspace':
          this.workspace = this.attachedTo.objectId;
          break;
        case 'Space':
          this.space = this.attachedTo.objectId;
          break;
      }
    } catch (error) {
      // Continue without setting context if there's an error
    }
  }
  
  next();
});

module.exports = mongoose.model('File', fileSchema);
