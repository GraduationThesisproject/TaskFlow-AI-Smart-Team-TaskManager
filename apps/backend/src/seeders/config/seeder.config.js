/**
 * Seeder Configuration
 * Centralized configuration for database seeding
 */

const seederConfig = {
  // Environment-specific configurations
  environments: {
    development: {
      users: {
        count: 20,
        testUsers: [
          {
            name: 'Super Admin User',
            email: 'superadmin.test@gmail.com',
            password: '12345678A!',
            systemRole: 'super_admin',
            emailVerified: true
          },
          {
            name: 'Admin User',
            email: 'admin.test@gmail.com',
            password: '12345678A!',
            systemRole: 'admin',
            emailVerified: true
          },
          {
            name: 'Regular User',
            email: 'user.test@gmail.com',
            password: '12345678A!',
            systemRole: 'moderator',
            emailVerified: true
          },
          {
            name: 'Manager User',
            email: 'manager.test@gmail.com',
            password: '12345678A!',
            systemRole: 'moderator',
            emailVerified: true
          },
          {
            name: 'Developer User',
            email: 'developer.test@gmail.com',
            password: '12345678A!',
            systemRole: 'moderator',
            emailVerified: true
          }
        ]
      },
      workspaces: {
        count: 5,
        membersPerWorkspace: { min: 2, max: 8 }
      },
      spaces: {
        perWorkspace: { min: 2, max: 5 }
      },
      boards: {
        perSpace: { min: 1, max: 4 }
      },
      tags: {
        count: 20
      },
      tasks: {
        perBoard: { min: 5, max: 15 }
      },
      comments: {
        perTask: { min: 0, max: 8 }
      },
      notifications: {
        perUser: { min: 5, max: 20 }
      },
      files: {
        count: 50
      },
      activityLogs: {
        count: 200
      }
    },
    test: {
      users: {
        count: 10,
        testUsers: [
          {
            name: 'Test Admin',
            email: 'admin@test.com',
            password: '12345678A!',
            systemRole: 'admin',
            emailVerified: true
          },
          {
            name: 'Test User',
            email: 'user@test.com',
            password: '12345678A!',
            systemRole: 'moderator',
            emailVerified: true
          }
        ]
      },
      workspaces: {
        count: 2,
        membersPerWorkspace: { min: 1, max: 3 }
      },
      spaces: {
        perWorkspace: { min: 1, max: 2 }
      },
      boards: {
        perSpace: { min: 1, max: 2 }
      },
      tags: {
        count: 10
      },
      tasks: {
        perBoard: { min: 3, max: 8 }
      },
      comments: {
        perTask: { min: 0, max: 3 }
      },
      notifications: {
        perUser: { min: 2, max: 5 }
      },
      files: {
        count: 10
      },
      activityLogs: {
        count: 50
      }
    },
    production: {
      users: {
        count: 0, // No seeding in production
        testUsers: []
      },
      workspaces: {
        count: 0
      },
      spaces: {
        perWorkspace: { min: 0, max: 0 }
      },
      boards: {
        perSpace: { min: 0, max: 0 }
      },
      tasks: {
        perBoard: { min: 0, max: 0 }
      },
      comments: {
        perTask: { min: 0, max: 0 }
      },
      notifications: {
        perUser: { min: 0, max: 0 }
      },
      files: {
        count: 0
      },
      activityLogs: {
        count: 0
      }
    }
  },

  // Default column configurations
  defaultColumns: {
    kanban: [
      { name: 'To Do', color: '#6B7280', wipLimit: null },
      { name: 'In Progress', color: '#3B82F6', wipLimit: 5 },
      { name: 'Review', color: '#F59E0B', wipLimit: 3 },
      { name: 'Done', color: '#10B981', wipLimit: null }
    ],
    list: [
      { name: 'Backlog', color: '#6B7280', wipLimit: null },
      { name: 'In Progress', color: '#3B82F6', wipLimit: null },
      { name: 'Completed', color: '#10B981', wipLimit: null }
    ],
    calendar: [
      { name: 'Upcoming', color: '#6B7280', wipLimit: null },
      { name: 'This Week', color: '#3B82F6', wipLimit: null },
      { name: 'Overdue', color: '#EF4444', wipLimit: null }
    ]
  },

  // Default tags
  defaultTags: {
    global: [
      { name: 'Important', color: '#EF4444', category: 'priority' },
      { name: 'Urgent', color: '#F59E0B', category: 'priority' },
      { name: 'Bug', color: '#DC2626', category: 'type' },
      { name: 'Feature', color: '#10B981', category: 'type' },
      { name: 'Enhancement', color: '#3B82F6', category: 'type' },
      { name: 'Documentation', color: '#6366F1', category: 'type' }
    ]
  },

  // Faker configurations
  faker: {
    locale: 'en',
    seed: 12345, // Consistent seed for reproducible data
    options: {
      // Task generation options
      taskTitles: [
        'Implement user authentication',
        'Design responsive layout',
        'Add data validation',
        'Optimize database queries',
        'Create API documentation',
        'Fix navigation bug',
        'Add unit tests',
        'Update dependencies',
        'Refactor legacy code',
        'Implement caching',
        'Add error handling',
        'Create user onboarding',
        'Design dashboard widgets',
        'Add export functionality',
        'Implement search feature'
      ],
      taskDescriptions: [
        'Create a comprehensive authentication system with JWT tokens and role-based access control.',
        'Design and implement a fully responsive layout that works across all device sizes.',
        'Add comprehensive data validation for all user inputs with proper error messages.',
        'Optimize database queries to improve performance and reduce load times.',
        'Create detailed API documentation with examples and usage guidelines.',
        'Fix the navigation bug that occurs when switching between different sections.',
        'Add comprehensive unit tests to ensure code quality and reliability.',
        'Update all dependencies to their latest stable versions.',
        'Refactor the legacy code to follow modern best practices.',
        'Implement caching to improve application performance.',
        'Add proper error handling throughout the application.',
        'Create an intuitive user onboarding experience for new users.',
        'Design and implement dashboard widgets for better data visualization.',
        'Add export functionality for reports and data analysis.',
        'Implement a powerful search feature with filters and sorting.'
      ]
    }
  },

  // Validation rules
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    },
    password: {
      minLength: 8,
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters with letters, numbers, and special characters'
    },
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name must be 2-100 characters with only letters and spaces'
    }
  },

  // Progress tracking
  progress: {
    showProgress: true,
    progressBarWidth: 50,
    updateInterval: 100 // ms
  },

  // Rollback options
  rollback: {
    enabled: true,
    backupBeforeSeed: true,
    backupPath: './backups'
  }
};

module.exports = seederConfig;
