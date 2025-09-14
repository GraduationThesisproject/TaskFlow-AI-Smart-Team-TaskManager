# Google OAuth Setup for Expo Go

## The Problem
The "Access blocked: Authorization Error" occurs because Google's OAuth 2.0 requires specific redirect URIs to be configured in the Google Cloud Console.

## Solution: Configure Google Cloud Console

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"

### Step 2: Configure OAuth 2.0 Client
1. Find your OAuth 2.0 Client ID: `823340430443-hmc2puv4ffap7sgo0jc79bm5juivkvvf.apps.googleusercontent.com`
2. Click "Edit" on this client ID
3. In "Authorized redirect URIs", add these URIs:

**For Expo Go Development:**
```
https://auth.expo.io/@your-expo-username/mobile
https://auth.expo.io/@your-expo-username/your-app-slug
```

**For Production (when you build standalone):**
```
taskflow://auth/google/callback
```

### Step 3: Find Your Expo Username and Slug
Run this command in your mobile app directory:
```bash
npx expo whoami
```

Your redirect URI will be: `https://auth.expo.io/@YOUR_USERNAME/mobile`

### Step 4: Alternative - Use Expo Development Build
If you continue having issues with Expo Go, consider using Expo Development Build:

1. Install Expo CLI: `npm install -g @expo/cli`
2. Create development build: `npx expo install expo-dev-client`
3. Build for device: `npx expo run:android` or `npx expo run:ios`

## Updated Configuration

The OAuth hook is now configured to:
- Use automatic redirect URI generation for Expo Go
- Handle token-based authentication
- Provide proper error handling
- Work with your existing backend

## Testing
1. Update your Google Cloud Console with the correct redirect URIs
2. Restart your Expo Go app
3. Try the Google sign-in again

## Troubleshooting
- Ensure your Google Cloud project has the Google+ API enabled
- Verify the client ID matches exactly
- Check that redirect URIs are added without trailing slashes
- Make sure you're using the Web client ID (not Android/iOS)
