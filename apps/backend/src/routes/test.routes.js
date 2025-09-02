const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const logger = require('../config/logger');

// Test endpoint to create notifications for testing real-time functionality
router.post('/create-notification', authMiddleware, async (req, res) => {
  try {
    const { recipientId, title, message, type, relatedEntity } = req.body;
    
    // Validate required fields
    if (!recipientId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'recipientId, title, and message are required'
      });
    }

    // Get the global io instance
    const io = req.app.get('io');
    
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'Socket.IO not available'
      });
    }

    // Create and send notification using the global utility
    const notification = await io.sendNotification(recipientId, {
      title,
      message,
      type: type || 'system_alert',
      relatedEntity: relatedEntity || {
        entityType: 'user',
        entityId: recipientId
      },
      sender: req.user._id,
      category: 'system',
      priority: 'medium'
    });

    logger.info(`Test notification created: ${notification._id} for user ${recipientId}`);

    res.status(201).json({
      success: true,
      message: 'Test notification created and sent successfully',
      notification: {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    logger.error('Test notification creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
});

// Test endpoint to send bulk notifications
router.post('/bulk-notifications', authMiddleware, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'notifications array is required and must not be empty'
      });
    }

    const io = req.app.get('io');
    
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'Socket.IO not available'
      });
    }

    // Send bulk notifications
    const results = await io.sendBulkNotifications(notifications);

    logger.info(`Bulk test notifications sent: ${results.length} total`);

    res.status(200).json({
      success: true,
      message: 'Bulk notifications sent successfully',
      results
    });

  } catch (error) {
    logger.error('Bulk test notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications',
      error: error.message
    });
  }
});

// Test endpoint to broadcast system notification
router.post('/broadcast-system', authMiddleware, async (req, res) => {
  try {
    const { title, message, type, userFilter } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'title and message are required'
      });
    }

    const io = req.app.get('io');
    
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'Socket.IO not available'
      });
    }

    // Broadcast system notification
    const results = await io.broadcastSystemNotification({
      title,
      message,
      type: type || 'system_broadcast',
      category: 'system',
      priority: 'normal',
      sender: req.user._id
    }, userFilter || {});

    logger.info(`System broadcast sent: ${results.length} notifications`);

    res.status(200).json({
      success: true,
      message: 'System notification broadcasted successfully',
      results
    });

  } catch (error) {
    logger.error('System broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast system notification',
      error: error.message
    });
  }
});

// Test endpoint to check socket connection status
router.get('/socket-status', authMiddleware, (req, res) => {
  try {
    const io = req.app.get('io');
    
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'Socket.IO not available'
      });
    }

    // Get socket server info
    const serverInfo = {
      connected: io.engine.clientsCount,
      rooms: Object.keys(io.sockets.adapter.rooms).length,
      userRooms: Object.keys(io.sockets.adapter.rooms).filter(room => 
        room.startsWith('notifications:') || room.startsWith('activities:')
      ).length
    };

    res.status(200).json({
      success: true,
      message: 'Socket.IO status retrieved successfully',
      serverInfo
    });

  } catch (error) {
    logger.error('Socket status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get socket status',
      error: error.message
    });
  }
});

module.exports = router;
