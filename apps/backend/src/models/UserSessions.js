const mongoose = require('mongoose');

const userSessionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,   // removed unique:true
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
userSessionsSchema.methods.createSession = async function(sessionData) {
  // Validate required fields
  if (!sessionData.deviceId) {
    sessionData.deviceId = 'web-' + Date.now();
  }
  if (!sessionData.ipAddress) {
    sessionData.ipAddress = '0.0.0.0';
  }
  if (!sessionData.deviceInfo || !sessionData.deviceInfo.type) {
    sessionData.deviceInfo = { type: 'web' };
  }
  
  // End any existing sessions for the same device if not allowing multiple
  const existingSessionIndex = this.sessions.findIndex(session => 
    session.deviceId === sessionData.deviceId && session.isActive
  );
  
  if (existingSessionIndex !== -1) {
    this.sessions[existingSessionIndex].isActive = false;
    this.sessions[existingSessionIndex].logoutAt = new Date();
  }
  
  // Generate unique session ID with retry mechanism
  let sessionId = null;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!sessionId && attempts < maxAttempts) {
    attempts++;
    
    // Generate a new session ID
    const crypto = require('crypto');
    const candidateId = crypto.randomBytes(32).toString('hex');
    
    // Ensure it's not null or empty
    if (!candidateId) {
      continue;
    }
    
    // Check for global uniqueness across all user sessions
    const UserSessions = this.constructor;
    const existingSession = await UserSessions.findOne({
      'sessions.sessionId': candidateId
    });
    
    if (!existingSession) {
      sessionId = candidateId;
    }
  }
  
  // Final fallback with timestamp to ensure uniqueness
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}-${require('crypto').randomBytes(16).toString('hex')}`;
  }
  
  // Validate sessionId one more time
  if (!sessionId) {
    throw new Error('Failed to generate session ID');
  }
  
  const newSession = {
    sessionId: sessionId,
    deviceId: sessionData.deviceId,
    deviceInfo: sessionData.deviceInfo,
    ipAddress: sessionData.ipAddress,
    isActive: true,
    loginAt: new Date(),
    lastActivityAt: new Date(),
    rememberMe: sessionData.rememberMe || false
  };
  
  // Add location if provided
  if (sessionData.location) {
    newSession.location = sessionData.location;
  }
  
  this.sessions.push(newSession);
  
  try {
    await this.save();
    // Return the newly created session object
    return this.sessions[this.sessions.length - 1];
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000 && error.keyPattern && error.keyPattern['sessions.sessionId']) {
      this.sessions.pop(); // Remove the failed session
      
      // Try one more time with a completely different approach
      const fallbackSessionId = `fallback-${Date.now()}-${process.pid}-${Math.random().toString(36).substring(2)}-${require('crypto').randomBytes(16).toString('hex')}`;
      
      newSession.sessionId = fallbackSessionId;
      this.sessions.push(newSession);
      
      try {
        await this.save();
        // Return the newly created session object
        return this.sessions[this.sessions.length - 1];
      } catch (retryError) {
        // If still failing, provide a user-friendly error
        if (retryError.code === 11000) {
          throw new Error('Unable to create session. Please try logging in again.');
        }
        throw retryError;
      }
    }
    throw error;
  }
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

// Method to activate/validate session by sessionId
userSessionsSchema.methods.activateSession = function(sessionId) {
  console.log('activateSession Debug - Looking for sessionId:', sessionId);
  console.log('activateSession Debug - sessionId type:', typeof sessionId);
  console.log('activateSession Debug - sessionId length:', sessionId?.length);
  console.log('activateSession Debug - Total sessions:', this.sessions.length);
  
  // Log each session for comparison
  this.sessions.forEach((session, index) => {
    console.log(`activateSession Debug - Session ${index}:`, {
      sessionId: session.sessionId,
      sessionIdType: typeof session.sessionId,
      sessionIdLength: session.sessionId?.length,
      isActive: session.isActive,
      deviceId: session.deviceId,
      matches: session.sessionId === sessionId
    });
  });
  
  const session = this.sessions.find(s => {
    const matches = s.sessionId === sessionId;
    console.log(`activateSession Debug - Comparing "${s.sessionId}" === "${sessionId}": ${matches}`);
    return matches;
  });
  
  console.log('activateSession Debug - Found session:', session ? {
    sessionId: session.sessionId,
    isActive: session.isActive,
    deviceId: session.deviceId
  } : 'null');
  
  if (session && session.isActive) {
    // Update last activity
    session.lastActivityAt = new Date();
    console.log('activateSession Debug - Session activated successfully');
    return session;
  }
  
  console.log('activateSession Debug - Session activation failed - session exists:', !!session, 'isActive:', session?.isActive);
  return null;
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