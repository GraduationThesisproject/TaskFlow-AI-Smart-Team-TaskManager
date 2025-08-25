const Chat = require('../models/Chat');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

class ChatService {
  /**
   * Find or create a chat between user and admin
   */
  async findOrCreateChat(userId, adminId) {
    try {
      const chat = await Chat.findOrCreateChat(userId, 'User', adminId, 'Admin');
      logger.info(`Chat found/created: ${chat.chatId} between user ${userId} and admin ${adminId}`);
      return chat;
    } catch (error) {
      logger.error('Error finding/creating chat:', error);
      throw error;
    }
  }

  /**
   * Get all chats for an admin
   */
  async getAdminChats(adminId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        search,
        sortBy = 'lastMessage.timestamp',
        sortOrder = 'desc'
      } = options;

      const query = {
        'participants.id': adminId,
        'participants.model': 'Admin'
      };

      // Add filters
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { 'participants.name': { $regex: search, $options: 'i' } },
          { 'lastMessage.content': { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const chats = await Chat.find(query)
        .populate('participants.id', 'name avatar email')
        .populate('assignedTo', 'name avatar')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Chat.countDocuments(query);

      return {
        chats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting admin chats:', error);
      throw error;
    }
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sortBy = 'lastMessage.timestamp',
        sortOrder = 'desc'
      } = options;

      const query = {
        'participants.id': userId,
        'participants.model': 'User'
      };

      if (status) query.status = status;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const chats = await Chat.find(query)
        .populate('participants.id', 'name avatar email')
        .populate('assignedTo', 'name avatar')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Chat.countDocuments(query);

      return {
        chats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting user chats:', error);
      throw error;
    }
  }

  /**
   * Get chat by ID with messages
   */
  async getChatById(chatId, participantId) {
    try {
      const chat = await Chat.findOne({
        $or: [
          { chatId },
          { _id: chatId }
        ],
        'participants.id': participantId
      })
      .populate('participants.id', 'name avatar email')
      .populate('assignedTo', 'name avatar')
      .lean();

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Mark messages as read for the participant
      await Chat.findByIdAndUpdate(chat._id, {
        $set: {
          'messages.$[elem].isRead': true,
          'messages.$[elem].readAt': new Date()
        }
      }, {
        arrayFilters: [
          {
            'elem.sender.id': { $ne: participantId },
            'elem.isRead': false
          }
        ]
      });

      return chat;
    } catch (error) {
      logger.error('Error getting chat by ID:', error);
      throw error;
    }
  }

  /**
   * Add message to chat
   */
  async addMessage(chatId, messageData) {
    try {
      const chat = await Chat.findOne({
        $or: [
          { chatId },
          { _id: chatId }
        ]
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Validate sender is a participant
      const isParticipant = chat.participants.some(p => 
        p.id.toString() === messageData.sender.id.toString()
      );

      if (!isParticipant) {
        throw new Error('Sender is not a participant in this chat');
      }

      const message = {
        ...messageData,
        timestamp: new Date()
      };

      chat.messages.push(message);
      await chat.save();

      // Populate sender details for the response
      const populatedChat = await Chat.findById(chat._id)
        .populate('participants.id', 'name avatar email')
        .populate('assignedTo', 'name avatar')
        .lean();

      const addedMessage = populatedChat.messages[populatedChat.messages.length - 1];

      logger.info(`Message added to chat ${chatId}: ${messageData.content.substring(0, 50)}...`);

      return {
        chat: populatedChat,
        message: addedMessage
      };
    } catch (error) {
      logger.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Update chat status
   */
  async updateChatStatus(chatId, status, adminId) {
    try {
      const chat = await Chat.findOneAndUpdate(
        {
          $or: [
            { chatId },
            { _id: chatId }
          ],
          'participants.id': adminId,
          'participants.model': 'Admin'
        },
        {
          status,
          $set: {
            'lastMessage.timestamp': new Date()
          }
        },
        { new: true }
      ).populate('participants.id', 'name avatar email');

      if (!chat) {
        throw new Error('Chat not found or access denied');
      }

      logger.info(`Chat ${chatId} status updated to ${status} by admin ${adminId}`);
      return chat;
    } catch (error) {
      logger.error('Error updating chat status:', error);
      throw error;
    }
  }

  /**
   * Assign chat to admin
   */
  async assignChat(chatId, adminId, assignedBy) {
    try {
      const chat = await Chat.findOneAndUpdate(
        {
          $or: [
            { chatId },
            { _id: chatId }
          ]
        },
        {
          assignedTo: adminId,
          $push: {
            messages: {
              sender: {
                id: assignedBy,
                model: 'Admin',
                name: 'System'
              },
              content: `Chat assigned to admin`,
              messageType: 'system',
              timestamp: new Date()
            }
          }
        },
        { new: true }
      ).populate('participants.id', 'name avatar email')
       .populate('assignedTo', 'name avatar');

      if (!chat) {
        throw new Error('Chat not found');
      }

      logger.info(`Chat ${chatId} assigned to admin ${adminId}`);
      return chat;
    } catch (error) {
      logger.error('Error assigning chat:', error);
      throw error;
    }
  }

  /**
   * Get chat statistics for admin dashboard
   */
  async getChatStats(adminId) {
    try {
      const stats = await Chat.aggregate([
        {
          $match: {
            'participants.id': adminId,
            'participants.model': 'Admin'
          }
        },
        {
          $group: {
            _id: null,
            totalChats: { $sum: 1 },
            activeChats: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            resolvedChats: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            },
            pendingChats: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            urgentChats: {
              $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
            },
            highPriorityChats: {
              $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
            }
          }
        }
      ]);

      const unreadCount = await Chat.aggregate([
        {
          $match: {
            'participants.id': adminId,
            'participants.model': 'Admin'
          }
        },
        {
          $project: {
            unreadMessages: {
              $size: {
                $filter: {
                  input: '$messages',
                  as: 'msg',
                  cond: {
                    $and: [
                      { $eq: ['$$msg.isRead', false] },
                      { $ne: ['$$msg.sender.id', adminId] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUnread: { $sum: '$unreadMessages' }
          }
        }
      ]);

      return {
        ...stats[0],
        totalUnread: unreadCount[0]?.totalUnread || 0
      };
    } catch (error) {
      logger.error('Error getting chat stats:', error);
      throw error;
    }
  }

  /**
   * Search chats
   */
  async searchChats(query, adminId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'lastMessage.timestamp',
        sortOrder = 'desc'
      } = options;

      const searchQuery = {
        'participants.id': adminId,
        'participants.model': 'Admin',
        $or: [
          { 'participants.name': { $regex: query, $options: 'i' } },
          { 'lastMessage.content': { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { chatId: { $regex: query, $options: 'i' } }
        ]
      };

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const chats = await Chat.find(searchQuery)
        .populate('participants.id', 'name avatar email')
        .populate('assignedTo', 'name avatar')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Chat.countDocuments(searchQuery);

      return {
        chats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error searching chats:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();
