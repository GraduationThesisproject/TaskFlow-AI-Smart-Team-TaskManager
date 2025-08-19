const mongoose = require('mongoose');

const userSessionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  sessions: [{
    sessionId: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ['web', 'mobile', 'desktop'],
        required: true
      },
      os: String,
      browser: String,
      version: String,
      userAgent: String
    },
    ipAddress: {
      type: String,
      required: true
    },
    location: {
      country: String,
      city: String,
      timezone: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    loginAt: {
      type: Date,
      default: Date.now
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    logoutAt: {
      type: Date,
      default: null
    },
    tokenVersion: {
      type: Number,
      default: 1
    },
    rememberMe: {
      type: Boolean,
      default: false
    }
  }],
  security: {
    suspiciousActivities: [{
      type: {
        type: String,
        enum: ['unknown_device', 'unusual_location', 'multiple_logins', 'failed_attempts'],
        required: true
      },
      description: String,
      ipAddress: String,
      deviceInfo: Object,
      timestamp: {
        type: Date,
        default: Date.now
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }],
    trustedDevices: [{
      deviceId: String,
      name: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    loginHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      success: {
        type: Boolean,
        required: true
      },
      ipAddress: String,
      deviceInfo: Object,
      failureReason: String
    }]
  }
}, {
  timestamps: true
});

// Index for efficient queries
// userId index is created automatically by 'unique: true' in schema
// Only create index for non-empty sessions
userSessionsSchema.index(
  { 'sessions.sessionId': 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { 'sessions.sessionId': { $ne: null } }
  }
);
userSessionsSchema.index({ 'sessions.isActive': 1 });
userSessionsSchema.index({ 'sessions.lastActivityAt': -1 });

// Method to create new session
userSessionsSchema.methods.createSession = function(sessionData) {
  // End any existing sessions for the same device if not allowing multiple
  const existingSessionIndex = this.sessions.findIndex(session => 
    session.deviceId === sessionData.deviceId && session.isActive
  );
  
  if (existingSessionIndex !== -1) {
    this.sessions[existingSessionIndex].isActive = false;
    this.sessions[existingSessionIndex].logoutAt = new Date();
  }
  
  // Generate unique session ID
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  
  this.sessions.push({
    sessionId,
    ...sessionData,
    loginAt: new Date(),
    lastActivityAt: new Date()
  });
  
  return this.save();
};

// Method to end session
userSessionsSchema.methods.endSession = function(sessionId) {
  const session = this.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.isActive = false;
    session.logoutAt = new Date();
  }
  return this.save();
};

// Method to end all sessions
userSessionsSchema.methods.endAllSessions = function() {
  this.sessions.forEach(session => {
    if (session.isActive) {
      session.isActive = false;
      session.logoutAt = new Date();
    }
  });
  return this.save();
};

// Method to update session activity
userSessionsSchema.methods.updateActivity = function(sessionId) {
  const session = this.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.lastActivityAt = new Date();
  }
  return this.save();
};

// Method to get session by device ID
userSessionsSchema.methods.getSessionByDevice = function(deviceId) {
  return this.sessions.find(session => 
    session.deviceId === deviceId && session.isActive
  );
};

// Method to add suspicious activity
userSessionsSchema.methods.addSuspiciousActivity = function(activityData) {
  this.security.suspiciousActivities.push(activityData);
  return this.save();
};

// Method to add trusted device
userSessionsSchema.methods.addTrustedDevice = function(deviceId, name) {
  const existingDevice = this.security.trustedDevices.find(device => 
    device.deviceId === deviceId
  );
  
  if (!existingDevice) {
    this.security.trustedDevices.push({ deviceId, name });
  }
  
  return this.save();
};

// Method to log login attempt
userSessionsSchema.methods.logLoginAttempt = function(success, ipAddress, deviceInfo, failureReason = null) {
  this.security.loginHistory.push({
    success,
    ipAddress,
    deviceInfo,
    failureReason
  });
  
  // Keep only last 50 login attempts
  if (this.security.loginHistory.length > 50) {
    this.security.loginHistory = this.security.loginHistory.slice(-50);
  }
  
  return this.save();
};

module.exports = mongoose.model('UserSessions', userSessionsSchema);