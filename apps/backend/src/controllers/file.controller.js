const File = require('../models/File');
const { deleteFile, getFileStats, cleanupOldFiles } = require('../config/multer');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs').promises;

// Upload single file
const uploadFile = async (req, res) => {
  try {
    const file = req.uploadedFile;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: { file: file.toObject() }
    });
  } catch (error) {
    logger.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
  try {
    const files = req.processedFiles || [];
    
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    res.status(201).json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: {
        files: files.map(file => file.toObject()),
        count: files.length
      }
    });
  } catch (error) {
    logger.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed',
      error: error.message
    });
  }
};

// Get file by ID
const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    await file.incrementDownloadCount();
    
    res.json({
      success: true,
      data: { file: file.toObject() }
    });
  } catch (error) {
    logger.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file',
      error: error.message
    });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    await file.incrementDownloadCount();
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    const fileStream = require('fs').createReadStream(file.path);
    fileStream.pipe(res);
    
  } catch (error) {
    logger.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
};

// Get user files
const getUserFiles = async (req, res) => {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const userId = req.user.id;
    
    let query = { uploadedBy: userId, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const files = await File.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await File.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        files: files.map(file => file.toObject()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalItems: total,
          currentPage: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
};

// Delete file
const deleteFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check permissions
    if (file.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }
    
    await file.deleteFromStorage();
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  getFile,
  downloadFile,
  deleteFileById,
  getUserFiles
};