# 🚀 TaskFlow Backend API

Express.js API server for TaskFlow - AI-Powered Smart Team Task Manager

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Models & Database](#models--database)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [Permissions System](#permissions-system)
- [Middlewares](#middlewares)
- [File Upload System](#file-upload-system)
- [AI Integration](#ai-integration)
- [Real-time Features](#real-time-features)
- [Database Seeding](#database-seeding)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
- [Deployment](#deployment)

## 🚀 Features

### Core Features
- **Advanced Authentication** - JWT-based auth with session management, account lockout, and OAuth support
- **Multi-tenant Workspaces** - Enterprise-grade workspace management with billing and usage limits
- **Space Organization** - Workspace spaces with granular permissions and member management
- **Space Management** - Enhanced spaces with goals, progress tracking, and AI suggestions
- **Task Management** - Full lifecycle management with multiple assignees, watchers, comments, and checklists
- **Board Management** - Advanced Kanban boards with WIP limits and automation
- **Real-time Collaboration** - WebSocket integration with typing indicators and presence

### Advanced Features
- **AI Integration** - OpenAI-powered task suggestions, risk analysis, and natural language processing
- **Analytics & Insights** - Detailed space metrics, team performance, and AI-driven recommendations
- **File Upload System** - Cloudinary integration for avatars, attachments, and media with automatic optimization
- **Permission System** - Granular role-based permissions at workspace, space, and board levels
- **Activity Logging** - Comprehensive audit trail for all user actions
- **Email System** - Automated notifications with template support and bulk sending
- **Session Management** - Multi-device session tracking with security monitoring
- **Invitation System** - Secure invitation workflow for workspace and space access

## 🏗 Architecture

### Project Structure
```
src/
├── app.js                # Express app setup and route configuration
├── server.js             # Server entry point with Socket.IO setup
├── config/               # Configuration files
│   ├── db.js            # MongoDB connection
│   ├── env.js           # Environment variables
│   ├── logger.js        # Winston logging configuration
│   └── cloudinary.js    # Cloudinary file upload configuration
├── models/               # Mongoose data models (19 total)
│   ├── User.js          # User authentication and profile
│   ├── UserPreferences.js # User settings and preferences
│   ├── UserRoles.js     # Role-based permission system
│   ├── UserSessions.js  # Multi-device session management
│   ├── Workspace.js     # Multi-tenant workspace management
│   ├── Space.js         # Organization spaces within workspaces
│   ├── Space.js         # Space management with teams
│   ├── Board.js         # Kanban boards with settings
│   ├── Column.js        # Board columns with WIP limits
│   ├── Task.js          # Tasks with assignments and tracking
│   ├── Comment.js       # Task comments with mentions
│   ├── Checklist.js     # Task checklists with progress
│   ├── File.js          # File attachments with Cloudinary
│   ├── Notification.js  # Multi-channel notifications
│   ├── Reminder.js      # Due date and custom reminders
│   ├── Analytics.js     # Space metrics and AI insights
│   ├── Tag.js           # Space tags with analytics
│   ├── Invitation.js    # Secure invitation system
│   └── ActivityLog.js   # Comprehensive audit trail
├── controllers/          # Request handlers (14 total)
├── services/            # Business logic layer (11 total)
├── routes/              # API route definitions (14 total)
├── middlewares/         # Custom middleware (5 total)
├── utils/               # Utility functions
├── sockets/             # Socket.IO handlers (4 total)
├── ai/                  # AI integration and pipelines
├── scripts/             # Database seeding scripts
└── tests/               # Unit and integration tests
```

## 📊 Models & Database

### Entity Relationship Overview
```
Workspace (Multi-tenant)
├── Members (Users with roles)
├── Spaces (Organizational units)
│   ├── Members (Users with space permissions)
│   └── Boards (Kanban boards)
│       ├── Columns (Task stages with WIP limits)
│       └── Tasks (Work items)
│           ├── Assignees (Multiple users)
│           ├── Comments (With mentions and reactions)
│           ├── Checklists (Progress tracking)
│           ├── Files (Cloudinary attachments)
│           └── Time Entries (Time tracking)
├── Spaces (With goals and teams)
│   ├── Analytics (Performance metrics)
│   └── AI Suggestions (Task recommendations)
└── Invitations (Secure member invites)

Users
├── Preferences (Theme, notifications, AI settings)
├── Sessions (Multi-device tracking)
├── Roles (Workspace/space permissions)
└── Activity Logs (Audit trail)

System
├── Notifications (Multi-channel delivery)
├── Reminders (Due dates and custom alerts)
└── Tags (Content organization)
```

### Key Models

#### **User Management Models**
- **User**: Core user profile with authentication
- **UserPreferences**: Theme, notifications, AI settings, dashboard widgets
- **UserSessions**: Multi-device session tracking with security monitoring
- **UserRoles**: Granular permissions at workspace/space/board levels

#### **Workspace Models**
- **Workspace**: Multi-tenant workspace with billing and usage limits
- **Space**: Organizational units within workspaces with member permissions
- **Space**: Spaces with goals, teams, progress tracking, and AI suggestions
- **Board**: Kanban boards with columns, settings, and automation
- **Column**: Board columns with WIP limits and task positioning

#### **Task Management Models**
- **Task**: Work items with multiple assignees, watchers, time tracking
- **Comment**: Task comments with mentions, reactions, and threading
- **Checklist**: Task checklists with assignable items and progress tracking
- **File**: Multi-entity file attachments with Cloudinary integration

#### **System Models**
- **Notification**: Multi-channel notifications with delivery tracking
- **Reminder**: Due date and custom reminders with recurrence
- **Analytics**: Space metrics with AI insights and trend analysis
- **Tag**: Content tags with usage analytics and relationships
- **Invitation**: Secure invitation workflow with expiration
- **ActivityLog**: Comprehensive audit trail for all actions

## 🔌 API Endpoints

### **Authentication & User Management (12 endpoints)**
- `POST /api/auth/register` - Register new user (with invitation support)
- `POST /api/auth/login` - Login user (with session management)
- `GET /api/auth/me` - Get current user profile with preferences and roles
- `PUT /api/auth/profile` - Update user profile and avatar
- `PUT /api/auth/preferences` - Update user preferences
- `PUT /api/auth/change-password` - Change password (ends all sessions)
- `POST /api/auth/logout` - Logout (device-specific or all devices)
- `GET /api/auth/sessions` - Get active sessions
- `DELETE /api/auth/sessions/:sessionId` - End specific session
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset
- `GET /api/auth/activity` - Get user activity log

### **Workspace Management (10 endpoints)**
- `GET /api/workspaces` - Get all workspaces for user
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `POST /api/workspaces/:id/invite` - Invite member to workspace
- `GET /api/workspaces/:id/members` - Get workspace members
- `DELETE /api/workspaces/:id/members/:memberId` - Remove member
- `PUT /api/workspaces/:id/settings` - Update workspace settings
- `GET /api/workspaces/:id/analytics` - Get workspace analytics
- `POST /api/workspaces/:id/transfer-ownership` - Transfer ownership

### **Space Management (6 endpoints)**
- `GET /api/spaces/workspace/:workspaceId` - Get spaces in workspace
- `POST /api/spaces` - Create new space
- `GET /api/spaces/:id` - Get space details
- `PUT /api/spaces/:id` - Update space
- `POST /api/spaces/:id/members` - Add member to space
- `POST /api/spaces/:id/archive` - Archive space

### **Space Management (12 endpoints)**
- `GET /api/spaces` - Get all spaces for user
- `POST /api/spaces` - Create space (with goal and AI features)
- `GET /api/spaces/:id` - Get single space with statistics
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space
- `POST /api/spaces/:id/members` - Add member to space
- `DELETE /api/spaces/:id/members/:memberId` - Remove member
- `PUT /api/spaces/:id/members/:memberId/role` - Update member role
- `GET /api/spaces/:id/members` - Get space members with statistics
- `GET /api/spaces/:id/insights` - Get space insights and analytics
- `POST /api/spaces/:id/archive` - Archive space
- `POST /api/spaces/:id/clone` - Clone space

### **Board & Column Management (8 endpoints)**
- `GET /api/boards/space/:spaceId` - Get space boards
- `POST /api/boards` - Create board with default columns
- `GET /api/boards/:id` - Get board with columns and tasks
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/columns` - Add column to board
- `PUT /api/boards/:id/columns/:columnId` - Update column
- `DELETE /api/boards/:id/columns/:columnId` - Delete column

### **Task Management (15 endpoints)**
- `GET /api/tasks` - Get tasks with advanced filtering
- `GET /api/tasks/recommendations` - Get AI-powered task recommendations
- `GET /api/tasks/overdue` - Get overdue tasks for user
- `POST /api/tasks` - Create task with attachments, assignees and watchers
- `GET /api/tasks/:id` - Get single task with comments and activity
- `PUT /api/tasks/:id` - Update task with notifications
- `PATCH /api/tasks/:id/move` - Move task between columns
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/bulk-update` - Bulk update multiple tasks
- `POST /api/tasks/:id/comments` - Add comment with attachments
- `PUT /api/tasks/comments/:commentId` - Update comment
- `DELETE /api/tasks/comments/:commentId` - Delete comment
- `POST /api/tasks/comments/:commentId/reactions` - Add reaction to comment
- `POST /api/tasks/:id/watchers` - Add watcher to task
- `DELETE /api/tasks/:id/watchers` - Remove watcher from task

### **File Management (9 endpoints)**
- `POST /api/files/avatar` - Upload user avatar
- `POST /api/files/tasks/:taskId/attachments` - Upload task attachments (max 5 files)
- `POST /api/files/comments/:commentId/attachments` - Upload comment attachments (max 3 files)
- `POST /api/files/logo/:entityType/:entityId` - Upload workspace/space logo
- `GET /api/files/:id` - Get file details and download
- `DELETE /api/files/:id` - Delete file from Cloudinary and database
- `GET /api/files/entity/:entityType/:entityId` - Get all files for an entity
- `GET /api/files/user/my-files` - Get user's uploaded files
- `GET /api/files/storage/stats` - Get storage usage statistics

### **Notification Management (8 endpoints)**
- `GET /api/notifications` - Get user notifications with filtering
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/preferences` - Update notification preferences
- `GET /api/notifications/stats` - Get notification statistics
- `POST /api/notifications` - Create manual notification (admin feature)
- `PUT /api/notifications/bulk-mark-read` - Bulk mark notifications as read

### **AI Features (6 endpoints)**
- `POST /api/ai/suggestions` - Generate task suggestions from space goals
- `GET /api/ai/risks/space/:spaceId` - Analyze space risks with AI
- `GET /api/ai/risks/board/:boardId` - Analyze board-specific risks
- `POST /api/ai/parse` - Parse natural language to structured task
- `POST /api/ai/timeline/:spaceId` - Generate optimized space timeline
- `GET /api/ai/recommendations/:spaceId` - Get smart task recommendations

### **Analytics (6 endpoints)**
- `GET /api/analytics/space/:spaceId` - Get space analytics
- `POST /api/analytics/space/:spaceId/generate` - Generate new analytics
- `GET /api/analytics/user` - Get user analytics
- `GET /api/analytics/workspace/:workspaceId` - Get workspace analytics
- `GET /api/analytics/team/:spaceId` - Get team performance analytics
- `GET /api/analytics/export/:spaceId` - Export analytics data

### **Additional Features**
- **Checklists (9 endpoints)** - Task checklist management
- **Reminders (6 endpoints)** - Due date and custom reminder system
- **Tags (6 endpoints)** - Space tag management with analytics
- **Invitations (10 endpoints)** - Secure invitation workflow

## 🔐 Authentication & Security

### Authentication Flow
1. **Registration**: Create account with email verification
2. **Login**: JWT token with session creation and device tracking
3. **Session Management**: Multi-device sessions with security monitoring
4. **Password Security**: bcrypt hashing, strength validation, lockout protection

### Security Features
- **JWT Tokens**: Secure authentication with configurable expiration
- **Account Lockout**: Brute force protection (5 attempts, 2-hour lockout)
- **Session Tracking**: Monitor all active sessions across devices
- **Password Validation**: Strong password requirements with special characters
- **Rate Limiting**: Protection against abuse on sensitive endpoints
- **Input Validation**: Comprehensive request validation middleware
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers for all responses

### Password Requirements
- Minimum 8 characters
- At least one letter, one number, one special character
- Not commonly used passwords (can be enhanced with blacklist)

## 🛡️ Permissions System

### Role Hierarchy

#### **System Roles**
- `super_admin` - Full system access
- `admin` - Administrative privileges
- `user` - Standard user access

#### **Workspace Roles**
- `owner` - Full workspace control including billing and deletion
- `admin` - Member management, settings, space creation
- `member` - Basic workspace access and space creation

#### **Space Roles**
- `owner` - Full space control including deletion
- `admin` - Space management and member administration
- `member` - Space participation and board creation
- `contributor` - Task creation and editing
- `viewer` - Read-only space access

#### **Space Roles**
- `admin` - Full space management including settings and members
- `member` - Board creation and task management
- `viewer` - Read-only space access

#### **Board Roles**
- `admin` - Full board management including deletion
- `member` - Task creation and editing
- `viewer` - Read-only board access

### Permission Matrix

| Permission | Workspace Admin | Space Admin | Board Admin |
|------------|----------------|---------------|-------------|-------------|
| Manage Members | ✅ | ✅ | ✅ | ✅ |
| Create Boards | ✅ | ✅ | ✅ | ✅ |
| Delete Boards | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ | ✅ |
| Edit Tasks | ✅ | ✅ | ✅ | ✅ |
| Delete Tasks | ✅ | ✅ | ✅ | ✅ |
| Manage Settings | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ |

## 🔧 Middlewares

### **Authentication Middleware**
- `authMiddleware` - JWT token validation with session checking
- `optionalAuth` - Optional authentication for public endpoints
- `requireRole(roles)` - Require specific system roles
- `requireAdmin` - Require admin system role

### **Permission Middleware**
- `requireSystemAdmin` - System administrator access
- `requireWorkspacePermission(role)` - Workspace role requirements
- `requireSpacePermission(role)` - Space role requirements
- `requireSpacePermission(permission)` - Space-specific permissions
- `requireBoardPermission(permission)` - Board-specific permissions
- `requireResourceOwner(field)` - Resource ownership validation
- `requireTaskAccess` - Task access validation
- `rateLimitSensitiveOps` - Rate limiting for sensitive operations

### **Validation Middleware**
- `validateMiddleware(schema)` - Request body validation
- `validateQuery(schema)` - Query parameter validation
- `validateParams(schema)` - URL parameter validation

### **Upload Middleware**
- `avatarUpload` - User avatar upload (2MB limit, JPG/PNG/WebP)
- `taskAttachmentUpload` - Task file attachments (10MB limit, 5 files max)
- `commentAttachmentUpload` - Comment attachments (5MB limit, 3 files max)
- `logoUpload` - Workspace/space logos (1MB limit)
- `boardBackgroundUpload` - Board backgrounds (3MB limit)

### **Error Middleware**
- Comprehensive error handling for all error types
- Development vs production error responses
- Mongoose validation error formatting
- JWT error handling
- File upload error handling

## 📁 File Upload System

### Cloudinary Integration
**Pre-configured** with optimization and CDN delivery:

```bash
CLOUDINARY_CLOUD_NAME=dodvvsdzt
CLOUDINARY_API_KEY=275559436125618
CLOUDINARY_API_SECRET=DTPID8ww2iUvjgGU83618lRP9QY
```

### File Organization
```
taskflow/
├── avatars/          # User profile pictures (200x200, face detection)
├── tasks/            # Task attachments (up to 10MB, 5 files)
├── comments/         # Comment attachments (up to 5MB, 3 files)
├── logos/            # Workspace & space logos (400x400 optimized)
└── boards/           # Board background images (1920x1080 optimized)
```

### Upload Limits & Types
| Upload Type | Max Size | Allowed Formats | Max Files |
|-------------|----------|-----------------|-----------|
| **Avatar** | 2MB | JPG, PNG, WebP | 1 |
| **Task Attachments** | 10MB | Images, PDF, Docs, ZIP | 5 |
| **Comment Attachments** | 5MB | Images, PDF, Docs, Text | 3 |
| **Logos** | 1MB | JPG, PNG, SVG, WebP | 1 |
| **Board Backgrounds** | 3MB | JPG, PNG, WebP | 1 |

### Security Features
- MIME type validation
- File size enforcement
- Malware detection capability
- Permission-based access control
- Automatic image optimization

## 🤖 AI Integration

### OpenAI Features
- **Task Generation**: AI-powered task suggestions from space goals
- **Risk Analysis**: Predictive warnings for space delays and bottlenecks
- **Natural Language Processing**: Convert text to structured tasks
- **Timeline Optimization**: AI-generated space timelines
- **Performance Analysis**: Team productivity insights
- **Content Moderation**: Automatic content filtering

### AI Pipeline System
```javascript
// Complex multi-step AI operations
const pipeline = new AIPipeline()
  .addStep('requirements', processors.analyzeRequirements)
  .addStep('wbs', processors.generateWBS)
  .addStep('timeline', processors.estimateTimeline)
  .addStep('risks', processors.riskAnalysis);

const results = await pipeline.execute(context);
```

### AI Endpoints Usage
```javascript
// Generate task suggestions
POST /api/ai/suggestions
{
  "spaceGoal": "Build a mobile app for task management",
  "spaceContext": "React Native, team of 3 developers",
  "boardType": "kanban"
}

// Analyze space risks
GET /api/ai/risks/space/:spaceId

// Parse natural language
POST /api/ai/parse
{
  "input": "Remind me to finish the user authentication by Friday",
  "boardId": "board123"
}
```

## ⚡ Real-time Features

### Socket.IO Integration
**4 Socket Handlers**: Task, Board, Workspace, Notification

### Real-time Events
```javascript
// Connection Events
socket.emit('join:space', { spaceId })
socket.emit('join:board', { boardId })
socket.emit('join:workspace', { workspaceId })

// Task Events
socket.emit('task:update', taskData)
socket.emit('task:move', { taskId, columnId, position })
socket.emit('comment:add', { taskId, content, mentions })

// Collaboration Events
socket.emit('typing:start', { boardId, taskId })
socket.emit('typing:stop', { boardId, taskId })
socket.emit('presence:update', { boardId, status })

// Notification Events
socket.emit('notifications:getUnreadCount')
socket.on('notification:new', callback)
```

### Features
- **Live Collaboration**: Real-time task updates and comments
- **Typing Indicators**: See who's typing in real-time
- **User Presence**: Track online/offline status
- **Instant Notifications**: Real-time notification delivery
- **Board Synchronization**: Live board state updates
- **Permission-Based Broadcasting**: Secure event distribution

## 🌱 Database Seeding

### Quick Setup
```bash
# Install dependencies
npm install

# Full database seed (creates comprehensive test data)
npm run seed

# Partial seeding for development
npm run seed:partial users
npm run seed:partial workspaces
npm run seed:partial spaces

# Clear database
npm run seed:clear

# View test user credentials
npm run seed:users
```

### Test Users (Password: `12345678A!`)
| Email | Role | Purpose |
|-------|------|---------|
| `superadmin.test@gmail.com` | Super Admin | Full system access |
| `admin.test@gmail.com` | Admin | Administrative features |
| `user.test@gmail.com` | User | Standard user testing |
| `manager.test@gmail.com` | User | Project management scenarios |
| `developer.test@gmail.com` | User | Developer workflow testing |

### Generated Data
- **20 Users** (5 test users + 15 random users)
- **5 Workspaces** with members and settings
- **10-25 Spaces** across workspaces
- **10-25 Spaces** with teams and progress
- **15-50 Boards** with columns and settings
- **75-750 Tasks** with assignments and time tracking
- **100-600 Comments** with mentions and reactions
- **100-400 Notifications** for users
- **Global and scoped Tags** for organization
- **Checklists, Files, Reminders, Analytics** and more!

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Environment Variables
Create `.env` file in the backend directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=mongodb://localhost:27017/taskflow

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Features (Optional)
OPENAI_API_KEY=your-openai-api-key

# Cloudinary File Upload (Pre-configured)
CLOUDINARY_CLOUD_NAME=dodvvsdzt
CLOUDINARY_API_KEY=275559436125618
CLOUDINARY_API_SECRET=DTPID8ww2iUvjgGU83618lRP9QY
```

### Installation Steps
```bash
# 1. Navigate to backend directory
cd apps/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start MongoDB (make sure it's running)
# MongoDB should be accessible at mongodb://localhost:27017

# 5. Seed the database with test data
npm run seed

# 6. Start development server
npm run dev

# 7. Verify installation
curl http://localhost:3001/health
```

### Development Commands
```bash
# Development server with hot reload
npm run dev

# Production server
npm start

# Run tests
npm test
npm run test:coverage

# Database operations
npm run seed           # Full database seed
npm run seed:clear     # Clear database
npm run seed:users     # Show test user credentials

# Linting
npm run lint
```

## 🧪 Testing

### Test Configuration
- **Framework**: Jest with Supertest
- **Database**: Separate test database
- **Coverage**: Auth, Board, and Task endpoints
- **Setup**: Automatic test data creation and cleanup

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run tests with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Users
All tests use isolated test data with automatic cleanup.

## 🚀 Production Deployment

### Build & Start
```bash
# Production build (no build step needed for Express)
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL=mongodb://your-production-db-connection-string
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment
```bash
# Build Docker image
docker build -t taskflow-api .

# Run container
docker run -p 3001:3001 -e DATABASE_URL=your-db-url taskflow-api
```

### Health Monitoring
- **Health Check**: `GET /health`
- **Logging**: Winston logger with file rotation (`logs/` directory)
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance**: API response time tracking

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Activity Logs**: Complete audit trail for all user actions
- **Performance Metrics**: Response times and error rates
- **Usage Analytics**: Workspace and space utilization
- **Storage Tracking**: File upload and storage usage
- **Session Monitoring**: Active sessions and security events

### Health Indicators
- **Database Connection**: MongoDB connectivity status
- **External Services**: Cloudinary and OpenAI availability
- **System Resources**: Memory and CPU usage tracking
- **Error Rates**: API endpoint error percentages

## 🔌 Socket.IO Events

### Connection Management
```javascript
// Join space room for updates
socket.emit('join:space', { spaceId })

// Join board room for real-time collaboration
socket.emit('join:board', { boardId })
```

### Task Collaboration
```javascript
// Real-time task updates
socket.on('task:update', (data) => { /* handle update */ })

// Task movement between columns
socket.on('task:move', (data) => { /* handle move */ })

// New comments added
socket.on('comment:add', (data) => { /* handle comment */ })
```

### User Presence
```javascript
// Typing indicators
socket.emit('typing:start', { boardId, taskId })
socket.emit('typing:stop', { boardId, taskId })

// User status updates
socket.emit('presence:update', { boardId, status })
```

## 🐛 Troubleshooting

### Common Issues

#### **MongoDB Connection Issues**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Verify connection string
echo $DATABASE_URL
```

#### **Missing Dependencies**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Port Already in Use**
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
PORT=3002 npm run dev
```

#### **Cloudinary Upload Issues**
- Verify Cloudinary credentials in `.env`
- Check file size limits and formats
- Monitor Cloudinary dashboard for errors

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check log files
tail -f logs/combined.log
tail -f logs/error.log
```

## 📄 API Response Format

### Standard Response Structure
```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

### Error Response Structure
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🔍 Performance Optimization

### Database Optimization
- **Strategic Indexing**: Compound indexes for common query patterns
- **Lean Queries**: Use `.lean()` for read-only operations
- **Selective Population**: Only populate needed fields
- **Pagination**: Implemented for all list endpoints

### Recommended Enhancements
- **Redis Caching**: Add caching layer for frequently accessed data
- **Database Connection Pooling**: Optimize MongoDB connections
- **Background Jobs**: Move heavy processing to job queues
- **Response Compression**: Add gzip compression middleware

## 📝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Install** dependencies (`npm install`)
4. **Set up** environment variables
5. **Run** tests (`npm test`)
6. **Commit** changes (`git commit -m 'Add amazing feature'`)
7. **Push** to branch (`git push origin feature/amazing-feature`)
8. **Open** Pull Request

### Code Standards
- **ESLint**: Follow configured linting rules
- **Error Handling**: All async functions must have try-catch
- **Logging**: Use Winston logger for all logging
- **Validation**: Validate all inputs with schemas
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 **Ready to Use!**

Your TaskFlow backend is **production-ready** with:

✅ **95+ API Endpoints** covering all functionality  
✅ **Enterprise Security** with multi-layer permissions  
✅ **AI-Powered Features** for intelligent task management  
✅ **Real-time Collaboration** with WebSocket integration  
✅ **Professional File Upload** with Cloudinary CDN  
✅ **Comprehensive Analytics** with AI insights  
✅ **Multi-tenant Architecture** ready for scaling  

**Start building amazing task management experiences!** 🚀