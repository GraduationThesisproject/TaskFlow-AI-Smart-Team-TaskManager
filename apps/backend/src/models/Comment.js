const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Comment must belong to a task']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mentionedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true,
      maxlength: [10, 'Emoji cannot exceed 10 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date,
    default: null
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment depth (for nested comments)
commentSchema.virtual('depth').get(function() {
  let depth = 0;
  let currentComment = this;
  
  while (currentComment.parentComment) {
    depth++;
    currentComment = currentComment.parentComment;
  }
  
  return depth;
});

// Virtual for comment type
commentSchema.virtual('commentType').get(function() {
  if (this.parentComment) return 'reply';
  if (this.replies && this.replies.length > 0) return 'parent';
  return 'standalone';
});

// Indexes for better query performance
commentSchema.index({ task: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isPinned: 1 });
commentSchema.index({ 'mentions.user': 1 });

// Method to add reply
commentSchema.methods.addReply = function(replyId) {
  if (!this.replies.includes(replyId)) {
    this.replies.push(replyId);
  }
  return this.save();
};

// Method to remove reply
commentSchema.methods.removeReply = function(replyId) {
  this.replies = this.replies.filter(reply => 
    reply.toString() !== replyId.toString()
  );
  return this.save();
};

// Method to add mention
commentSchema.methods.addMention = function(userId) {
  const existingMention = this.mentions.find(mention => 
    mention.user.toString() === userId.toString()
  );
  
  if (!existingMention) {
    this.mentions.push({ user: userId });
  }
  
  return this.save();
};

// Method to remove mention
commentSchema.methods.removeMention = function(userId) {
  this.mentions = this.mentions.filter(mention => 
    mention.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add reaction
commentSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(reaction => 
    reaction.user.toString() === userId.toString() && reaction.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({ user: userId, emoji });
  }
  
  return this.save();
};

// Method to remove reaction
commentSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(reaction => 
    !(reaction.user.toString() === userId.toString() && reaction.emoji === emoji)
  );
  return this.save();
};

// Method to edit comment
commentSchema.methods.edit = function(newContent) {
  // Store edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Method to resolve comment
commentSchema.methods.resolve = function(userId) {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

// Method to unresolve comment
commentSchema.methods.unresolve = function() {
  this.isResolved = false;
  this.resolvedAt = null;
  this.resolvedBy = null;
  return this.save();
};

// Method to pin comment
commentSchema.methods.pin = function(userId) {
  this.isPinned = true;
  this.pinnedAt = new Date();
  this.pinnedBy = userId;
  return this.save();
};

// Method to unpin comment
commentSchema.methods.unpin = function() {
  this.isPinned = false;
  this.pinnedAt = null;
  this.pinnedBy = null;
  return this.save();
};

// Method to add attachment
commentSchema.methods.addAttachment = function(fileId) {
  if (!this.attachments.includes(fileId)) {
    this.attachments.push(fileId);
  }
  return this.save();
};

// Method to remove attachment
commentSchema.methods.removeAttachment = function(fileId) {
  this.attachments = this.attachments.filter(attachment => 
    attachment.toString() !== fileId.toString()
  );
  return this.save();
};

// Static method to find comments by task
commentSchema.statics.findByTask = function(taskId) {
  return this.find({ task: taskId })
    .populate('author', 'name avatar')
    .populate('mentions.user', 'name avatar')
    .populate('reactions.user', 'name avatar')
    .sort({ isPinned: -1, createdAt: 1 });
};

// Static method to find parent comments
commentSchema.statics.findParentComments = function(taskId) {
  return this.find({ 
    task: taskId, 
    parentComment: null 
  })
    .populate('author', 'name avatar')
    .populate('replies')
    .sort({ isPinned: -1, createdAt: 1 });
};

// Static method to find mentions for a user
commentSchema.statics.findMentions = function(userId) {
  return this.find({ 'mentions.user': userId })
    .populate('task', 'title')
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 });
};

// Static method to find pinned comments
commentSchema.statics.findPinned = function(taskId) {
  return this.find({ 
    task: taskId, 
    isPinned: true 
  })
    .populate('author', 'name avatar')
    .sort({ pinnedAt: 1 });
};

module.exports = mongoose.model('Comment', commentSchema);
