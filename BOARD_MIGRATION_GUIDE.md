# Board Feature Migration Guide

## Overview
This guide contains all the files and dependencies needed to migrate the board functionality from TaskFlow to a new project.

## 1. Mobile App Files (React Native/Expo)

### Core Board Components
- `apps/mobile/app/(tabs)/Board.tsx` - Main board component with drag-and-drop
- `apps/mobile/app/(tabs)/workspace/space/boards.tsx` - Board listing page
- `apps/mobile/app/(tabs)/workspace/space/allboards.tsx` - All boards view
- `apps/mobile/components/common/BoardCard.tsx` - Board card component

### Board Services & Hooks
- `apps/mobile/services/boardService.ts` - Board API service
- `apps/mobile/hooks/useBoards.ts` - Board management hook
- `apps/mobile/hooks/useColumns.ts` - Column management hook
- `apps/mobile/hooks/useTasks.ts` - Task management hook
- `apps/mobile/hooks/useTaskManager.ts` - Task operations hook
- `apps/mobile/hooks/socket/useTaskSocket.ts` - Real-time task updates

### State Management (Redux)
- `apps/mobile/store/slices/boardSlice.ts` - Board state slice
- `apps/mobile/store/slices/columnSlice.ts` - Column state slice
- `apps/mobile/store/slices/taskSlice.ts` - Task state slice

### Type Definitions
- `apps/mobile/types/board.types.ts` - Board TypeScript types
- `apps/mobile/types/boardTemplate.types.ts` - Board template types
- `apps/mobile/types/task.types.ts` - Task types
- `apps/mobile/types/column.types.ts` - Column types

## 2. Backend Files (Node.js/Express)

### Models (MongoDB/Mongoose)
- `apps/backend/src/models/Board.js` - Board schema
- `apps/backend/src/models/BoardTemplate.js` - Board template schema
- `apps/backend/src/models/Task.js` - Task schema
- `apps/backend/src/models/Column.js` - Column schema (if exists)

### Controllers
- `apps/backend/src/controllers/board.controller.js` - Board CRUD operations
- `apps/backend/src/controllers/boardTemplate.controller.js` - Template operations
- `apps/backend/src/controllers/task.controller.js` - Task operations

### Routes
- `apps/backend/src/routes/board.routes.js` - Board API endpoints
- `apps/backend/src/routes/boardTemplate.routes.js` - Template endpoints
- `apps/backend/src/routes/task.routes.js` - Task endpoints

### Services
- `apps/backend/src/services/board.service.js` - Board business logic

### Socket.io
- `apps/backend/src/sockets/board.socket.js` - Real-time board updates

### Validation Schemas
- `apps/backend/src/routes/validator/board.schemas.js` - Board validation

### Middleware (Required for board permissions)
- `apps/backend/src/middlewares/permission.middleware.js` - Board permissions
- `apps/backend/src/middlewares/auth.middleware.js` - Authentication

## 3. Dependencies to Install

### Mobile App (package.json)
```json
{
  "dependencies": {
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x",
    "expo-haptics": "^12.x",
    "@reduxjs/toolkit": "^1.9.x",
    "react-redux": "^8.x",
    "axios": "^1.x",
    "socket.io-client": "^4.x",
    "react-native-vector-icons": "^10.x",
    "lucide-react-native": "^0.x"
  }
}
```

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^7.x",
    "socket.io": "^4.x",
    "jsonwebtoken": "^9.x",
    "joi": "^17.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  }
}
```

## 4. Database Collections
You'll need to create these MongoDB collections:
- `boards` - Board documents
- `boardtemplates` - Board templates
- `tasks` - Task documents
- `columns` - Column documents (or embedded in boards)
- `spaces` - Space/workspace documents
- `users` - User documents

## 5. Environment Variables

### Mobile App (.env)
```
EXPO_PUBLIC_API_URL=http://your-backend-url:3001
EXPO_PUBLIC_SOCKET_URL=http://your-backend-url:3001
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/your-db
JWT_SECRET=your-jwt-secret
PORT=3001
CORS_ORIGIN=http://localhost:8081
```

## 6. API Endpoints to Implement

### Board Endpoints
- `GET /api/boards/space/:id` - Get boards by space
- `GET /api/boards/:id` - Get single board
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Column Endpoints
- `GET /api/boards/:id/columns` - Get columns
- `POST /api/boards/:id/columns` - Add column
- `PUT /api/boards/:id/columns/:columnId` - Update column
- `DELETE /api/boards/:id/columns/:columnId` - Delete column
- `PATCH /api/boards/:id/columns/reorder` - Reorder columns

### Task Endpoints
- `GET /api/tasks/board/:boardId` - Get tasks by board
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/move` - Move task between columns

## 7. Socket Events to Implement

### Client Events (emit)
- `join:board` - Join board room
- `leave:board` - Leave board room
- `task:create` - Create task
- `task:update` - Update task
- `task:move` - Move task
- `column:create` - Create column
- `column:update` - Update column

### Server Events (on)
- `board:updated` - Board updated
- `task:created` - Task created
- `task:updated` - Task updated
- `task:moved` - Task moved
- `column:created` - Column created
- `column:updated` - Column updated

## 8. Key Features to Migrate

1. **Drag and Drop** - Long press to drag tasks between columns
2. **Real-time Updates** - Socket.io for live collaboration
3. **Permissions** - Board member permissions system
4. **Templates** - Board templates for quick setup
5. **Search & Filter** - Task search and filtering
6. **Animations** - Smooth animations using Reanimated
7. **Haptic Feedback** - Touch feedback for interactions

## 9. Migration Steps

1. **Set up new project structure**
   - Create React Native/Expo app for mobile
   - Create Express/Node.js backend
   - Set up MongoDB database

2. **Copy core files**
   - Copy all files listed above to new project
   - Update import paths as needed

3. **Install dependencies**
   - Install all required packages
   - Configure environment variables

4. **Set up database**
   - Create MongoDB schemas
   - Set up indexes for performance

5. **Configure authentication**
   - Implement JWT authentication
   - Set up user sessions

6. **Test functionality**
   - Test board CRUD operations
   - Test drag and drop
   - Test real-time updates

7. **Customize as needed**
   - Modify UI/UX to match new project
   - Add/remove features as required

## Notes

- The board functionality is tightly integrated with spaces/workspaces
- You may need to simplify the permission system for standalone use
- Consider removing workspace-specific features if not needed
- The drag-and-drop implementation uses react-native-gesture-handler v2
- Socket.io is used for real-time collaboration features
