const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['User', 'Admin']
    },
    name: {
      type: String,
      required: true
    },
    avatar: String
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  participants: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['User', 'Admin']
    },
    name: String,
    avatar: String,
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: Date
  }],
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed', 'pending'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'feature_request', 'bug_report', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  tags: [String],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      id: mongoose.Schema.Types.ObjectId,
      name: String
    }
  },
  metrics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    responseTime: {
      firstResponse: Number, // in minutes
      averageResponse: Number // in minutes
    },
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      timestamp: Date
    }
  },
  settings: {
    autoAssign: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ 'participants.id': 1, 'participants.model': 1 });
chatSchema.index({ status: 1, priority: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ createdAt: -1 });

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  if (!this.messages || !this.participants) return 0;
  
  const currentParticipant = this.participants.find(p => 
    p.id.toString() === this.currentParticipantId
  );
  
  if (!currentParticipant) return 0;
  
  return this.messages.filter(msg => 
    !msg.isRead && 
    msg.sender.id.toString() !== currentParticipant.id.toString()
  ).length;
});

// Pre-save middleware to update lastMessage
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      timestamp: lastMsg.createdAt,
      sender: {
        id: lastMsg.sender.id,
        name: lastMsg.sender.name
      }
    };
    this.metrics.totalMessages = this.messages.length;
  }
  next();
});

// Static method to find or create chat
chatSchema.statics.findOrCreateChat = async function(userId, userModel, adminId, adminModel) {
  const existingChat = await this.findOne({
    'participants.id': { $all: [userId, adminId] },
    'participants.model': { $all: [userModel, adminModel] }
  });

  if (existingChat) {
    return existingChat;
  }

  // Get user and admin details
  const User = mongoose.model(userModel);
  const Admin = mongoose.model(adminModel);
  
  const [user, admin] = await Promise.all([
    User.findById(userId).select('name avatar'),
    Admin.findById(adminId).select('name avatar')
  ]);

  if (!user || !admin) {
    throw new Error('User or Admin not found');
  }

  const chatId = `chat_${userId}_${adminId}_${Date.now()}`;
  
  const newChat = new this({
    chatId,
    participants: [
      {
        id: userId,
        model: userModel,
        name: user.name,
        avatar: user.avatar
      },
      {
        id: adminId,
        model: adminModel,
        name: admin.name,
        avatar: admin.avatar
      }
    ]
  });

  return await newChat.save();
};

// Instance method to add message
chatSchema.methods.addMessage = async function(messageData) {
  this.messages.push(messageData);
  return await this.save();
};

// Instance method to mark messages as read
chatSchema.methods.markMessagesAsRead = async function(participantId) {
  const unreadMessages = this.messages.filter(msg => 
    !msg.isRead && 
    msg.sender.id.toString() !== participantId.toString()
  );

  if (unreadMessages.length > 0) {
    await Promise.all(unreadMessages.map(msg => {
      msg.isRead = true;
      msg.readAt = new Date();
    }));
    return await this.save();
  }
  
  return this;
};

module.exports = mongoose.model('Chat', chatSchema);
