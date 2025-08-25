# TaskFlow Admin Panel

This is the admin panel for TaskFlow, providing administrative controls and system management capabilities.

## Features

- **User Management**: View, create, edit, and manage users
- **Workspace Management**: Monitor and manage workspaces
- **Analytics**: View system analytics and reports
- **System Health**: Monitor system performance and health
- **Template Management**: Manage project and task templates
- **AI Job Management**: Monitor and manage AI processing jobs
- **Quota Management**: Manage user quotas and limits

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or accessible via connection string
- Backend server running on port 5000

### 2. Install Dependencies

```bash
cd apps/admin
npm install
```

### 3. Environment Setup

Create a `.env` file in the admin app directory:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=TaskFlow Admin
```

### 4. Start Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000`

## Admin Account Setup

### Option 1: Create Admin Account Only

```bash
cd apps/backend
npm run admin:create
```

This creates:
- **Email**: `admin@admin.com`
- **Password**: `admin123!`
- **Role**: `super_admin` (full permissions)

### Option 2: Full Database Seeding

```bash
cd apps/backend
npm run seed
```

This creates multiple test accounts including the admin account above.

### Option 3: Test Existing Admin Account

```bash
cd apps/backend
npm run admin:test
```

## Login

1. Navigate to `http://localhost:3000/login`
2. Use the admin credentials:
   - **Email**: `admin@admin.com`
   - **Password**: `admin123!`

## Architecture

### Frontend (React + TypeScript)
- **State Management**: Redux Toolkit
- **UI Components**: Custom component library (@taskflow/ui)
- **Styling**: Tailwind CSS with custom theme system
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with proxy configuration

### Backend Integration
- **API Endpoints**: `/api/admin/*`
- **Authentication**: JWT tokens
- **Authorization**: Role-based access control
- **Proxy**: Vite dev server proxies API calls to backend

### Data Flow
1. User submits login credentials
2. Frontend sends POST request to `/api/admin/auth/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Subsequent requests include token in Authorization header
6. Backend middleware validates token and admin permissions

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Redux store and slices
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
└── layouts/            # Layout components
```

### Key Components

- **LoginPage**: Authentication interface
- **AdminPage**: Main admin dashboard with navigation
- **ProtectedRoute**: Route protection component
- **DashboardLayout**: Common layout for admin pages

### State Management

The admin app uses Redux Toolkit for state management:

- **adminSlice**: Manages authentication and admin data
- **analyticsSlice**: Handles analytics data
- **templatesSlice**: Manages template data
- **userManagementSlice**: Handles user management

### API Integration

All API calls are made through Redux async thunks:

- `loginAdmin`: Authenticates admin user
- `getCurrentAdmin`: Retrieves current admin info
- `logoutAdmin`: Logs out admin user

## Troubleshooting

### Common Issues

1. **Login Fails**
   - Ensure backend server is running on port 5000
   - Check MongoDB connection
   - Verify admin account exists in database

2. **API Calls Fail**
   - Check Vite proxy configuration
   - Verify backend routes are properly configured
   - Check browser console for CORS errors

3. **Admin Account Not Working**
   - Run `npm run admin:test` to verify account setup
   - Check if Admin model was created properly
   - Verify UserRoles entry exists

### Debug Mode

Enable debug logging by setting environment variable:

```env
VITE_DEBUG=true
```

## Security Considerations

- **Development**: Simple password for ease of development
- **Production**: Change default password immediately
- **JWT Tokens**: Tokens expire based on backend configuration
- **Permissions**: Role-based access control enforced on backend
- **HTTPS**: Always use HTTPS in production

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set production environment variables:

```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=TaskFlow Admin
NODE_ENV=production
```

### Static Hosting

The admin app can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test authentication flows thoroughly
5. Update documentation for new features

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify database connectivity and data integrity
