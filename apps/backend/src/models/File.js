const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  // Cloudinary information
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
    unique: true
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  secureUrl: {
    type: String,
    required: [true, 'Secure URL is required']
  },
  
  // File metadata
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
  format: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['image', 'video', 'raw', 'auto'],
    default: 'auto'
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  
  // Usage tracking
  attachedTo: [{
    entityType: {
      type: String,
      enum: ['User', 'Task', 'Comment', 'Project', 'Workspace', 'Board'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    attachedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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
  isProcessed: {
    type: Boolean,
    default: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  
  // Download and access tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  
  // File transformations (for images)
  transformations: [{
    name: String,
    url: String,
    transformation: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security and compliance
  scanStatus: {
    type: String,
    enum: ['pending', 'clean', 'infected', 'suspicious'],
    default: 'pending'
  },
  scanResults: {
    scannedAt: Date,
    threats: [String],
    scanEngine: String
  },
  
  // Metadata from Cloudinary
  cloudinaryMetadata: {
    etag: String,
    signature: String,
    version: Number,
    versionId: String,
    folder: String
  }
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
fileSchema.index({ publicId: 1 }, { unique: true });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ workspace: 1, category: 1 });
fileSchema.index({ project: 1, category: 1 });
fileSchema.index({ 'attachedTo.entityType': 1, 'attachedTo.entityId': 1 });
fileSchema.index({ category: 1, isActive: 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ size: 1 });

// Method to attach to entity
fileSchema.methods.attachTo = function(entityType, entityId) {
  const existingAttachment = this.attachedTo.find(attachment => 
    attachment.entityType === entityType && 
    attachment.entityId.toString() === entityId.toString()
  );
  
  if (!existingAttachment) {
    this.attachedTo.push({
      entityType,
      entityId,
      attachedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to detach from entity
fileSchema.methods.detachFrom = function(entityType, entityId) {
  this.attachedTo = this.attachedTo.filter(attachment => 
    !(attachment.entityType === entityType && 
      attachment.entityId.toString() === entityId.toString())
  );
  
  return this.save();
};

// Method to increment download count
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to add transformation
fileSchema.methods.addTransformation = function(name, url, transformation) {
  this.transformations.push({
    name,
    url,
    transformation
  });
  return this.save();
};

// Method to get optimized URL
fileSchema.methods.getOptimizedUrl = function(optimization = 'auto') {
  const { getOptimizedUrl } = require('../config/cloudinary');
  return getOptimizedUrl(this.publicId, optimization);
};

// Method to delete from Cloudinary
fileSchema.methods.deleteFromCloudinary = async function() {
  const { deleteFile } = require('../config/cloudinary');
  
  try {
    const deleted = await deleteFile(this.publicId);
    if (deleted) {
      this.isActive = false;
      await this.save();
    }
    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

// Static method to find by entity
fileSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'attachedTo.entityType': entityType,
    'attachedTo.entityId': entityId,
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

// Static method to find by project
fileSchema.statics.findByProject = function(projectId, category = null) {
  const query = { project: projectId, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get storage statistics
fileSchema.statics.getStorageStats = async function(workspaceId = null) {
  const matchStage = { isActive: true };
  if (workspaceId) {
    matchStage.workspace = mongoose.Types.ObjectId(workspaceId);
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
    { attachedTo: { $size: 0 }, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    { isActive: false }
  );
};

// Pre-save middleware to set workspace/project context
fileSchema.pre('save', async function(next) {
  if (this.isNew && this.attachedTo.length > 0) {
    const firstAttachment = this.attachedTo[0];
    
    try {
      // Try to determine workspace/project context
      switch (firstAttachment.entityType) {
        case 'Task':
          const Task = require('./Task');
          const task = await Task.findById(firstAttachment.entityId).populate('board');
          if (task && task.board && task.board.project) {
            this.project = task.board.project;
          }
          break;
        case 'Project':
          this.project = firstAttachment.entityId;
          break;
        case 'Workspace':
          this.workspace = firstAttachment.entityId;
          break;
      }
    } catch (error) {
      // Continue without setting context if there's an error
    }
  }
  
  next();
});

module.exports = mongoose.model('File', fileSchema);
