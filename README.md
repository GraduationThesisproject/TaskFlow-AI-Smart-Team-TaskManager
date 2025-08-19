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
4. [Authentication & Authorization](#authentication--authorization)
5. [Middleware](#middleware)
6. [Request/Response Interfaces](#requestresponse-interfaces)

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

#### Real-time Updates
- `task:created` - New task created
- `task:updated` - Task updated
- `task:moved` - Task moved to different column
- `comment:added` - New comment added
- `notification:received` - New notification
- `board:updated` - Board configuration changed

#### WebSocket Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join space room
socket.emit('join:space', { spaceId: 'space_id' });

socket.on('task:created', (data) => {
  console.log('New task:', data);
});
```

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
