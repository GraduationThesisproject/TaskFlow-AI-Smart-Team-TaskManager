const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');

/**
 * Create middleware to serve uploaded files
 * @returns {Function} Express middleware
 */
const createFileServeMiddleware = () => {
  return express.static(path.join(process.cwd(), 'uploads'), {
    // Set appropriate headers
    setHeaders: (res, filePath, stat) => {
      // Cache static files for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      // Set appropriate content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };
      
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    },
    
    // Handle errors
    fallthrough: false
  });
};

/**
 * Middleware to log file access
 * @returns {Function} Express middleware
 */
const logFileAccess = () => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful file access
      if (res.statusCode === 200) {
        logger.info(`File accessed: ${req.path} by ${req.ip}`);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to handle file access errors
 * @returns {Function} Express middleware
 */
const handleFileErrors = () => {
  return (error, req, res, next) => {
    if (error.code === 'ENOENT') {
      logger.warn(`File not found: ${req.path}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    if (error.code === 'EACCES') {
      logger.error(`File access denied: ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    logger.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  };
};

/**
 * Complete file serving middleware stack
 * @returns {Array} Array of Express middlewares
 */
const fileServeMiddleware = [
  logFileAccess(),
  createFileServeMiddleware(),
  handleFileErrors()
];

module.exports = {
  createFileServeMiddleware,
  logFileAccess,
  handleFileErrors,
  fileServeMiddleware
};
