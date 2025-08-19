const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const UserRoles = require('../models/UserRoles');
const UserSessions = require('../models/UserSessions');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Analytics = require('../models/Analytics');
const Checklist = require('../models/Checklist');
const File = require('../models/File');
const Invitation = require('../models/Invitation');
const Reminder = require('../models/Reminder');
const Tag = require('../models/Tag');

class DatabaseSeeder {
  constructor() {
    this.createdUsers = [];
    this.createdWorkspaces = [];
    this.createdSpaces = [];
    this.createdBoards = [];
    this.createdTasks = [];
    this.createdColumns = [];
    this.createdTags = [];
  }

  // Clear all collections
  async clearDatabase() {
    console.log('🗑️  Clearing database...');
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('✅ Database cleared successfully');
  }

  // Create test users with specific credentials
  async createTestUsers() {
    console.log('👥 Creating test users...');
    
    const testUsers = [
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
        systemRole: 'user',
        emailVerified: true
      },
      {
        name: 'Manager User',
        email: 'manager.test@gmail.com',
        password: '12345678A!',
        systemRole: 'user',
        emailVerified: true
      },
      {
        name: 'Developer User',
        email: 'developer.test@gmail.com',
        password: '12345678A!',
        systemRole: 'user',
        emailVerified: true
      }
    ];

    // Create additional random users
    for (let i = 0; i < 15; i++) {
      testUsers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: '12345678A!',
        systemRole: 'user',
        emailVerified: faker.datatype.boolean(),
        avatar: faker.image.avatar()
      });
    }

    const createdUsers = [];
    
    for (let userData of testUsers) {
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: userData.avatar || null,
        emailVerified: userData.emailVerified,
        isActive: true,
        lastLogin: faker.date.recent()
      });

      // Create UserPreferences
      const preferences = await UserPreferences.create({
        userId: user._id,
        theme: {
          mode: faker.helpers.arrayElement(['light', 'dark', 'auto']),
          primaryColor: faker.internet.color(),
          sidebarCollapsed: faker.datatype.boolean()
        },
        notifications: {
          email: {
            taskAssigned: faker.datatype.boolean(),
            taskCompleted: faker.datatype.boolean(),
            taskOverdue: true,
            commentAdded: faker.datatype.boolean(),
            mentionReceived: true,
            spaceUpdates: faker.datatype.boolean(),
            weeklyDigest: faker.datatype.boolean()
          },
          push: {
            taskAssigned: true,
            taskCompleted: faker.datatype.boolean(),
            taskOverdue: true,
            commentAdded: faker.datatype.boolean(),
            mentionReceived: true,
            spaceUpdates: faker.datatype.boolean()
          },
          inApp: {
            taskAssigned: true,
            taskCompleted: true,
            taskOverdue: true,
            commentAdded: true,
            mentionReceived: true,
            spaceUpdates: true
          }
        },
        ai: {
          enableSuggestions: faker.datatype.boolean(),
          enableRiskAnalysis: faker.datatype.boolean(),
          enableAutoDescription: faker.datatype.boolean(),
          suggestionFrequency: faker.helpers.arrayElement(['realtime', 'daily', 'weekly', 'never'])
        },
        dashboard: {
          defaultView: faker.helpers.arrayElement(['overview', 'tasks', 'calendar', 'analytics']),
          widgets: [
            {
              type: 'tasks_overview',
              position: 0,
              settings: new Map([['showCompleted', faker.datatype.boolean()]])
            },
            {
              type: 'recent_activity',
              position: 1,
              settings: new Map([['limit', faker.number.int({ min: 5, max: 20 })]])
            }
          ]
        }
      });

      // Create UserRoles
      const roles = await UserRoles.create({
        userId: user._id,
        systemRole: userData.systemRole
      });

      // Create UserSessions
      const sessions = await UserSessions.create({
        userId: user._id,
        sessions: [{
          sessionId: faker.string.uuid(),
          deviceId: faker.string.uuid(),
          deviceInfo: {
            type: faker.helpers.arrayElement(['web', 'mobile', 'desktop']),
            os: faker.helpers.arrayElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
            browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            version: faker.system.semver(),
            userAgent: faker.internet.userAgent()
          },
          ipAddress: faker.internet.ip(),
          location: {
            country: faker.location.country(),
            city: faker.location.city(),
            timezone: faker.location.timeZone()
          },
          isActive: true,
          loginAt: faker.date.recent(),
          lastActivityAt: faker.date.recent()
        }]
      });

      // Update user with references
      user.preferences = preferences._id;
      user.roles = roles._id;
      user.sessions = sessions._id;
      await user.save();

      createdUsers.push({ user, preferences, roles, sessions });
    }

    this.createdUsers = createdUsers;
    console.log(`✅ Created ${createdUsers.length} test users`);
    return createdUsers;
  }

  // Create workspaces
  async createWorkspaces() {
    console.log('🏢 Creating workspaces...');
    
    const workspaces = [];
    
    for (let i = 0; i < 5; i++) {
      const owner = faker.helpers.arrayElement(this.createdUsers);
      const otherUsers = faker.helpers.arrayElements(this.createdUsers, { min: 2, max: 8 })
        .filter(u => u.user._id.toString() !== owner.user._id.toString());

      const workspace = await Workspace.create({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        owner: owner.user._id,
        members: otherUsers.map(u => ({
          user: u.user._id,
          role: faker.helpers.arrayElement(['member', 'admin']),
          joinedAt: faker.date.past(),
          invitedBy: owner.user._id,
          permissions: {
            canCreateSpaces: faker.datatype.boolean(),
            canManageMembers: faker.datatype.boolean(),
            canEditSettings: faker.datatype.boolean(),
            canDeleteWorkspace: false
          }
        })),
        settings: {
          permissions: {
            defaultMemberRole: faker.helpers.arrayElement(['member', 'admin']),
            allowMemberInvites: faker.datatype.boolean(),
            requireApprovalForMembers: faker.datatype.boolean(),
            maxMembers: faker.number.int({ min: 10, max: 100 }),
            publicJoin: faker.datatype.boolean()
          },
          features: {
            aiSuggestions: faker.datatype.boolean(),
            timeTracking: faker.datatype.boolean(),
            fileAttachments: faker.datatype.boolean(),
            customFields: faker.datatype.boolean(),
            integrations: faker.datatype.boolean()
          },
          branding: {
            primaryColor: faker.internet.color()
          }
        },
        plan: faker.helpers.arrayElement(['free', 'basic', 'premium', 'enterprise']),
        billing: {
          status: faker.helpers.arrayElement(['active', 'past_due', 'cancelled', 'trial'])
        }
      });

      // Update user roles with workspace info
      for (let member of otherUsers) {
        await member.roles.addWorkspaceRole(workspace._id, member.role || 'member');
      }
      await owner.roles.addWorkspaceRole(workspace._id, 'owner');

      workspaces.push(workspace);
    }

    this.createdWorkspaces = workspaces;
    console.log(`✅ Created ${workspaces.length} workspaces`);
    return workspaces;
  }

  // Create spaces
  async createSpaces() {
    console.log('🏠 Creating spaces...');
    
    const spaces = [];
    
    for (let workspace of this.createdWorkspaces) {
      const spaceCount = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < spaceCount; i++) {
        const workspaceMembers = [
          { user: workspace.owner, role: 'admin' },
          ...workspace.members.map(m => ({ user: m.user, role: m.role === 'admin' ? 'admin' : 'member' }))
        ];

        const space = await Space.create({
          name: faker.commerce.department(),
          description: faker.lorem.paragraph(),
          workspace: workspace._id,
          members: workspaceMembers.map(m => ({
            user: m.user,
            role: m.role,
            joinedAt: faker.date.past(),
            permissions: {
              canViewBoards: true,
              canCreateBoards: m.role !== 'viewer',
              canEditBoards: m.role === 'admin',
              canDeleteBoards: m.role === 'admin',
              canCreateTasks: m.role !== 'viewer',
              canEditTasks: m.role !== 'viewer',
              canDeleteTasks: m.role === 'admin',
              canManageMembers: m.role === 'admin'
            }
          })),
          settings: {
            color: faker.internet.color(),
            icon: faker.helpers.arrayElement(['📋', '💼', '🚀', '💡', '🎯', '📊']),
            isPrivate: faker.datatype.boolean(),
            features: {
              timeTracking: faker.datatype.boolean(),
              aiSuggestions: faker.datatype.boolean(),
              customFields: faker.datatype.boolean(),
              fileAttachments: faker.datatype.boolean(),
              voting: faker.datatype.boolean(),
              dependencies: faker.datatype.boolean()
            }
          }
        });

        workspace.spaces.push(space._id);
        spaces.push(space);
      }
      
      await workspace.save();
    }

    this.createdSpaces = spaces;
    console.log(`✅ Created ${spaces.length} spaces`);
    return spaces;
  }

  // Create boards and columns
  async createBoardsAndColumns() {
    console.log('📋 Creating boards and columns...');
    
    const boards = [];
    const columns = [];
    
    for (let space of this.createdSpaces) {
      const boardCount = faker.number.int({ min: 1, max: 4 });
      
      for (let i = 0; i < boardCount; i++) {
        const board = await Board.create({
          name: faker.lorem.words(2),
          description: faker.lorem.paragraph(),
          space: space._id,
          owner: faker.helpers.arrayElement(space.members).user,
          members: space.members.map(m => ({
            user: m.user,
            permissions: m.permissions.canViewBoards ? ['view', 'edit'] : ['view'],
            addedAt: faker.date.past()
          })),
          columns: [
            {
              name: 'To Do',
              order: 0,
              color: '#6B7280',
              isDefault: true
            },
            {
              name: 'In Progress',
              order: 1,
              color: '#3B82F6',
              isDefault: true
            },
            {
              name: 'Review',
              order: 2,
              color: '#F59E0B',
              isDefault: true
            },
            {
              name: 'Done',
              order: 3,
              color: '#10B981',
              isDefault: true
            }
          ],
          settings: {
            allowComments: faker.datatype.boolean(),
            allowAttachments: faker.datatype.boolean(),
            allowTimeTracking: faker.datatype.boolean(),
            defaultTaskPriority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'])
          },
          tags: [
            { name: 'Bug', color: '#EF4444' },
            { name: 'Feature', color: '#10B981' },
            { name: 'Enhancement', color: '#3B82F6' },
            { name: 'Documentation', color: '#6366F1' }
          ]
        });

        // Create separate Column documents
        for (let columnData of board.columns) {
          const column = await Column.create({
            name: columnData.name,
            board: board._id,
            position: columnData.order,
            settings: {
              wipLimit: {
                enabled: faker.datatype.boolean(),
                limit: faker.number.int({ min: 3, max: 10 })
              },
              sorting: {
                method: faker.helpers.arrayElement(['manual', 'priority', 'due_date']),
                direction: faker.helpers.arrayElement(['asc', 'desc'])
              }
            },
            style: {
              color: columnData.color,
              backgroundColor: '#F9FAFB'
            }
          });
          columns.push(column);
        }

        space.boards.push(board._id);
        boards.push(board);
      }
      
      await space.save();
    }

    this.createdBoards = boards;
    this.createdColumns = columns;
    console.log(`✅ Created ${boards.length} boards and ${columns.length} columns`);
    return { boards, columns };
  }

  // Create tags
  async createTags() {
    console.log('🏷️ Creating tags...');
    
    const tags = [];
    
    // Global tags
    const globalTags = [
      { name: 'Important', color: '#EF4444', category: 'priority' },
      { name: 'Urgent', color: '#F59E0B', category: 'priority' },
      { name: 'Bug', color: '#DC2626', category: 'type' },
      { name: 'Feature', color: '#10B981', category: 'type' },
      { name: 'Enhancement', color: '#3B82F6', category: 'type' },
      { name: 'Documentation', color: '#6366F1', category: 'type' }
    ];

    for (let tagData of globalTags) {
      const tag = await Tag.create({
        name: tagData.name,
        color: tagData.color,
        textColor: '#FFFFFF',
        scope: 'global',
        createdBy: faker.helpers.arrayElement(this.createdUsers).user._id,
        category: tagData.category,
        settings: {
          permissions: {
            canUse: 'everyone',
            canEdit: 'admins',
            canDelete: 'admins'
          }
        }
      });
      tags.push(tag);
    }

    // Workspace-specific tags
    for (let workspace of this.createdWorkspaces) {
      const workspaceTags = [
        { name: `${workspace.name}-Priority`, color: '#F59E0B', category: 'custom' },
        { name: 'Team-Task', color: '#8B5CF6', category: 'type' },
        { name: 'Client-Request', color: '#EC4899', category: 'type' }
      ];

      for (let tagData of workspaceTags) {
        const tag = await Tag.create({
          name: tagData.name,
          color: tagData.color,
          textColor: '#FFFFFF',
          scope: 'workspace',
          workspace: workspace._id,
          createdBy: workspace.owner,
          category: tagData.category
        });
        tags.push(tag);
      }
    }

    // Space-specific tags
    for (let space of this.createdSpaces) {
      const spaceTags = [
        { name: `${space.name}-Task`, color: '#3B82F6', category: 'type' },
        { name: 'In-Progress', color: '#F59E0B', category: 'status' },
        { name: 'Completed', color: '#10B981', category: 'status' }
      ];

      for (let tagData of spaceTags) {
        const tag = await Tag.create({
          name: tagData.name,
          color: tagData.color,
          textColor: '#FFFFFF',
          scope: 'space',
          space: space._id,
          createdBy: space.members[0].user,
          category: tagData.category
        });
        tags.push(tag);
      }
    }

    this.createdTags = tags;
    console.log(`✅ Created ${tags.length} tags`);
    return tags;
  }

  // Create tasks
  async createTasks() {
    console.log('📝 Creating tasks...');
    
    const tasks = [];
    
    for (let board of this.createdBoards) {
      const taskCount = faker.number.int({ min: 5, max: 15 });
      
      for (let i = 0; i < taskCount; i++) {
        const assignee = faker.helpers.arrayElement(board.members);
        const reporter = faker.helpers.arrayElement(board.members);
        const column = faker.helpers.arrayElement(this.createdColumns.filter(c => c.board.toString() === board._id.toString()));
        const tags = faker.helpers.arrayElements(this.createdTags, { min: 0, max: 3 });

        const task = await Task.create({
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          board: board._id,
          space: board.space,
          column: column._id,
          status: faker.helpers.arrayElement(['todo', 'in_progress', 'review', 'done']),
          priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
          assignee: assignee.user,
          reporter: reporter.user,
          watchers: faker.helpers.arrayElements(board.members.map(m => m.user), { min: 0, max: 3 }),
          tags: tags.map(t => t.name),
          dueDate: faker.date.future(),
          estimatedHours: faker.number.int({ min: 1, max: 40 }),
          actualHours: faker.number.int({ min: 0, max: 30 }),
          timeEntries: [
            {
              user: assignee.user,
              startTime: faker.date.recent(),
              endTime: faker.date.recent(),
              duration: faker.number.int({ min: 30, max: 480 }),
              description: faker.lorem.sentence()
            }
          ],
          dependencies: [],
          aiGenerated: faker.datatype.boolean(),
          aiSuggestions: {
            estimatedDeadline: faker.date.future(),
            suggestedPriority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
            complexity: faker.helpers.arrayElement(['simple', 'medium', 'complex'])
          }
        });

        // Add task to column
        await column.addTask(task._id);

        // Assign tags to task
        for (let tag of tags) {
          await tag.assignToTask(task._id, reporter.user);
        }

        tasks.push(task);
      }
    }

    this.createdTasks = tasks;
    console.log(`✅ Created ${tasks.length} tasks`);
    return tasks;
  }

  // Create comments
  async createComments() {
    console.log('💬 Creating comments...');
    
    const comments = [];
    
    for (let task of this.createdTasks) {
      const commentCount = faker.number.int({ min: 0, max: 8 });
      
      for (let i = 0; i < commentCount; i++) {
        const author = faker.helpers.arrayElement(this.createdUsers).user;
        
        const comment = await Comment.create({
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          task: task._id,
          author: author._id,
          mentions: faker.helpers.arrayElements(this.createdUsers.map(u => ({
            user: u.user._id,
            mentionedAt: faker.date.recent()
          })), { min: 0, max: 2 }),
          reactions: faker.helpers.arrayElements([
            { user: faker.helpers.arrayElement(this.createdUsers).user._id, emoji: '👍' },
            { user: faker.helpers.arrayElement(this.createdUsers).user._id, emoji: '❤️' },
            { user: faker.helpers.arrayElement(this.createdUsers).user._id, emoji: '😄' }
          ], { min: 0, max: 3 }),
          isPinned: faker.datatype.boolean(0.1)
        });

        comments.push(comment);
      }
    }

    console.log(`✅ Created ${comments.length} comments`);
    return comments;
  }

  // Create checklists
  async createChecklists() {
    console.log('✅ Creating checklists...');
    
    const checklists = [];
    
    for (let task of faker.helpers.arrayElements(this.createdTasks, { min: Math.floor(this.createdTasks.length * 0.3), max: Math.floor(this.createdTasks.length * 0.6) })) {
      const checklist = await Checklist.create({
        taskId: task._id,
        title: faker.lorem.words(3),
        items: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, (_, index) => ({
          text: faker.lorem.sentence(),
          completed: faker.datatype.boolean(),
          completedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          completedBy: faker.datatype.boolean() ? faker.helpers.arrayElement(this.createdUsers).user._id : null,
          assignedTo: faker.datatype.boolean() ? faker.helpers.arrayElement(this.createdUsers).user._id : null,
          priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
          position: index,
          estimatedMinutes: faker.number.int({ min: 15, max: 240 }),
          actualMinutes: faker.number.int({ min: 0, max: 180 })
        })),
        position: 0,
        createdBy: faker.helpers.arrayElement(this.createdUsers).user._id,
        settings: {
          showProgress: faker.datatype.boolean(),
          allowItemAssignment: faker.datatype.boolean(),
          requireCompleteOrder: faker.datatype.boolean()
        }
      });

      checklists.push(checklist);
    }

    console.log(`✅ Created ${checklists.length} checklists`);
    return checklists;
  }

  // Create notifications
  async createNotifications() {
    console.log('🔔 Creating notifications...');
    
    const notifications = [];
    
    for (let user of this.createdUsers) {
      const notificationCount = faker.number.int({ min: 5, max: 20 });
      
      for (let i = 0; i < notificationCount; i++) {
        const relatedTask = faker.helpers.arrayElement(this.createdTasks);
        const sender = faker.helpers.arrayElement(this.createdUsers);
        
        const notification = await Notification.create({
          recipient: user.user._id,
          sender: sender.user._id,
          type: faker.helpers.arrayElement([
            'task_assigned',
            'task_updated',
            'task_completed',
            'comment_added',
            'comment_mentioned',
            'deadline_approaching'
          ]),
          title: faker.lorem.words(4),
          message: faker.lorem.sentence(),
          relatedEntity: {
            entityType: 'task',
            entityId: relatedTask._id
          },
          priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
          isRead: faker.datatype.boolean(),
          readAt: faker.datatype.boolean() ? faker.date.recent() : null,
          actionRequired: faker.datatype.boolean(),
          actionUrl: `/tasks/${relatedTask._id}`,
          actionText: 'View Task'
        });

        notifications.push(notification);
      }
    }

    console.log(`✅ Created ${notifications.length} notifications`);
    return notifications;
  }

  // Create reminders
  async createReminders() {
    console.log('⏰ Creating reminders...');
    
    const reminders = [];
    
    for (let task of faker.helpers.arrayElements(this.createdTasks, { min: Math.floor(this.createdTasks.length * 0.2), max: Math.floor(this.createdTasks.length * 0.5) })) {
      const user = faker.helpers.arrayElement(this.createdUsers);
      
      const reminder = await Reminder.create({
        entityType: 'task',
        entityId: task._id,
        userId: user.user._id,
        title: `Reminder: ${task.title}`,
        message: faker.lorem.sentence(),
        method: faker.helpers.arrayElements(['push', 'email', 'in_app'], { min: 1, max: 3 }),
        scheduledAt: faker.date.future(),
        priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
        repeat: {
          enabled: faker.datatype.boolean(0.3),
          frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
          interval: 1
        }
      });

      reminders.push(reminder);
    }

    console.log(`✅ Created ${reminders.length} reminders`);
    return reminders;
  }

  // Create activity logs
  async createActivityLogs() {
    console.log('📊 Creating activity logs...');
    
    const logs = [];
    
    for (let i = 0; i < 200; i++) {
      const user = faker.helpers.arrayElement(this.createdUsers);
      const task = faker.helpers.arrayElement(this.createdTasks);
      const workspace = faker.helpers.arrayElement(this.createdWorkspaces);
      
      const log = await ActivityLog.create({
        user: user.user._id,
        action: faker.helpers.arrayElement([
          'task_create', 'task_update', 'task_complete',
          'comment_create', 'board_create', 'space_create'
        ]),
        description: faker.lorem.sentence(),
        entity: {
          type: 'Task',
          id: task._id,
          name: task.title
        },
        workspace: workspace._id,
        space: task.space,
        board: task.board,
        severity: faker.helpers.arrayElement(['info', 'warning', 'error']),
        isSuccessful: faker.datatype.boolean(0.9)
      });

      logs.push(log);
    }

    console.log(`✅ Created ${logs.length} activity logs`);
    return logs;
  }

  // Create files
  async createFiles() {
    console.log('📁 Creating files...');
    
    const files = [];
    
    for (let i = 0; i < 50; i++) {
      const uploader = faker.helpers.arrayElement(this.createdUsers);
      const task = faker.helpers.arrayElement(this.createdTasks);
      
      const file = await File.create({
        filename: faker.system.fileName(),
        originalName: faker.system.fileName(),
        mimeType: faker.system.mimeType(),
        size: faker.number.int({ min: 1000, max: 10000000 }),
        path: `/uploads/${faker.string.uuid()}.${faker.system.fileExt()}`,
        extension: faker.system.fileExt(),
        checksum: faker.string.alphanumeric(64),
        category: faker.helpers.arrayElement(['task_attachment', 'comment_attachment', 'avatar', 'general']),
        uploadedBy: uploader.user._id,
        space: task.space,
        attachedTo: {
          model: 'Task',
          objectId: task._id,
          attachedAt: faker.date.recent()
        },
        dimensions: {
          width: faker.number.int({ min: 100, max: 2000 }),
          height: faker.number.int({ min: 100, max: 2000 })
        },
        isPublic: faker.datatype.boolean()
      });

      files.push(file);
    }

    console.log(`✅ Created ${files.length} files`);
    return files;
  }

  // Create invitations
  async createInvitations() {
    console.log('📧 Creating invitations...');
    
    const invitations = [];
    
    for (let workspace of this.createdWorkspaces) {
      const invitationCount = faker.number.int({ min: 1, max: 5 });
      
      for (let i = 0; i < invitationCount; i++) {
        const inviter = faker.helpers.arrayElement(this.createdUsers);
        
        const invitation = await Invitation.create({
          type: faker.helpers.arrayElement(['workspace', 'space', 'board']),
          invitedBy: inviter.user._id,
          invitedUser: {
            email: faker.internet.email(),
            name: faker.person.fullName()
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: faker.helpers.arrayElement(['viewer', 'member', 'contributor', 'admin']),
          status: faker.helpers.arrayElement(['pending', 'accepted', 'declined', 'expired']),
          message: faker.lorem.sentence(),
          expiresAt: faker.date.future()
        });

        invitations.push(invitation);
      }
    }

    console.log(`✅ Created ${invitations.length} invitations`);
    return invitations;
  }

  // Create analytics
  async createAnalytics() {
    console.log('📈 Creating analytics...');
    
    const analytics = [];
    
    for (let space of this.createdSpaces) {
      const analytic = await Analytics.create({
        scopeType: 'space',
        scopeId: space._id,
        kind: faker.helpers.arrayElement(['velocity', 'wip', 'leadTime', 'cycleTime', 'burndown']),
        data: {
          totalTasks: faker.number.int({ min: 10, max: 100 }),
          completedTasks: faker.number.int({ min: 5, max: 50 }),
          inProgressTasks: faker.number.int({ min: 2, max: 20 }),
          overdueTasks: faker.number.int({ min: 0, max: 10 }),
          completionRate: faker.number.int({ min: 40, max: 90 }),
          averageCompletionTime: faker.number.int({ min: 2, max: 48 }),
          velocity: faker.number.int({ min: 1, max: 10 })
        },
                 period: {
           startDate: faker.date.past(),
           endDate: faker.date.recent()
         }
      });

      analytics.push(analytic);
    }

    console.log(`✅ Created ${analytics.length} analytics records`);
    return analytics;
  }

  // Update space statistics
  async updateSpaceStatistics() {
    console.log('🔄 Updating space statistics...');
    
    for (let space of this.createdSpaces) {
      const spaceTasks = this.createdTasks.filter(task => 
        task.space.toString() === space._id.toString()
      );
      
      const completedTasks = spaceTasks.filter(task => task.status === 'done');
      const overdueTasks = spaceTasks.filter(task => 
        task.dueDate && task.dueDate < new Date() && task.status !== 'done'
      );
      
      space.stats.totalTasks = spaceTasks.length;
      space.stats.completedTasks = completedTasks.length;
      space.stats.overdueTasks = overdueTasks.length;
      space.stats.totalBoards = this.createdBoards.filter(board => 
        board.space.toString() === space._id.toString()
      ).length;
      space.stats.activeMembersCount = space.members.length;
      space.stats.lastActivityAt = faker.date.recent();
      
      await space.save();
    }
    
    console.log('✅ Updated space statistics');
  }

  // Main seeding method
  async seed() {
    try {
      console.log('🌱 Starting database seeding...');
      console.log('==========================================');
      
      await this.clearDatabase();
      await this.createTestUsers();
      await this.createWorkspaces();
      await this.createSpaces();
      await this.createBoardsAndColumns();
      await this.createTags();
      await this.createTasks();
      await this.createComments();
      await this.createChecklists();
      await this.createNotifications();
      await this.createReminders();
      await this.createActivityLogs();
      await this.createFiles();
      await this.createInvitations();
      await this.createAnalytics();
      await this.updateSpaceStatistics();
      
      console.log('==========================================');
      console.log('🎉 Database seeding completed successfully!');
      console.log('');
      console.log('📋 Test Users Created:');
      console.log('  • superadmin.test@gmail.com (password: 12345678A!)');
      console.log('  • admin.test@gmail.com (password: 12345678A!)');
      console.log('  • user.test@gmail.com (password: 12345678A!)');
      console.log('  • manager.test@gmail.com (password: 12345678A!)');
      console.log('  • developer.test@gmail.com (password: 12345678A!)');
      console.log('  • + 15 additional random users (password: 12345678A!)');
      console.log('');
      console.log('📊 Summary:');
      console.log(`  • Users: ${this.createdUsers.length}`);
      console.log(`  • Workspaces: ${this.createdWorkspaces.length}`);
      console.log(`  • Spaces: ${this.createdSpaces.length}`);
      console.log(`  • Boards: ${this.createdBoards.length}`);
      console.log(`  • Tasks: ${this.createdTasks.length}`);
      console.log(`  • Tags: ${this.createdTags.length}`);
      
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}

module.exports = DatabaseSeeder;
