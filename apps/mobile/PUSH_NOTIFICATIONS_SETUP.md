# Push Notifications Setup Guide

This guide explains how to properly configure push notifications for the TaskFlow mobile app.

## Current Status

The real-time notification system is working, but push notifications have some limitations in development environments.

## Issues Encountered

### 1. Expo Go Limitation (SDK 53+)
**Error**: `expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53.`

**Solution**: Use a development build instead of Expo Go for testing push notifications.

### 2. Missing Project ID
**Error**: `No "projectId" found. If "projectId" can't be inferred from the manifest (for instance, in bare workflow), you have to pass it in yourself.`

**Solution**: Configure the project ID in your app configuration.

## Configuration Steps

### Step 1: Configure Project ID

Add the project ID to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "TaskFlow",
    "slug": "taskflow",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### Step 2: Set up EAS (Expo Application Services)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Create a project:
```bash
eas project:create
```

### Step 3: Development Build

Instead of using Expo Go, create a development build:

```bash
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

### Step 4: Install Development Build

Install the development build on your device instead of using Expo Go.

## Alternative: Local Notifications Only

If you want to test the notification system without push notifications, the app will automatically fall back to local notifications only. The real-time socket functionality will still work perfectly.

## Testing Push Notifications

### In Development Build

1. Build and install a development build
2. Run the app
3. Check console logs for push token
4. Test notification functionality

### In Production

1. Configure EAS project ID
2. Build production version
3. Deploy to app stores
4. Push notifications will work automatically

## Current Behavior

The app now handles these scenarios gracefully:

- **Expo Go**: Shows warning, disables push notifications, socket still works
- **Missing Project ID**: Shows warning, disables push notifications, socket still works  
- **Development Build**: Push notifications work if properly configured
- **Production Build**: Push notifications work with EAS project ID

## Console Messages

You'll see these helpful messages in the console:

- ✅ `Push notifications initialized with token: [token]` - Success
- ⚠️ `Running in Expo Go - push notifications not supported in SDK 53+` - Expo Go limitation
- ⚠️ `No projectId found - push notifications may not work in development` - Missing config
- 💡 `Real-time notifications will still work via socket` - Fallback working

## Socket vs Push Notifications

- **Socket Notifications**: Work in all environments (Expo Go, development builds, production)
- **Push Notifications**: Only work in development builds and production (not Expo Go)

The real-time notification system uses both:
1. Socket for instant in-app notifications
2. Push notifications for background/closed app notifications

## Next Steps

1. **For Development**: Use development builds instead of Expo Go
2. **For Production**: Configure EAS project ID and build production version
3. **For Testing**: Socket notifications work in all environments

The notification system is fully functional - you just need the right build environment for push notifications!
