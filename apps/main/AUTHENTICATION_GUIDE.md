# 🔐 Authentication Setup Guide

## ✅ **What We Fixed:**

1. **Fixed API Endpoints**:
   - Changed `/auth/profile` → `/auth/me` 
   - Fixed health check to use `/health` (not `/api/health`)

2. **Updated Test Credentials**:
   - Email: `admin.test@gmail.com`
   - Password: `12345678A!`

3. **Removed Invalid Token**:
   - Removed static test token from axios
   - Token will be obtained dynamically through login

## 🚀 **How to Test:**

### Step 1: Ensure Backend is Running
```bash
cd apps/backend
npm start
```
Make sure you see: `Server running on port 3001`

### Step 2: Ensure Database is Seeded
```bash
cd apps/backend
npm run seed
```

### Step 3: Test in Frontend
1. Go to `http://localhost:5173/api-test`
2. Click "🔑 Get Valid Token" 
3. It should now successfully authenticate with `admin.test@gmail.com`
4. Click "🧪 Run All Tests" to test all endpoints

## 📋 **Available Test Users:**

Based on your seeded data:
- **Super Admin**: `superadmin.test@gmail.com` / `12345678A!`
- **Admin**: `admin.test@gmail.com` / `12345678A!`
- **User**: `user.test@gmail.com` / `12345678A!`
- **Manager**: `manager.test@gmail.com` / `12345678A!`

## 🔧 **If It Still Doesn't Work:**

### Check Backend Console
Look for errors in your backend terminal when the login request comes in.

### Check Frontend Console
The browser console will show:
- API requests being made
- Authentication success/failure
- Detailed error messages

### Verify Database
Run this to see all test users:
```bash
cd apps/backend
node src/scripts/show-test-users.js
```

## 🎯 **Expected Results:**

After clicking "Get Valid Token":
- ✅ Connection Test should pass
- ✅ Token should be obtained successfully  
- ✅ All API tests should pass (workspaces, spaces, boards, tasks)

The token status should show "✅ Valid" and all subsequent API calls should work.

## 🔍 **Debugging Tips:**

1. **401 Unauthorized**: Check if backend is running and credentials are correct
2. **404 Not Found**: Check if you're hitting the right endpoints
3. **CORS Errors**: Make sure backend CORS is configured for `http://localhost:5173`
4. **Network Errors**: Check if backend is running on port 3001

## 📝 **Next Steps:**

Once authentication works:
1. Test creating/editing tasks
2. Test real-time Socket.IO features  
3. Implement proper login UI
4. Replace test credentials with real authentication
