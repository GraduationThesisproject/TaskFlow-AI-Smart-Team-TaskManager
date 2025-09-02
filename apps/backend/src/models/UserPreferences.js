const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    email: {
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: false },
      taskOverdue: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      mentionReceived: { type: Boolean, default: true },
                  spaceUpdates: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true }
    },
    push: {
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: false },
      taskOverdue: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: false },
      mentionReceived: { type: Boolean, default: true },
                  spaceUpdates: { type: Boolean, default: false }
    },
    realTime: {
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      taskOverdue: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      mentionReceived: { type: Boolean, default: true },
      spaceUpdates: { type: Boolean, default: true },
      workspaceCreated: { type: Boolean, default: true },
      workspaceArchived: { type: Boolean, default: true },
      workspaceRestored: { type: Boolean, default: true },
      workspaceDeleted: { type: Boolean, default: true },
      templateCreated: { type: Boolean, default: true }
    },
    inApp: {
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      taskOverdue: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      mentionReceived: { type: Boolean, default: true },
                  spaceUpdates: { type: Boolean, default: true }
    }
  },
  ai: {
    enableSuggestions: { type: Boolean, default: true },
    enableRiskAnalysis: { type: Boolean, default: true },
    enableAutoDescription: { type: Boolean, default: false },
    suggestionFrequency: {
      type: String,
      enum: ['realtime', 'daily', 'weekly', 'never'],
      default: 'realtime'
    }
  },
  dashboard: {
    defaultView: {
      type: String,
      enum: ['overview', 'tasks', 'calendar', 'analytics'],
      default: 'overview'
    },
    widgets: [{
      type: {
        type: String,
        enum: ['tasks_overview', 'recent_activity', 'upcoming_deadlines', 'team_performance', 'ai_insights'],
        required: true
      },
      position: {
        type: Number,
        required: true
      },
      settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }]
  },
  connectedApps: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['calendar', 'email', 'storage', 'communication', 'development'],
      required: true
    },
    credentials: {
      type: Map,
      of: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    lastSyncAt: {
      type: Date,
      default: null
    }
  }],
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'team_only', 'private'],
      default: 'team_only'
    },
    showOnlineStatus: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    shareActivityData: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Method to update specific preference section
userPreferencesSchema.methods.updateSection = function(section, updates) {
  if (this[section]) {
    Object.assign(this[section], updates);
  }
  return this.save();
};

// Method to update nested preference section
userPreferencesSchema.methods.updateNestedSection = function(section, subsection, updates) {
  if (this[section] && this[section][subsection]) {
    Object.assign(this[section][subsection], updates);
  }
  return this.save();
};

// Method to toggle notification category
userPreferencesSchema.methods.toggleNotificationCategory = function(category, enabled) {
  ['email', 'push', 'inApp', 'realTime'].forEach(method => {
    if (this.notifications[method][category] !== undefined) {
      this.notifications[method][category] = enabled;
    }
  });
  return this.save();
};

// Method to connect app
userPreferencesSchema.methods.connectApp = function(appData) {
  const existingApp = this.connectedApps.find(app => 
    app.name === appData.name && app.type === appData.type
  );
  
  if (existingApp) {
    Object.assign(existingApp, appData, { lastSyncAt: new Date() });
  } else {
    this.connectedApps.push(appData);
  }
  
  return this.save();
};

// Method to disconnect app
userPreferencesSchema.methods.disconnectApp = function(appName, appType) {
  this.connectedApps = this.connectedApps.filter(app => 
    !(app.name === appName && app.type === appType)
  );
  return this.save();
};

// Method to check if should receive notification
userPreferencesSchema.methods.shouldReceiveNotification = function(type, category, method = 'push') {
  const methodPrefs = this.notifications[method];
  return methodPrefs && methodPrefs[category];
};

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);