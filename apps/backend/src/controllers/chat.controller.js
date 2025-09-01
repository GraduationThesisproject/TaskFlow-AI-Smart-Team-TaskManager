const Chat = require('../models/Chat');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const mongoose = require('mongoose');

// Start a new chat (public - for user chat widget)
const startChat = async (req, res) => {
  try {
    const { name, email, message, category = 'general', priority = 'medium' } = req.body;

    if (!name || !email || !message) {
      return sendResponse(res, 400, false, 'Name, email, and message are required');
    }

    // Create temporary ObjectId for anonymous user
    const tempUserId = new mongoose.Types.ObjectId();
    
    // Create new chat
    const chat = new Chat({
      chatId: `chat_${Date.now()}`,
      participants: [{
        id: tempUserId,
        name,
        email,
        model: 'User'
      }],
      messages: [{
        content: message,
        messageType: 'text',
        sender: {
          id: tempUserId,
          name,
          model: 'User'
        },
        isRead: false
      }],
      status: 'pending',
      priority,
      category,
      lastMessage: {
        content: message,
        timestamp: new Date(),
        sender: {
          id: tempUserId.toString(),
          name
        }
      }
    });

    await chat.save();

    // Emit socket event for admin notification
    const io = req.app.get('io');
    if (io) {
      const chatNamespace = io.of('/chat');
      const adminRoom = chatNamespace.adapter.rooms.get('admins');
      
      logger.info(`Socket.IO debug: Chat namespace exists: ${!!chatNamespace}`);
      logger.info(`Socket.IO debug: Admin room size: ${adminRoom ? adminRoom.size : 0}`);
      logger.info(`Socket.IO debug: Total connected sockets in chat namespace: ${chatNamespace.sockets.size}`);
      
      // Emit to chat namespace admin room
      chatNamespace.to('admins').emit('admin:new-chat-request', {
        chatId: chat._id,
        user: {
          _id: tempUserId,
          name,
          email,
          model: 'User'
        },
        message,
        category,
        priority,
        timestamp: new Date()
      });
      
      // Also emit to all connected sockets in chat namespace for testing
      chatNamespace.emit('admin:new-chat-request', {
        chatId: chat._id,
        user: {
          _id: tempUserId,
          name,
          email,
          model: 'User'
        },
        message,
        category,
        priority,
        timestamp: new Date()
      });
      
      logger.info(`Emitted new chat request to admins for chat: ${chat._id}`);
    } else {
      logger.error('Socket.IO instance not found!');
    }

    sendResponse(res, 201, true, 'Chat started successfully', { chat });
  } catch (error) {
    logger.error('Start chat error:', error);
    sendResponse(res, 500, false, 'Server error starting chat');
  }
};

// Send message from user (public)
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, name, email } = req.body;

    if (!content) {
      return sendResponse(res, 400, false, 'Message content is required');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    // Create temporary ObjectId for message sender
    const tempUserId = new mongoose.Types.ObjectId();
    
    const message = {
      content,
      messageType: 'text',
      sender: {
        id: tempUserId,
        name: name || 'Anonymous',
        model: 'User'
      },
      isRead: false,
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      timestamp: new Date(),
      sender: {
        id: tempUserId.toString(),
        name: name || 'Anonymous'
      }
    };
    chat.updatedAt = new Date();

    await chat.save();

    // Emit socket event for real-time messaging
    req.app.get('io').emit('chat:message', {
      chatId,
      message
    });

    sendResponse(res, 200, true, 'Message sent successfully', { message });
  } catch (error) {
    logger.error('Send message error:', error);
    sendResponse(res, 500, false, 'Server error sending message');
  }
};

// Get active chats for admin
const getActiveChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      status: { $in: ['pending', 'active'] }
    }).sort({ updatedAt: -1 });

    sendResponse(res, 200, true, 'Active chats retrieved successfully', { chats });
  } catch (error) {
    logger.error('Get active chats error:', error);
    sendResponse(res, 500, false, 'Server error retrieving active chats');
  }
};

// Get chat statistics for admin
const getChatStats = async (req, res) => {
  try {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const pendingChats = await Chat.countDocuments({ status: 'pending' });
    const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
    const closedChats = await Chat.countDocuments({ status: 'closed' });

    // Get total messages
    const chats = await Chat.find();
    const totalMessages = chats.reduce((total, chat) => total + chat.messages.length, 0);

    // Calculate average response time (simplified)
    const activeChatsWithMessages = chats.filter(chat => 
      chat.status === 'active' && chat.messages.length > 1
    );
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    activeChatsWithMessages.forEach(chat => {
      const userMessages = chat.messages.filter(m => m.sender.model === 'User');
      const adminMessages = chat.messages.filter(m => m.sender.model === 'Admin');
      
      if (userMessages.length > 0 && adminMessages.length > 0) {
        const firstUserMessage = userMessages[0];
        const firstAdminResponse = adminMessages[0];
        
        if (firstAdminResponse.createdAt > firstUserMessage.createdAt) {
          const responseTime = firstAdminResponse.createdAt - firstUserMessage.createdAt;
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60) : 0; // in minutes

    // Get unread message count
    const totalUnread = chats.reduce((total, chat) => {
      return total + chat.messages.filter(m => !m.isRead && m.sender.model === 'User').length;
    }, 0);

    // Get chats by category
    const chatsByCategory = {};
    chats.forEach(chat => {
      const category = chat.category || 'other';
      chatsByCategory[category] = (chatsByCategory[category] || 0) + 1;
    });

    // Get chats by priority
    const chatsByPriority = {};
    chats.forEach(chat => {
      const priority = chat.priority || 'medium';
      chatsByPriority[priority] = (chatsByPriority[priority] || 0) + 1;
    });

    const stats = {
      totalChats,
      activeChats,
      pendingChats,
      resolvedChats,
      closedChats,
      totalMessages,
      averageResponseTime: Math.round(averageResponseTime),
      totalUnread,
      chatsByCategory,
      chatsByPriority
    };

    sendResponse(res, 200, true, 'Chat statistics retrieved successfully', { stats });
  } catch (error) {
    logger.error('Get chat stats error:', error);
    sendResponse(res, 500, false, 'Server error retrieving chat statistics');
  }
};

// Accept chat (admin)
const acceptChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const adminId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    if (chat.status !== 'pending') {
      return sendResponse(res, 400, false, 'Chat is not pending');
    }

    // Add admin to participants
    chat.participants.push({
      _id: adminId,
      name: req.user.name || 'Admin',
      email: req.user.email,
      model: 'Admin'
    });

    chat.status = 'active';
    chat.assignedTo = adminId;
    chat.updatedAt = new Date();

    await chat.save();

    // Emit socket event
    req.app.get('io').emit('admin:chat-accepted', {
      chatId,
      adminId
    });

    sendResponse(res, 200, true, 'Chat accepted successfully', { chat });
  } catch (error) {
    logger.error('Accept chat error:', error);
    sendResponse(res, 500, false, 'Server error accepting chat');
  }
};

// Send admin message
const sendAdminMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const adminId = req.user.id;

    if (!content) {
      return sendResponse(res, 400, false, 'Message content is required');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    if (chat.status === 'closed') {
      return sendResponse(res, 400, false, 'Cannot send message to closed chat');
    }

    const message = {
      content,
      messageType,
      sender: {
        _id: adminId,
        name: req.user.name || 'Admin',
        email: req.user.email,
        model: 'Admin'
      },
      isRead: false,
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      timestamp: new Date(),
      sender: {
        id: adminId,
        name: req.user.name || 'Admin'
      }
    };
    chat.updatedAt = new Date();

    await chat.save();

    // Emit socket event
    req.app.get('io').emit('chat:message', {
      chatId,
      message
    });

    sendResponse(res, 200, true, 'Message sent successfully', { message });
  } catch (error) {
    logger.error('Send admin message error:', error);
    sendResponse(res, 500, false, 'Server error sending message');
  }
};

// Update chat status
const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return sendResponse(res, 400, false, 'Status is required');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    chat.status = status;
    if (reason) {
      chat.notes = reason;
    }
    chat.updatedAt = new Date();

    await chat.save();

    // Emit socket event
    req.app.get('io').emit('chat:status-updated', {
      chatId,
      status,
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    sendResponse(res, 200, true, 'Chat status updated successfully', { chat });
  } catch (error) {
    logger.error('Update chat status error:', error);
    sendResponse(res, 500, false, 'Server error updating chat status');
  }
};

// Close chat
const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reason } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    chat.status = 'closed';
    if (reason) {
      chat.notes = reason;
    }
    chat.updatedAt = new Date();

    await chat.save();

    // Emit socket event
    req.app.get('io').emit('chat:closed', {
      chatId,
      reason
    });

    sendResponse(res, 200, true, 'Chat closed successfully', { chat });
  } catch (error) {
    logger.error('Close chat error:', error);
    sendResponse(res, 500, false, 'Server error closing chat');
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    // Get messages with limit
    const messages = chat.messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit))
      .reverse();

    sendResponse(res, 200, true, 'Chat history retrieved successfully', { messages });
  } catch (error) {
    logger.error('Get chat history error:', error);
    sendResponse(res, 500, false, 'Server error retrieving chat history');
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return sendResponse(res, 400, false, 'Message IDs array is required');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    // Mark specified messages as read
    chat.messages.forEach(message => {
      if (messageIds.includes(message._id.toString())) {
        message.isRead = true;
      }
    });

    await chat.save();

    sendResponse(res, 200, true, 'Messages marked as read successfully');
  } catch (error) {
    logger.error('Mark messages as read error:', error);
    sendResponse(res, 500, false, 'Server error marking messages as read');
  }
};

// Search chats
const searchChats = async (req, res) => {
  try {
    const { query, status, priority, category, assignedTo, dateFrom, dateTo } = req.query;

    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { 'participants.name': { $regex: query, $options: 'i' } },
        { 'participants.email': { $regex: query, $options: 'i' } },
        { 'messages.content': { $regex: query, $options: 'i' } }
      ];
    }

    if (status) searchCriteria.status = status;
    if (priority) searchCriteria.priority = priority;
    if (category) searchCriteria.category = category;
    if (assignedTo) searchCriteria.assignedTo = assignedTo;

    if (dateFrom || dateTo) {
      searchCriteria.createdAt = {};
      if (dateFrom) searchCriteria.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchCriteria.createdAt.$lte = new Date(dateTo);
    }

    const chats = await Chat.find(searchCriteria).sort({ updatedAt: -1 });

    sendResponse(res, 200, true, 'Chats searched successfully', { chats });
  } catch (error) {
    logger.error('Search chats error:', error);
    sendResponse(res, 500, false, 'Server error searching chats');
  }
};

// Get chat by ID
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendResponse(res, 404, false, 'Chat not found');
    }

    sendResponse(res, 200, true, 'Chat retrieved successfully', { chat });
  } catch (error) {
    logger.error('Get chat by ID error:', error);
    sendResponse(res, 500, false, 'Server error retrieving chat');
  }
};

module.exports = {
  startChat,
  sendMessage,
  getActiveChats,
  getChatStats,
  acceptChat,
  sendAdminMessage,
  updateChatStatus,
  closeChat,
  getChatHistory,
  markMessagesAsRead,
  searchChats,
  getChatById
};
