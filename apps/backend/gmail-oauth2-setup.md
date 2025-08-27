# Gmail OAuth2 Setup Guide (Alternative to App Passwords)

If App Passwords continue to fail, OAuth2 is a more secure and reliable alternative.

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API

## Step 2: Create OAuth2 Credentials
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Desktop application"
4. Download the JSON file

## Step 3: Update .env File
```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

## Step 4: Update Email Service
The email service would need to be modified to use OAuth2 instead of SMTP password.

## Benefits of OAuth2:
- ✅ More secure than App Passwords
- ✅ No need to generate new passwords
- ✅ Better security compliance
- ✅ Works with Google Workspace accounts
