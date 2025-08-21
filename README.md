# TaskFlow AI Smart Team Task Manager

## 🚀 Quick Start

### Development Scripts

Run all applications concurrently:
```bash
npm run dev          # Run all apps (Backend + Main + Admin + Mobile)
npm run dev:web      # Run web apps only (Backend + Main + Admin)
npm run dev:all      # Run all apps with detailed logging
```

Run individual applications:
```bash
npm run dev:backend  # Backend API server
npm run dev:main     # Main web application
npm run dev:admin    # Admin panel
npm run dev:mobile   # Mobile app (Expo)
```

### Application URLs
- **Backend API**: http://localhost:3001
- **Main App**: http://localhost:5173
- **Admin Panel**: http://localhost:5175
- **Mobile**: Expo DevTools (port 19000)

### Show Status
```bash
npm run show:status  # Display all application URLs and status
```

---

# TaskFlow AI Smart Team Task Manager - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Models](#models)
3. [API Routes](#api-routes)
4. [Request Structures by Router](#request-structures-by-router)
5. [Authentication & Authorization](#authentication--authorization)
6. [Middleware](#middleware)
7. [Request/Response Interfaces](#requestresponse-interfaces)

## Overview

TaskFlow is a comprehensive team task management system with AI-powered features. The backend API is built with Node.js, Express, and MongoDB, providing RESTful endpoints for managing workspaces, spaces, boards, tasks, and more.

### Hierarchy
**Workspace → Space → Board → Column → Task**

Spaces are the primary organizational unit within workspaces where boards live. This simplified hierarchy provides better performance and easier navigation.

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Models

### 1. User
**Description**: Core user entity with authentication and profile management
**Key Fields**:
- `name` (String): User's full name
- `email` (String): Unique email address
- `password` (String): Hashed password
- `avatar` (String): Profile picture URL
- `emailVerified` (Boolean): Email verification status
- `isActive` (Boolean): Account status
- `isLocked` (Boolean): Account lock status
- `preferences` (Object): User preferences
- `metadata` (Object): Additional user data

### 2. Workspace
**Description**: Top-level organization unit for teams
**Key Fields**:
- `name` (String): Workspace name
- `description` (String): Workspace description
- `plan` (String): Subscription plan (free, basic, premium, enterprise)
- `owner` (ObjectId): Reference to User
- `members` (Array): Workspace members with roles
- `settings` (Object): Workspace configuration
- `isActive` (Boolean): Workspace status

### 3. Space
**Description**: Primary organizational unit within workspaces where boards live
**Key Fields**:
- `name` (String): Space name
- `description` (String): Space description
- `workspace` (ObjectId): Reference to Workspace
- `members` (Array): Space members with roles (owner, admin, contributor, member, viewer)
- `settings` (Object): Space configuration and features
- `stats` (Object): Space statistics (totalBoards, totalTasks, completedTasks, etc.)
- `isActive` (Boolean): Space status
- `isArchived` (Boolean): Archive status

### 4. Board
**Description**: Kanban boards for task management
**Key Fields**:
- `name` (String): Board name
- `description` (String): Board description
- `type` (String): Board type (kanban, list, calendar, timeline)
- `space` (ObjectId): Reference to Space (required)
- `columns` (Array): Board columns
- `settings` (Object): Board configuration
- `isTemplate` (Boolean): Template flag

### 5. Task
**Description**: Individual work items
**Key Fields**:
- `title` (String): Task title
- `description` (String): Task description
- `status` (String): Task status (todo, in_progress, review, done, archived)
- `priority` (String): Priority level (low, medium, high, critical)
- `boardId` (ObjectId): Reference to Board
- `space` (ObjectId): Reference to Space (required)
- `column` (ObjectId): Reference to Column
- `assignees` (Array): Assigned users
- `labels` (Array): Task labels
- `dueDate` (Date): Task deadline
- `estimatedHours` (Number): Time estimate
- `actualHours` (Number): Actual time spent
- `attachments` (Array): File attachments
- `comments` (Array): Task comments
- `watchers` (Array): Users watching the task

### 6. Column
**Description**: Board columns for task organization
**Key Fields**:
- `name` (String): Column name
- `color` (String): Column color
- `order` (Number): Column position
- `wipLimit` (Number): Work-in-progress limit
- `boardId` (ObjectId): Reference to Board
- `isDefault` (Boolean): Default column flag

### 7. Comment
**Description**: Task comments and discussions
**Key Fields**:
- `content` (String): Comment text
- `author` (ObjectId): Reference to User
- `taskId` (ObjectId): Reference to Task
- `mentions` (Array): Mentioned users
- `attachments` (Array): File attachments
- `reactions` (Array): User reactions
- `isPinned` (Boolean): Pinned comment flag
- `isResolved` (Boolean): Resolved comment flag

### 8. File
**Description**: File uploads and attachments (Local storage only)
**Key Fields**:
- `filename` (String): Original filename
- `originalName` (String): Original file name
- `mimeType` (String): File MIME type
- `size` (Number): File size in bytes
- `path` (String): File storage path on local disk
- `extension` (String): File extension
- `checksum` (String): File checksum for integrity
- `uploadedBy` (ObjectId): Reference to User
- `space` (ObjectId): Reference to Space
- `attachedTo` (Object): Related entity info
- `isPublic` (Boolean): Public access flag

**Note**: This File model supports ONLY local disk storage. Cloud/CDN integrations are not supported in this version.

### 9. Notification
**Description**: System notifications
**Key Fields**:
- `title` (String): Notification title
- `message` (String): Notification message
- `type` (String): Notification type
- `recipientId` (ObjectId): Reference to User
- `relatedEntity` (Object): Related entity info
- `priority` (String): Priority level (low, medium, high)
- `isRead` (Boolean): Read status
- `deliveryMethods` (Object): Delivery configuration

### 10. Tag
**Description**: Space tags with analytics
**Key Fields**:
- `name` (String): Tag name
- `color` (String): Tag color
- `textColor` (String): Text color for contrast
- `description` (String): Tag description
- `scope` (String): Tag scope (global, workspace, space, board)
- `space` (ObjectId): Reference to Space
- `workspace` (ObjectId): Reference to Workspace
- `createdBy` (ObjectId): Reference to User
- `category` (String): Tag category
- `usageCount` (Number): Usage frequency
- `isSystem` (Boolean): System tag flag

### 11. Checklist
**Description**: Task checklists
**Key Fields**:
- `title` (String): Checklist title
- `items` (Array): Checklist items
- `taskId` (ObjectId): Reference to Task
- `createdBy` (ObjectId): Reference to User
- `isCompleted` (Boolean): Completion status

### 12. Reminder
**Description**: Task and space reminders
**Key Fields**:
- `title` (String): Reminder title
- `message` (String): Reminder message
- `dueDate` (Date): Reminder date
- `recipientId` (ObjectId): Reference to User
- `context` (Object): Context information including spaceId
- `frequency` (String): Reminder frequency
- `isActive` (Boolean): Active status

### 13. Analytics
**Description**: Modular analytics and metrics
**Key Fields**:
- `scopeType` (String): Analytics scope (workspace, space, board, user)
- `scopeId` (ObjectId): Scope reference
- `kind` (String): Analytics type (velocity, wip, leadTime, cycleTime, burndown, custom)
- `data` (Object): Analytics data
- `period` (Object): Date range with start and end dates
- `createdAt` (Date): Creation timestamp

### 14. Invitation
**Description**: Workspace and space invitations
**Key Fields**:
- `email` (String): Invitee email
- `token` (String): Invitation token
- `type` (String): Invitation type (workspace, space, board)
- `targetEntity` (Object): Target entity information
- `invitedBy` (ObjectId): Reference to User
- `status` (String): Invitation status
- `expiresAt` (Date): Expiration date

### 15. UserRoles
**Description**: User role and permission management
**Key Fields**:
- `userId` (ObjectId): Reference to User
- `systemRole` (String): System-wide role
- `workspaceRoles` (Array): Workspace-specific roles
- `spaceRoles` (Array): Space-specific roles with permissions
- `boardRoles` (Array): Board-specific roles
- `permissions` (Object): User permissions

### 16. UserSessions
**Description**: User session management
**Key Fields**:
- `userId` (ObjectId): Reference to User
- `sessions` (Array): Active sessions
- `deviceInfo` (Object): Device information
- `lastActivity` (Date): Last activity timestamp

### 17. UserPreferences
**Description**: User preferences and settings
**Key Fields**:
- `userId` (ObjectId): Reference to User
- `notifications` (Object): Notification preferences
- `theme` (String): UI theme preference
- `language` (String): Language preference
- `timezone` (String): Timezone setting

### 18. ActivityLog
**Description**: System activity tracking
**Key Fields**:
- `userId` (ObjectId): Reference to User
- `action` (String): Performed action
- `entityType` (String): Entity type
- `entityId` (ObjectId): Entity reference
- `description` (String): Activity description
- `metadata` (Object): Additional data
- `ipAddress` (String): User IP address
- `userAgent` (String): User agent string

### 19. AIJob
**Description**: AI processing jobs with observability
**Key Fields**:
- `type` (String): Job type
- `status` (String): Job status (queued, running, succeeded, failed, cancelled)
- `input` (Object): Job input data
- `output` (Object): Job output data
- `progress` (Number): Progress percentage
- `userId` (ObjectId): Reference to User
- `workspaceId` (ObjectId): Reference to Workspace
- `spaceId` (ObjectId): Reference to Space
- `logs` (Array): Job execution logs with timestamps and levels
- `usage` (Object): Token usage and cost tracking
- `retryCount` (Number): Number of retry attempts
- `startedAt` (Date): Job start time
- `finishedAt` (Date): Job completion time
- `error` (Object): Error information if failed

### 20. Template
**Description**: Reusable board templates with categorization
**Key Fields**:
- `name` (String): Template name
- `description` (String): Template description
- `type` (String): Template type (task, board, space, workflow, checklist)
- `data` (Object): Template data
- `createdBy` (ObjectId): Reference to User
- `isPublic` (Boolean): Public template flag
- `isSystem` (Boolean): System template flag
- `usageCount` (Number): Usage frequency
- `tags` (Array): Template tags for categorization
- `category` (String): Template category (Agile, Scrum, Kanban, etc.)

### 21. Quota
**Description**: Usage quotas and limits
**Key Fields**:
- `workspaceId` (ObjectId): Reference to Workspace
- `type` (String): Quota type
- `limit` (Number): Quota limit
- `used` (Number): Current usage
- `resetDate` (Date): Reset date
- `plan` (String): Associated plan

### 22. Admin
**Description**: System administration (global/system-level only)
**Key Fields**:
- `userId` (ObjectId): Reference to User
- `role` (String): Admin role
- `permissions` (Object): Admin permissions
- `isActive` (Boolean): Active status
- `lastLogin` (Date): Last login timestamp

## API Routes

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /register` - User registration
- `POST /login` - User login
- `POST /password-reset/request` - Request password reset
- `POST /password-reset/confirm` - Reset password
- `GET /verify-email/:token` - Verify email address

#### Protected Routes
- `GET /me` - Get current user profile
- `POST /logout` - User logout
- `PUT /profile` - Update user profile
- `POST /avatar` - Upload profile avatar
- `PUT /change-password` - Change password
- `PUT /preferences` - Update user preferences
- `GET /sessions` - Get user sessions
- `DELETE /sessions/:sessionId` - End specific session
- `GET /activity` - Get user activity log

### Workspace Routes (`/api/workspaces`)

#### Protected Routes
- `GET /` - Get all user workspaces
- `GET /:id` - Get specific workspace
- `POST /` - Create new workspace
- `PUT /:id` - Update workspace
- `POST /:id/invite` - Invite member to workspace
- `POST /accept-invitation/:token` - Accept workspace invitation
- `GET /:id/members` - Get workspace members
- `DELETE /:id/members/:memberId` - Remove workspace member
- `PUT /:id/settings` - Update workspace settings
- `GET /:id/analytics` - Get workspace analytics
- `POST /:id/transfer-ownership` - Transfer workspace ownership

### Space Routes (`/api/spaces`)

#### Protected Routes
- `GET /workspace/:workspaceId` - Get spaces in workspace
- `GET /:id` - Get specific space
- `POST /` - Create new space
- `PUT /:id` - Update space
- `DELETE /:id` - Delete space
- `POST /:id/members` - Add space member
- `DELETE /:id/members/:memberId` - Remove space member
- `PUT /:id/members/:memberId/role` - Update member role
- `GET /:id/members` - Get space members
- `GET /:id/insights` - Get space insights
- `POST /:id/archive` - Archive space
- `POST /:id/clone` - Clone space

### Board Routes (`/api/boards`)

#### Protected Routes
- `GET /space/:spaceId` - Get boards in space
- `GET /:id` - Get specific board
- `POST /` - Create new board
- `PUT /:id` - Update board
- `DELETE /:id` - Delete board
- `POST /:id/columns` - Add board column
- `PUT /:id/columns/:columnId` - Update column
- `DELETE /:id/columns/:columnId` - Delete column

### Task Routes (`/api/tasks`)

#### Protected Routes
- `GET /` - Get tasks
- `GET /recommendations` - Get task recommendations
- `GET /overdue` - Get overdue tasks
- `GET /:id` - Get specific task
- `POST /` - Create new task
- `PUT /:id` - Update task
- `PATCH /:id/move` - Move task to different column
- `DELETE /:id` - Delete task
- `PATCH /bulk-update` - Bulk update tasks
- `POST /:id/time-tracking` - Start time tracking
- `POST /:id/time-tracking/stop` - Stop time tracking
- `POST /:id/duplicate` - Duplicate task
- `GET /:id/history` - Get task history
- `POST /:id/dependencies` - Add task dependency
- `DELETE /:id/dependencies/:dependencyId` - Remove task dependency

#### Task Comments
- `POST /:id/comments` - Add comment to task
- `PUT /comments/:commentId` - Update comment
- `DELETE /comments/:commentId` - Delete comment
- `POST /comments/:commentId/reactions` - Add reaction to comment
- `DELETE /comments/:commentId/reactions` - Remove reaction from comment
- `POST /comments/:commentId/pin` - Toggle comment pin
- `POST /comments/:commentId/resolve` - Toggle comment resolve

#### Task Watchers
- `POST /:id/watchers` - Add watcher to task
- `DELETE /:id/watchers` - Remove watcher from task

### File Routes (`/api/files`)

#### Protected Routes
- `GET /` - Get files
- `GET /:id` - Get specific file
- `POST /upload` - Upload file
- `DELETE /:id` - Delete file
- `GET /:id/download` - Download file
- `POST /logo/:entityType/:entityId` - Upload entity logo (workspace/space)

### Notification Routes (`/api/notifications`)

#### Protected Routes
- `GET /` - Get notifications
- `GET /stats` - Get notification statistics
- `POST /` - Create notification (Admin only)
- `PATCH /:id/read` - Mark notification as read
- `POST /mark-all-read` - Mark all notifications as read
- `PATCH /bulk-read` - Bulk mark notifications as read
- `DELETE /:id` - Delete notification
- `POST /clear-read` - Delete read notifications
- `PUT /preferences` - Update notification preferences

### Checklist Routes (`/api/checklists`)

#### Protected Routes
- `GET /task/:taskId` - Get task checklists
- `GET /:id` - Get specific checklist
- `POST /` - Create new checklist
- `PUT /:id` - Update checklist
- `DELETE /:id` - Delete checklist
- `POST /:id/items` - Add checklist item
- `PUT /:id/items/:itemId` - Update checklist item
- `DELETE /:id/items/:itemId` - Delete checklist item
- `PATCH /:id/items/:itemId/toggle` - Toggle checklist item

### Reminder Routes (`/api/reminders`)

#### Protected Routes
- `GET /` - Get user reminders
- `GET /:id` - Get specific reminder
- `POST /` - Create new reminder
- `PUT /:id` - Update reminder
- `DELETE /:id` - Delete reminder
- `PATCH /:id/snooze` - Snooze reminder
- `PATCH /:id/dismiss` - Dismiss reminder

### Analytics Routes (`/api/analytics`)

#### Protected Routes
- `GET /workspace/:workspaceId` - Get workspace analytics
- `GET /space/:spaceId` - Get space analytics
- `GET /board/:boardId` - Get board analytics
- `GET /user/:userId` - Get user analytics
- `GET /team/:spaceId` - Get team analytics

### Tag Routes (`/api/tags`)

#### Protected Routes
- `GET /workspace/:workspaceId` - Get workspace tags
- `GET /space/:spaceId` - Get space tags
- `GET /:id` - Get specific tag
- `POST /` - Create new tag
- `PUT /:id` - Update tag
- `DELETE /:id` - Delete tag
- `GET /:id/usage` - Get tag usage statistics

### Invitation Routes (`/api/invitations`)

#### Public Routes
- `POST /workspace` - Invite to workspace
- `POST /space` - Invite to space
- `GET /:token` - Get invitation details
- `POST /:token/accept` - Accept invitation
- `POST /:token/decline` - Decline invitation
- `POST /:token/resend` - Resend invitation

### AI Routes (`/api/ai`)

#### Protected Routes
- `POST /suggestions` - Generate task suggestions
- `GET /risks/space/:spaceId` - Analyze space risks
- `GET /risks/board/:boardId` - Analyze board risks
- `POST /parse` - Parse natural language input
- `POST /timeline/:spaceId` - Generate space timeline
- `GET /recommendations/:spaceId` - Get smart recommendations
- `GET /performance/:spaceId` - Analyze team performance
- `POST /description` - Generate task description

## Authentication & Authorization

### JWT Token Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "avatar_url",
  "emailVerified": true,
  "isActive": true
}
```

### Permission Levels

#### System Roles
- `admin` - System administrator
- `super_admin` - Super administrator
- `user` - Regular user

#### Workspace Roles
- `owner` - Workspace owner (full access)
- `admin` - Workspace administrator
- `member` - Workspace member

#### Space Roles
- `owner` - Space owner (full access)
- `admin` - Space administrator
- `contributor` - Space contributor
- `member` - Space member
- `viewer` - Space viewer (read-only)

#### Board Permissions
- `canView` - View board
- `canEdit` - Edit board
- `canDelete` - Delete board
- `canManageMembers` - Manage board members

### Permission Hierarchy
1. **System Admin** - Access to all system features
2. **Workspace Owner** - Full access to workspace and all spaces
3. **Workspace Admin** - Administrative access to workspace
4. **Space Owner** - Full access to specific space
5. **Space Admin** - Administrative access to space
6. **Space Contributor** - Can create and edit tasks
7. **Space Member** - Can view and comment on tasks
8. **Space Viewer** - Read-only access to space

## Middleware

### Authentication Middleware
- **Purpose**: Validates JWT tokens and user sessions
- **Usage**: Applied to all protected routes
- **Headers Required**: `Authorization: Bearer <token>`
- **Optional Headers**: `X-Device-ID` for session validation

### Permission Middleware

#### `requireSystemAdmin`
- **Purpose**: Restricts access to system administrators only
- **Usage**: Admin-only routes

#### `requireWorkspacePermission(role)`
- **Purpose**: Checks workspace-level permissions
- **Parameters**: `role` - Required role (member, admin, owner)
- **Usage**: Workspace-related operations

#### `requireSpacePermission(permission)`
- **Purpose**: Checks space-level permissions
- **Parameters**: `permission` - Required permission or role
- **Usage**: Space-related operations

#### `requireBoardPermission(permission)`
- **Purpose**: Checks board-level permissions
- **Parameters**: `permission` - Required permission
- **Usage**: Board-related operations

#### `requireResourceOwner(resourceField)`
- **Purpose**: Ensures user owns the resource
- **Parameters**: `resourceField` - Field containing user ID
- **Usage**: Resource ownership validation

### Validation Middleware
- **Purpose**: Validates request body against schemas
- **Usage**: Applied to POST/PUT routes
- **Features**: Type checking, length validation, required fields

### Rate Limiting Middleware
- **Purpose**: Prevents abuse of sensitive operations
- **Usage**: Applied to authentication and sensitive operations
- **Configuration**: Configurable limits per time window

### Upload Middleware
- **Purpose**: Handles file uploads
- **Types**: Avatar, task attachments, comment attachments
- **Features**: File type validation, size limits, storage management

### Error Middleware
- **Purpose**: Global error handling
- **Features**: Error logging, standardized error responses
- **Usage**: Applied globally to all routes

## Request/Response Interfaces

### Common Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Authentication Interfaces

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "inviteToken": "optional_invite_token",
  "device": {
    "deviceId": "device_123",
    "deviceInfo": {
      "type": "web",
      "os": "Windows 10",
      "browser": "Chrome"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123",
  "rememberMe": true,
  "device": {
    "deviceId": "device_123",
    "deviceInfo": {
      "type": "web",
      "os": "Windows 10",
      "browser": "Chrome"
    }
  }
}
```

### Workspace Interfaces

#### Create Workspace
```http
POST /api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workspace",
  "description": "Workspace description",
  "plan": "free"
}
```

#### Invite Member
```http
POST /api/workspaces/:id/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "member",
  "message": "Welcome to our workspace!"
}
```

### Space Interfaces

#### Create Space
```http
POST /api/spaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Space",
  "description": "Space description",
  "workspaceId": "workspace_id",
  "settings": {
    "color": "#3B82F6",
    "icon": "📋"
  }
}
```

### Task Interfaces

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Implement login feature",
  "description": "Create user authentication system",
  "boardId": "board_id",
  "columnId": "column_id",
  "priority": "high",
  "assignees": ["user_id_1", "user_id_2"],
  "labels": ["frontend", "auth"],
  "estimatedHours": 8,
  "dueDate": "2024-01-20T23:59:59.000Z",
  "startDate": "2024-01-15T00:00:00.000Z",
  "position": 0
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "assignees": ["user_id_1"],
  "labels": ["frontend"],
  "estimatedHours": 6,
  "actualHours": 4,
  "dueDate": "2024-01-25T23:59:59.000Z"
}
```

#### Move Task
```http
PATCH /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "columnId": "new_column_id",
  "position": 2
}
```

### Comment Interfaces

#### Add Comment
```http
POST /api/tasks/:id/comments
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "content": "This is a comment",
  "mentions": ["user_id_1", "user_id_2"],
  "parentCommentId": "parent_comment_id"
}
```

### File Upload Interfaces

#### Upload Task Attachment
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Task with attachment",
  "boardId": "board_id",
  "columnId": "column_id",
  "attachments": [file1, file2]
}
```

### AI Interfaces

#### Generate Task Suggestions
```http
POST /api/ai/suggestions
Authorization: Bearer <token>
Content-Type: application/json

{
  "spaceGoal": "Build a task management application",
  "spaceContext": "Team of 5 developers working on a React app",
  "boardType": "kanban"
}
```

#### Parse Natural Language
```http
POST /api/ai/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": "Create a high priority task for user authentication due next Friday",
  "boardId": "board_id"
}
```

### Notification Interfaces

#### Update Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "email": {
      "task_assigned": true,
      "task_completed": false,
      "comment_added": true
    },
    "push": {
      "task_assigned": true,
      "due_date_reminder": true
    }
  }
}
```

### Analytics Interfaces

#### Get Space Analytics
```http
GET /api/analytics/space/:spaceId?dateRange=last30days&metrics=taskCompletion,teamPerformance
Authorization: Bearer <token>
```

### Pagination and Filtering

#### Pagination Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field
- `sortOrder` - Sort direction (asc, desc)

#### Filtering Parameters
- `status` - Filter by status
- `priority` - Filter by priority
- `assignee` - Filter by assignee
- `dueDate` - Filter by due date
- `tags` - Filter by tags
- `search` - Text search

#### Example with Pagination and Filtering
```http
GET /api/tasks?page=1&limit=20&sortBy=dueDate&sortOrder=asc&status=in_progress&priority=high&search=login
Authorization: Bearer <token>
```

### WebSocket Events

TaskFlow provides comprehensive real-time functionality through Socket.IO integration. All WebSocket connections require JWT authentication.

### Connection Setup

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for connection events
socket.on('connected', (data) => {
  console.log('Connected to TaskFlow:', data);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Authentication

All WebSocket events require authentication via JWT token in the connection handshake:

```javascript
// Token in auth object (recommended)
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

// Or token in query string
const socket = io('http://localhost:3001?token=your-jwt-token');
```

### Board Events

#### Join Board Room
```javascript
// Join board for real-time updates
socket.emit('board:join', { boardId: 'board_id' });

// Listen for board state
socket.on('board:state', (data) => {
  console.log('Board state:', data.board, data.columns, data.tasks);
});

// Listen for user join/leave events
socket.on('board:user-joined', (data) => {
  console.log('User joined:', data.user.name);
});

socket.on('board:user-left', (data) => {
  console.log('User left:', data.user.name);
});
```

#### Leave Board Room
```javascript
socket.emit('board:leave', { boardId: 'board_id' });
```

#### Column Operations
```javascript
// Create new column
socket.emit('column:create', {
  boardId: 'board_id',
  columnData: {
    name: 'New Column',
    color: '#3B82F6',
    position: 2
  }
});

// Update column
socket.emit('column:update', {
  columnId: 'column_id',
  updates: {
    name: 'Updated Column',
    color: '#10B981'
  }
});

// Delete column
socket.emit('column:delete', { columnId: 'column_id' });

// Reorder columns
socket.emit('columns:reorder', {
  boardId: 'board_id',
  columnOrder: [
    { columnId: 'col1', position: 0 },
    { columnId: 'col2', position: 1 }
  ]
});

// Listen for column events
socket.on('column:created', (data) => {
  console.log('Column created:', data.column);
});

socket.on('column:updated', (data) => {
  console.log('Column updated:', data.column);
});

socket.on('column:deleted', (data) => {
  console.log('Column deleted:', data.columnId);
});

socket.on('columns:reordered', (data) => {
  console.log('Columns reordered:', data.columnOrder);
});
```

#### Board Settings
```javascript
// Update board settings
socket.emit('board:settings-update', {
  boardId: 'board_id',
  settings: {
    showTaskCount: true,
    allowComments: true,
    autoArchive: false
  }
});

// Listen for settings updates
socket.on('board:settings-updated', (data) => {
  console.log('Board settings updated:', data.settings);
});
```

#### Board View Tracking
```javascript
// Track board view for analytics
socket.emit('board:view', { boardId: 'board_id' });

// Listen for user viewing events
socket.on('board:user-viewing', (data) => {
  console.log('User viewing board:', data.user.name);
});
```

#### Bulk Operations
```javascript
// Perform bulk operations
socket.emit('board:bulk-operation', {
  boardId: 'board_id',
  operation: 'move_tasks',
  targets: ['task1', 'task2', 'task3'],
  options: {
    targetColumnId: 'new_column_id'
  }
});

// Listen for bulk operation completion
socket.on('board:bulk-operation-completed', (data) => {
  console.log('Bulk operation completed:', data.result);
});
```

### Task Events

#### Join Project/Board Rooms
```javascript
// Join project room (legacy - use space:join instead)
socket.emit('join:project', 'project_id');

// Join board room
socket.emit('join:board', 'board_id');

// Listen for user join events
socket.on('user:joined', (data) => {
  console.log('User joined:', data.user.name);
});
```

#### Task Updates
```javascript
// Update task
socket.emit('task:update', {
  taskId: 'task_id',
  boardId: 'board_id',
  updates: {
    title: 'Updated Task Title',
    description: 'Updated description',
    priority: 'high'
  }
});

// Listen for task updates
socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task);
});
```

#### Task Movement (Drag & Drop)
```javascript
// Move task between columns
socket.emit('task:move', {
  taskId: 'task_id',
  sourceColumnId: 'source_column_id',
  targetColumnId: 'target_column_id',
  targetPosition: 2,
  boardId: 'board_id'
});

// Listen for task movement
socket.on('task:moved', (data) => {
  console.log('Task moved:', {
    taskId: data.taskId,
    from: data.sourceColumnId,
    to: data.targetColumnId,
    position: data.targetPosition
  });
});
```

#### Comments
```javascript
// Add comment to task
socket.emit('comment:add', {
  taskId: 'task_id',
  content: 'This is a comment',
  mentions: ['user_id_1', 'user_id_2']
});

// Listen for new comments
socket.on('comment:added', (data) => {
  console.log('Comment added:', data.comment);
});
```

#### Typing Indicators
```javascript
// Start typing indicator
socket.emit('typing:start', {
  boardId: 'board_id',
  taskId: 'task_id'
});

// Stop typing indicator
socket.emit('typing:stop', {
  boardId: 'board_id',
  taskId: 'task_id'
});

// Listen for typing events
socket.on('user:typing', (data) => {
  console.log(`${data.user.name} is ${data.isTyping ? 'typing' : 'not typing'}`);
});
```

#### User Presence
```javascript
// Update user presence
socket.emit('presence:update', {
  boardId: 'board_id',
  status: 'online' // online, away, busy, offline
});

// Listen for presence updates
socket.on('user:presence', (data) => {
  console.log(`${data.user.name} is now ${data.status}`);
});
```

### Notification Events

#### Get Unread Count
```javascript
// Get unread notification count
socket.emit('notifications:getUnreadCount');

// Listen for unread count
socket.on('notifications:unreadCount', (data) => {
  console.log('Unread notifications:', data.count);
});
```

#### Mark Notifications as Read
```javascript
// Mark single notification as read
socket.emit('notifications:markRead', {
  notificationId: 'notification_id'
});

// Mark all notifications as read
socket.emit('notifications:markAllRead');

// Listen for read status updates
socket.on('notifications:marked-read', (data) => {
  console.log('Notification marked as read:', data.notificationId);
});

socket.on('notifications:all-marked-read', () => {
  console.log('All notifications marked as read');
});
```

#### Get Recent Notifications
```javascript
// Get recent notifications
socket.emit('notifications:getRecent', { limit: 10 });

// Listen for recent notifications
socket.on('notifications:recent', (data) => {
  console.log('Recent notifications:', data.notifications);
});
```

#### Subscribe to Notification Types
```javascript
// Subscribe to specific notification types
socket.emit('notifications:subscribe', {
  types: ['task_assigned', 'comment_added', 'due_date_reminder']
});

// Unsubscribe from notification types
socket.emit('notifications:unsubscribe', {
  types: ['due_date_reminder']
});

// Listen for subscription events
socket.on('notifications:subscribed', (data) => {
  console.log('Subscribed to:', data.types);
});

socket.on('notifications:unsubscribed', (data) => {
  console.log('Unsubscribed from:', data.types);
});
```

#### Receive New Notifications
```javascript
// Listen for new notifications
socket.on('notification:new', (data) => {
  console.log('New notification:', data.notification);
});

// Listen for typed notifications
socket.on('notification:typed', (data) => {
  console.log(`${data.type} notification:`, data.notification);
});
```

#### Update Delivery Status
```javascript
// Update notification delivery status
socket.emit('notifications:delivered', {
  notificationId: 'notification_id',
  deliveryMethod: 'socket' // socket, email, push
});
```

### Workspace Events

#### Join Workspace Room
```javascript
// Join workspace for real-time updates
socket.emit('workspace:join', { workspaceId: 'workspace_id' });

// Listen for workspace events
socket.on('workspace:user-joined', (data) => {
  console.log('User joined workspace:', data.user.name);
});

socket.on('workspace:user-left', (data) => {
  console.log('User left workspace:', data.user.name);
});
```

#### Leave Workspace Room
```javascript
socket.emit('workspace:leave', { workspaceId: 'workspace_id' });
```

#### Member Updates
```javascript
// Update workspace member
socket.emit('workspace:member-update', {
  workspaceId: 'workspace_id',
  memberId: 'member_id',
  updates: {
    role: 'admin',
    permissions: ['can_edit', 'can_delete']
  }
});

// Listen for member updates
socket.on('workspace:member-updated', (data) => {
  console.log('Member updated:', data.memberId, data.updates);
});
```

#### Workspace Settings
```javascript
// Update workspace settings
socket.emit('workspace:settings-update', {
  workspaceId: 'workspace_id',
  settings: {
    name: 'Updated Workspace Name',
    description: 'Updated description',
    theme: 'dark'
  }
});

// Listen for settings updates
socket.on('workspace:settings-updated', (data) => {
  console.log('Workspace settings updated:', data.settings);
});
```

#### Usage Limits
```javascript
// Check workspace usage limits
socket.emit('workspace:check-limits', { workspaceId: 'workspace_id' });

// Listen for limit warnings
socket.on('workspace:limit-warnings', (data) => {
  console.log('Limit warnings:', data.warnings);
});
```

### Connection Events

#### Connection Status
```javascript
// Listen for connection events
socket.on('connected', (data) => {
  console.log('Connected to TaskFlow:', data.message);
  console.log('User:', data.user);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('user:left', (data) => {
  console.log('User disconnected:', data.user.name);
});
```

### Error Handling

```javascript
// Listen for socket errors
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  
  // Handle specific error types
  if (error.message === 'Authentication required') {
    // Re-authenticate or redirect to login
  } else if (error.message === 'Access denied') {
    // Handle permission errors
  }
});
```

### Room Management

Socket.IO automatically manages room membership. Users are automatically added to:

- `user:{userId}` - Personal user room
- `notifications:{userId}` - User notification room
- `board:{boardId}` - Board collaboration room
- `workspace:{workspaceId}` - Workspace room

### Best Practices

1. **Authentication**: Always include JWT token in connection
2. **Error Handling**: Listen for error events and handle gracefully
3. **Room Management**: Join/leave rooms as needed to avoid unnecessary updates
4. **Rate Limiting**: Don't emit events too frequently
5. **Reconnection**: Handle disconnection and reconnection gracefully
6. **Cleanup**: Leave rooms when switching contexts

### Event Summary

| Category | Event | Direction | Description |
|----------|-------|-----------|-------------|
| **Connection** | `connected` | ← | Connection established |
| **Connection** | `disconnect` | ← | Connection lost |
| **Connection** | `error` | ← | Socket error occurred |
| **Board** | `board:join` | → | Join board room |
| **Board** | `board:leave` | → | Leave board room |
| **Board** | `board:state` | ← | Current board state |
| **Board** | `board:user-joined` | ← | User joined board |
| **Board** | `board:user-left` | ← | User left board |
| **Board** | `board:user-viewing` | ← | User viewing board |
| **Board** | `board:settings-update` | → | Update board settings |
| **Board** | `board:settings-updated` | ← | Board settings updated |
| **Column** | `column:create` | → | Create new column |
| **Column** | `column:created` | ← | Column created |
| **Column** | `column:update` | → | Update column |
| **Column** | `column:updated` | ← | Column updated |
| **Column** | `column:delete` | → | Delete column |
| **Column** | `column:deleted` | ← | Column deleted |
| **Column** | `columns:reorder` | → | Reorder columns |
| **Column** | `columns:reordered` | ← | Columns reordered |
| **Task** | `task:update` | → | Update task |
| **Task** | `task:updated` | ← | Task updated |
| **Task** | `task:move` | → | Move task |
| **Task** | `task:moved` | ← | Task moved |
| **Comment** | `comment:add` | → | Add comment |
| **Comment** | `comment:added` | ← | Comment added |
| **Typing** | `typing:start` | → | Start typing indicator |
| **Typing** | `typing:stop` | → | Stop typing indicator |
| **Typing** | `user:typing` | ← | User typing status |
| **Presence** | `presence:update` | → | Update presence |
| **Presence** | `user:presence` | ← | User presence update |
| **Notification** | `notifications:getUnreadCount` | → | Get unread count |
| **Notification** | `notifications:unreadCount` | ← | Unread count |
| **Notification** | `notifications:markRead` | → | Mark as read |
| **Notification** | `notifications:markAllRead` | → | Mark all as read |
| **Notification** | `notifications:marked-read` | ← | Notification marked read |
| **Notification** | `notifications:all-marked-read` | ← | All marked as read |
| **Notification** | `notifications:getRecent` | → | Get recent notifications |
| **Notification** | `notifications:recent` | ← | Recent notifications |
| **Notification** | `notifications:subscribe` | → | Subscribe to types |
| **Notification** | `notifications:unsubscribe` | → | Unsubscribe from types |
| **Notification** | `notifications:subscribed` | ← | Subscribed to types |
| **Notification** | `notifications:unsubscribed` | ← | Unsubscribed from types |
| **Notification** | `notification:new` | ← | New notification |
| **Notification** | `notification:typed` | ← | Typed notification |
| **Notification** | `notifications:delivered` | → | Update delivery status |
| **Workspace** | `workspace:join` | → | Join workspace |
| **Workspace** | `workspace:leave` | → | Leave workspace |
| **Workspace** | `workspace:user-joined` | ← | User joined workspace |
| **Workspace** | `workspace:user-left` | ← | User left workspace |
| **Workspace** | `workspace:member-update` | → | Update member |
| **Workspace** | `workspace:member-updated` | ← | Member updated |
| **Workspace** | `workspace:settings-update` | → | Update settings |
| **Workspace** | `workspace:settings-updated` | ← | Settings updated |
| **Workspace** | `workspace:check-limits` | → | Check usage limits |
| **Workspace** | `workspace:limit-warnings` | ← | Usage limit warnings |
| **Bulk** | `board:bulk-operation` | → | Perform bulk operation |
| **Bulk** | `board:bulk-operation-completed` | ← | Bulk operation completed |

**Legend**: → Client to Server, ← Server to Client

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `423` - Locked
- `429` - Too Many Requests
- `500` - Internal Server Error

### Custom Error Codes
- `INVALID_TOKEN` - Invalid JWT token
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `FILE_TOO_LARGE` - Uploaded file exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file type

## Rate Limiting

### Default Limits
- **Authentication**: 5 requests per 15 minutes
- **File Uploads**: 10 requests per hour
- **API Calls**: 1000 requests per hour per user
- **WebSocket Connections**: 10 connections per user

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642233600
```

## Security Features

### Authentication Security
- JWT tokens with configurable expiration
- Session management with device tracking
- Password hashing with bcrypt
- Account lockout after failed attempts
- Email verification for new accounts

### Authorization Security
- Role-based access control (RBAC)
- Permission-based access control (PBAC)
- Resource ownership validation
- Workspace and space isolation

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload security

### API Security
- Rate limiting
- Request size limits
- CORS configuration
- Helmet.js security headers
- Request logging and monitoring

## Development and Testing

### Environment Variables
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

**Important**: Never commit real credentials to version control. Use environment variables and .env files for sensitive configuration.

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run tests with coverage
npm run test:coverage
```

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Get user profile
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/me

# Create workspace
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Workspace","description":"Test"}' \
  http://localhost:3000/api/workspaces
```

### Database Migration

To migrate from the old project-based structure to the new space-based structure:

```bash
cd apps/backend
node src/scripts/migrate-projects-to-spaces.js
```

This migration script will:
- Convert all existing projects to spaces
- Update all references (boards, tasks, tags, etc.)
- Migrate user roles and permissions
- Update statistics and metadata
- Drop the projects collection

## File Organization

### Local Storage Structure
```
uploads/
├── avatars/          # User profile pictures
├── boards/           # Board-specific files
├── comments/         # Comment attachments
├── general/          # General files
├── logos/            # Workspace & space logos
├── tasks/            # Task attachments
└── thumbnails/       # Generated thumbnails
```

All files are stored locally on disk. No cloud/CDN integration is supported in this version.

This comprehensive documentation covers all aspects of the TaskFlow API, including models, routes, permissions, middleware, and request/response interfaces. The API is designed to be secure, scalable, and developer-friendly with comprehensive error handling and real-time capabilities.

## Request Structures by Router

This section provides detailed request structures for each backend router, including validation schemas and example requests.

### Authentication Router (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "inviteToken": "optional_invite_token",
  "device": {
    "deviceId": "device_123",
    "deviceInfo": {
      "type": "web",
      "os": "Windows 10",
      "browser": "Chrome"
    }
  }
}
```

**Validation Schema:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `inviteToken`: Optional string
- `device.deviceId`: Optional string
- `device.deviceInfo.type`: Optional enum ['web', 'mobile', 'desktop']
- `device.deviceInfo.os`: Optional string
- `device.deviceInfo.browser`: Optional string

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123",
  "rememberMe": true,
  "device": {
    "deviceId": "device_123",
    "deviceInfo": {
      "type": "web",
      "os": "Windows 10",
      "browser": "Chrome"
    }
  }
}
```

**Validation Schema:**
- `email`: Required, valid email format
- `password`: Required
- `rememberMe`: Optional boolean
- `device`: Same structure as register

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newsecurepassword456"
}
```

**Validation Schema:**
- `currentPassword`: Required
- `newPassword`: Required, minimum 8 characters

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "avatar_url",
  "preferences": {
    "theme": "dark",
    "language": "en"
  },
  "metadata": {
    "timezone": "UTC-5"
  }
}
```

**Validation Schema:**
- `name`: Optional, 2-100 characters
- `avatar`: Optional string
- `preferences`: Optional object
- `metadata`: Optional object

#### Update Preferences
```http
PUT /api/auth/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "section": "notifications",
  "updates": {
    "email": true,
    "push": false
  }
}
```

**Validation Schema:**
- `section`: Required string
- `updates`: Required object

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "device_123",
  "allDevices": false
}
```

**Validation Schema:**
- `deviceId`: Optional string
- `allDevices`: Optional boolean

#### Password Reset Request
```http
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Validation Schema:**
- `email`: Required, valid email format

#### Password Reset Confirm
```http
POST /api/auth/password-reset/confirm
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Validation Schema:**
- `token`: Required string
- `newPassword`: Required, minimum 8 characters

### Workspace Router (`/api/workspaces`)

#### Create Workspace
```http
POST /api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workspace",
  "description": "Workspace description",
  "plan": "free"
}
```

**Validation Schema:**
- `name`: Required, 2-200 characters
- `description`: Optional, maximum 1000 characters
- `plan`: Optional enum ['free', 'basic', 'premium', 'enterprise']

#### Update Workspace
```http
PUT /api/workspaces/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Workspace Name",
  "description": "Updated description",
  "settings": {
    "theme": "dark",
    "timezone": "UTC"
  }
}
```

**Validation Schema:**
- `name`: Optional, 2-200 characters
- `description`: Optional, maximum 1000 characters
- `settings`: Optional object

#### Invite Member
```http
POST /api/workspaces/:id/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "member",
  "message": "Welcome to our workspace!"
}
```

**Validation Schema:**
- `email`: Required, valid email format
- `role`: Optional enum ['member', 'admin'], default: 'member'
- `message`: Optional, maximum 500 characters

#### Update Settings
```http
PUT /api/workspaces/:id/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "section": "general",
  "updates": {
    "name": "New Name",
    "description": "New Description"
  }
}
```

**Validation Schema:**
- `section`: Required string
- `updates`: Required object

#### Transfer Ownership
```http
POST /api/workspaces/:id/transfer-ownership
Authorization: Bearer <token>
Content-Type: application/json

{
  "newOwnerId": "new_owner_user_id"
}
```

**Validation Schema:**
- `newOwnerId`: Required ObjectId

### Space Router (`/api/spaces`)

#### Create Space
```http
POST /api/spaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Space",
  "description": "Space description",
  "workspaceId": "workspace_id",
  "settings": {
    "color": "#3B82F6",
    "icon": "📋"
  },
  "permissions": {
    "defaultRole": "member"
  }
}
```

**Validation Schema:**
- `name`: Required, 2-200 characters
- `description`: Optional, maximum 1000 characters
- `workspaceId`: Required ObjectId
- `settings`: Optional object
- `permissions`: Optional object

#### Update Space
```http
PUT /api/spaces/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Space Name",
  "description": "Updated description",
  "settings": {
    "color": "#10B981",
    "icon": "🚀"
  },
  "permissions": {
    "defaultRole": "contributor"
  }
}
```

**Validation Schema:**
- `name`: Optional, 2-200 characters
- `description`: Optional, maximum 1000 characters
- `settings`: Optional object
- `permissions`: Optional object

#### Add Member
```http
POST /api/spaces/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "role": "member"
}
```

**Validation Schema:**
- `userId`: Required ObjectId
- `role`: Optional enum ['viewer', 'member', 'admin'], default: 'member'

### Board Router (`/api/boards`)

#### Create Board
```http
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Board",
  "description": "Board description",
  "type": "kanban",
  "spaceId": "space_id"
}
```

**Validation Schema:**
- `name`: Required, 2-100 characters
- `description`: Optional, maximum 500 characters
- `type`: Optional enum ['kanban', 'list', 'calendar', 'timeline'], default: 'kanban'
- `spaceId`: Required ObjectId

#### Update Board
```http
PUT /api/boards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Board Name",
  "description": "Updated description"
}
```

**Validation Schema:**
- `name`: Optional, 2-100 characters
- `description`: Optional, maximum 500 characters

#### Add Column
```http
POST /api/boards/:id/columns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Column",
  "color": "#3B82F6",
  "position": 2
}
```

**Validation Schema:**
- `name`: Required, 1-100 characters
- `color`: Optional, hex color pattern (#RRGGBB)
- `position`: Required number, minimum 0

#### Update Column
```http
PUT /api/boards/:id/columns/:columnId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Column",
  "color": "#10B981",
  "wipLimit": 5
}
```

**Validation Schema:**
- `name`: Optional, 1-100 characters
- `color`: Optional, hex color pattern (#RRGGBB)
- `wipLimit`: Optional number, minimum 0

### Task Router (`/api/tasks`)

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Implement login feature",
  "description": "Create user authentication system",
  "boardId": "board_id",
  "columnId": "column_id",
  "priority": "high",
  "assignees": ["user_id_1", "user_id_2"],
  "labels": ["frontend", "auth"],
  "estimatedHours": 8,
  "dueDate": "2024-01-20T23:59:59.000Z",
  "startDate": "2024-01-15T00:00:00.000Z",
  "position": 0,
  "attachments": [file1, file2]
}
```

**Validation Schema:**
- `title`: Required, 2-200 characters
- `description`: Optional, maximum 2000 characters
- `boardId`: Required ObjectId
- `columnId`: Required ObjectId
- `priority`: Optional enum ['low', 'medium', 'high', 'critical'], default: 'medium'
- `assignees`: Optional array of ObjectIds
- `labels`: Optional array
- `estimatedHours`: Optional number, minimum 0
- `dueDate`: Optional date
- `startDate`: Optional date
- `position`: Optional number, minimum 0

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "assignees": ["user_id_1"],
  "labels": ["frontend"],
  "estimatedHours": 6,
  "actualHours": 4,
  "dueDate": "2024-01-25T23:59:59.000Z"
}
```

**Validation Schema:**
- `title`: Optional, 2-200 characters
- `description`: Optional, maximum 2000 characters
- `priority`: Optional enum ['low', 'medium', 'high', 'critical']
- `status`: Optional enum ['todo', 'in_progress', 'review', 'done', 'archived']
- `assignees`: Optional array of ObjectIds
- `labels`: Optional array
- `estimatedHours`: Optional number, minimum 0
- `actualHours`: Optional number, minimum 0
- `dueDate`: Optional date
- `startDate`: Optional date

#### Move Task
```http
PATCH /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "columnId": "new_column_id",
  "position": 2
}
```

**Validation Schema:**
- `columnId`: Required ObjectId
- `position`: Required number, minimum 0

#### Add Comment
```http
POST /api/tasks/:id/comments
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "content": "This is a comment",
  "mentions": ["user_id_1", "user_id_2"],
  "parentCommentId": "parent_comment_id",
  "attachments": [file1]
}
```

**Validation Schema:**
- `content`: Required, 1-2000 characters
- `mentions`: Optional array of ObjectIds
- `parentCommentId`: Optional ObjectId

#### Update Comment
```http
PUT /api/tasks/comments/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

**Validation Schema:**
- `content`: Required, 1-2000 characters

#### Add Reaction
```http
POST /api/tasks/comments/:commentId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

**Validation Schema:**
- `emoji`: Required string, maximum 10 characters

#### Add Watcher
```http
POST /api/tasks/:id/watchers
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

**Validation Schema:**
- `userId`: Required ObjectId

#### Bulk Update Tasks
```http
PATCH /api/tasks/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskIds": ["task_id_1", "task_id_2", "task_id_3"],
  "updates": {
    "priority": "high",
    "status": "in_progress"
  }
}
```

**Validation Schema:**
- `taskIds`: Required array of ObjectIds, minimum 1 item
- `updates`: Required object

### File Router (`/api/files`)

#### Upload Avatar
```http
POST /api/files/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar": [file]
}
```

**File Requirements:**
- Type: Image (jpg, jpeg, png, gif)
- Size: Maximum 5MB
- Format: multipart/form-data

#### Upload Task Attachments
```http
POST /api/files/upload/task-attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "attachments": [file1, file2, file3]
}
```

**File Requirements:**
- Type: Any file type
- Size: Maximum 10MB per file
- Format: multipart/form-data

#### Upload Comment Attachment
```http
POST /api/files/upload/comment-attachment
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "attachment": [file]
}
```

**File Requirements:**
- Type: Any file type
- Size: Maximum 5MB per file
- Format: multipart/form-data

#### Upload Logo
```http
POST /api/files/upload/logo
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "logo": [file]
}
```

**File Requirements:**
- Type: Image (jpg, jpeg, png, gif)
- Size: Maximum 2MB
- Format: multipart/form-data
- Permission: Admin only

#### Upload Board Background
```http
POST /api/files/upload/board-background
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "background": [file]
}
```

**File Requirements:**
- Type: Image (jpg, jpeg, png, gif)
- Size: Maximum 5MB
- Format: multipart/form-data

#### Upload General Files
```http
POST /api/files/upload/general
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "files": [file1, file2]
}
```

**File Requirements:**
- Type: Any file type
- Size: Maximum 10MB per file
- Format: multipart/form-data

### Notification Router (`/api/notifications`)

#### Create Notification (Admin Only)
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "System Update",
  "message": "System will be down for maintenance",
  "type": "project_update",
  "recipientId": "user_id",
  "relatedEntity": {
    "entityType": "Project",
    "entityId": "project_id"
  },
  "priority": "high",
  "deliveryMethods": {
    "email": true,
    "push": true
  }
}
```

**Validation Schema:**
- `title`: Required, 1-200 characters
- `message`: Required, 1-500 characters
- `type`: Required enum ['task_assigned', 'task_completed', 'comment_added', 'due_date_reminder', 'project_update', 'mention']
- `recipientId`: Required ObjectId
- `relatedEntity.entityType`: Optional enum ['Task', 'Project', 'Comment', 'Board']
- `relatedEntity.entityId`: Optional ObjectId
- `priority`: Optional enum ['low', 'medium', 'high']
- `deliveryMethods`: Optional object

#### Update Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "email": {
      "task_assigned": true,
      "task_completed": false,
      "comment_added": true
    },
    "push": {
      "task_assigned": true,
      "due_date_reminder": true
    }
  }
}
```

**Validation Schema:**
- `preferences`: Required object

#### Bulk Mark as Read
```http
PATCH /api/notifications/bulk-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationIds": ["notification_id_1", "notification_id_2"]
}
```

**Validation Schema:**
- `notificationIds`: Required array of ObjectIds

### Checklist Router (`/api/checklists`)

#### Create Checklist
```http
POST /api/checklists/task/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Development Checklist",
  "items": [
    {
      "text": "Write unit tests",
      "completed": false
    },
    {
      "text": "Code review",
      "completed": false
    }
  ]
}
```

**Validation Schema:**
- `title`: Required, 1-100 characters
- `items`: Required array of objects

#### Update Checklist
```http
PUT /api/checklists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Checklist Title",
  "hideCompletedItems": true
}
```

**Validation Schema:**
- `title`: Optional, 1-100 characters
- `hideCompletedItems`: Optional boolean

#### Add Item
```http
POST /api/checklists/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "New checklist item",
  "position": 3
}
```

**Validation Schema:**
- `text`: Required, 1-200 characters
- `position`: Optional number, minimum 0

#### Update Item
```http
PUT /api/checklists/:id/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated item text",
  "completed": true
}
```

**Validation Schema:**
- `text`: Optional, 1-200 characters
- `completed`: Optional boolean

#### Reorder Items
```http
PATCH /api/checklists/:id/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemOrder": [
    { "itemId": "item_1", "position": 0 },
    { "itemId": "item_2", "position": 1 }
  ]
}
```

**Validation Schema:**
- `itemOrder`: Required array

### Reminder Router (`/api/reminders`)

#### Create Reminder
```http
POST /api/reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Deadline Reminder",
  "description": "Don't forget to complete the task",
  "reminderDate": "2024-01-20T10:00:00.000Z",
  "type": "both",
  "taskId": "task_id",
  "spaceId": "space_id",
  "recurring": {
    "enabled": true,
    "pattern": "daily",
    "interval": 1,
    "endDate": "2024-02-20T10:00:00.000Z"
  }
}
```

**Validation Schema:**
- `title`: Required, 1-200 characters
- `description`: Optional, maximum 500 characters
- `reminderDate`: Required date
- `type`: Optional enum ['email', 'push', 'both'], default: 'both'
- `taskId`: Optional ObjectId
- `spaceId`: Optional ObjectId
- `recurring.enabled`: Optional boolean
- `recurring.pattern`: Optional enum ['daily', 'weekly', 'monthly', 'yearly']
- `recurring.interval`: Optional number, minimum 1
- `recurring.endDate`: Optional date

#### Update Reminder
```http
PUT /api/reminders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Reminder Title",
  "reminderDate": "2024-01-21T10:00:00.000Z",
  "recurring": {
    "enabled": false
  }
}
```

**Validation Schema:**
- Same fields as create, all optional

#### Snooze Reminder
```http
PATCH /api/reminders/:id/snooze
Authorization: Bearer <token>
Content-Type: application/json

{
  "minutes": 30
}
```

**Validation Schema:**
- `minutes`: Optional number, 1-43200 (max 30 days)

### Analytics Router (`/api/analytics`)

#### Generate Space Analytics
```http
POST /api/analytics/space/:spaceId/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "periodType": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z",
  "includeAI": true
}
```

**Validation Schema:**
- `periodType`: Optional enum ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
- `startDate`: Optional date
- `endDate`: Optional date
- `includeAI`: Optional boolean

### Tag Router (`/api/tags`)

#### Create Tag
```http
POST /api/tags/space/:spaceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Frontend",
  "color": "#3B82F6",
  "description": "Frontend development tasks"
}
```

**Validation Schema:**
- `name`: Required, 1-50 characters
- `color`: Required, hex color pattern (#RRGGBB)
- `description`: Optional, maximum 200 characters

#### Update Tag
```http
PUT /api/tags/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Frontend Dev",
  "color": "#10B981",
  "description": "Updated description"
}
```

**Validation Schema:**
- `name`: Optional, 1-50 characters
- `color`: Optional, hex color pattern (#RRGGBB)
- `description`: Optional, maximum 200 characters

#### Merge Tags
```http
POST /api/tags/merge
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceTagId": "source_tag_id",
  "targetTagId": "target_tag_id"
}
```

**Validation Schema:**
- `sourceTagId`: Required ObjectId
- `targetTagId`: Required ObjectId

#### Bulk Create Tags
```http
POST /api/tags/bulk-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "spaceId": "space_id",
  "tags": [
    {
      "name": "Bug",
      "color": "#EF4444"
    },
    {
      "name": "Feature",
      "color": "#10B981"
    }
  ]
}
```

**Validation Schema:**
- `spaceId`: Required ObjectId
- `tags`: Required array of tag objects

### Invitation Router (`/api/invitations`)

#### Create Invitation
```http
POST /api/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "New User",
  "targetEntity": {
    "type": "Space",
    "id": "space_id"
  },
  "role": "member",
  "message": "Welcome to our team!"
}
```

**Validation Schema:**
- `email`: Required, valid email format
- `name`: Optional, maximum 100 characters
- `targetEntity.type`: Required enum ['Workspace', 'Space']
- `targetEntity.id`: Required ObjectId
- `role`: Optional enum ['viewer', 'member', 'contributor', 'admin'], default: 'member'
- `message`: Optional, maximum 500 characters

#### Bulk Invite
```http
POST /api/invitations/bulk-invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": ["user1@example.com", "user2@example.com"],
  "entityType": "space",
  "entityId": "space_id",
  "role": "member",
  "message": "Welcome to our space!"
}
```

**Validation Schema:**
- `emails`: Required array of emails, 1-50 items
- `entityType`: Required enum ['workspace', 'space']
- `entityId`: Required ObjectId
- `role`: Optional enum ['viewer', 'member', 'contributor', 'admin'], default: 'member'
- `message`: Optional, maximum 500 characters

#### Extend Invitation
```http
PATCH /api/invitations/:id/extend
Authorization: Bearer <token>
Content-Type: application/json

{
  "days": 7
}
```

**Validation Schema:**
- `days`: Optional number, 1-30

### AI Router (`/api/ai`)

#### Generate Task Suggestions
```http
POST /api/ai/suggestions
Authorization: Bearer <token>
Content-Type: application/json

{
  "spaceGoal": "Build a task management application",
  "spaceContext": "Team of 5 developers working on a React app",
  "boardType": "kanban"
}
```

**Validation Schema:**
- `spaceGoal`: Required, 10-1000 characters
- `spaceContext`: Optional, maximum 2000 characters
- `boardType`: Optional enum ['kanban', 'list', 'calendar', 'timeline'], default: 'kanban'

#### Parse Natural Language
```http
POST /api/ai/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": "Create a high priority task for user authentication due next Friday",
  "boardId": "board_id"
}
```

**Validation Schema:**
- `input`: Required, 3-500 characters
- `boardId`: Required ObjectId

#### Generate Space Timeline
```http
POST /api/ai/timeline/:spaceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00.000Z",
  "targetEndDate": "2024-03-31T23:59:59.000Z",
  "priorities": ["high", "medium"]
}
```

**Validation Schema:**
- `startDate`: Optional date
- `targetEndDate`: Optional date
- `priorities`: Optional array

#### Generate Task Description
```http
POST /api/ai/description
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement User Authentication",
  "spaceContext": "Building a React application with user management",
  "taskType": "development"
}
```

**Validation Schema:**
- `title`: Required, 2-200 characters
- `spaceContext`: Optional, maximum 500 characters
- `taskType`: Optional, maximum 100 characters
