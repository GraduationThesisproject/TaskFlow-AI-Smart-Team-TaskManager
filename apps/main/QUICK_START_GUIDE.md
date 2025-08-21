# Quick Start Guide - API Integration Testing

## 🚀 Getting Started

### 1. Start the Backend
Make sure your backend is running on port 3001:
```bash
cd apps/backend
npm start
```

### 2. Start the Frontend
In a new terminal:
```bash
cd apps/main
npm run dev
```

### 3. Test the API Integration

1. **Navigate to the API Test Page**
   - Go to `http://localhost:5173/api-test`
   - Or click the "🔌 API Test" button in the header

2. **Get a Valid Token**
   - Click "🔑 Get Valid Token" to authenticate with test credentials
   - This will try to log in with seeded user data from your backend

3. **Run All Tests**
   - Click "🧪 Run All Tests" to test all API endpoints
   - Review the results to see which services are working

## 🔧 Troubleshooting

### If you get 401 Unauthorized errors:

1. **Check if backend is running** on port 3001
2. **Verify seeded data exists** in your database
3. **Update test credentials** in `src/utils/tokenHelper.ts` if needed

### Common Test Credentials:
```javascript
// Update these in src/utils/tokenHelper.ts based on your seeded data
const testCredentials = [
  { email: 'admin@taskflow.com', password: 'password123' },
  { email: 'user@taskflow.com', password: 'password123' },
  { email: 'test@taskflow.com', password: 'password123' },
];
```

### If you need to seed data:
```bash
cd apps/backend
npm run seed
```

## 📊 What's Being Tested

The API test page checks:
- ✅ **Connection** - Basic connectivity to backend
- ✅ **Authentication** - Token validation and login
- ✅ **Workspaces** - CRUD operations
- ✅ **Spaces** - Space management within workspaces
- ✅ **Boards** - Board management within spaces
- ✅ **Tasks** - Task management and filtering
- ✅ **Users** - User management

## 🎯 Next Steps

Once the API tests pass:
1. **Test real features** - Navigate to other pages
2. **Create/Edit data** - Try CRUD operations
3. **Test real-time features** - Socket.IO connections
4. **Implement proper auth** - Replace test token with real login

## 🔍 Debug Information

- Check browser console for detailed error messages
- API requests are logged in development mode
- Token status is displayed on the test page
- All responses show full data for debugging

## 📝 Notes

- The test token in `src/config/env.ts` is for development only
- Remove the test token before production
- All API services use proper error handling
- TypeScript interfaces ensure type safety
