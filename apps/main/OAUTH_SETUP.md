# OAuth Authentication Setup

This document explains how to configure OAuth authentication for Google and GitHub in the TaskFlow application.

## Required Environment Variables

Add the following environment variables to your `.env` file in the main app directory:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# GitHub OAuth Configuration  
VITE_GITHUB_CLIENT_ID=your_github_client_id_here

# OAuth Client Secret (for token exchange)
VITE_OAUTH_CLIENT_SECRET=your_oauth_client_secret_here
```

## OAuth Provider Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URIs to:
   - `http://localhost:3000/auth/callback/google` (for development)
   - `https://yourdomain.com/auth/callback/google` (for production)
6. Copy the Client ID to `REACT_APP_GOOGLE_CLIENT_ID`

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: TaskFlow
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/auth/callback/github`
4. Copy the Client ID to `REACT_APP_GITHUB_CLIENT_ID`
5. Generate a client secret and add it to `REACT_APP_OAUTH_CLIENT_SECRET`

## Backend Requirements

Your backend must support the following OAuth endpoints:

### POST `/auth/oauth/login`
Handles OAuth login for existing users.

**Request Body:**
```json
{
  "id": "user_oauth_id",
  "provider": "google" | "github",
  "oauthId": "provider_user_id", 
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://avatar-url.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### POST `/auth/oauth/register`
Handles OAuth registration for new users.

**Request Body:** Same as login endpoint

**Response:** Same as login endpoint

## OAuth Flow

1. User clicks Google/GitHub button on SignIn or SignUp page
2. User is redirected to OAuth provider for authentication
3. Provider redirects back to `/auth/callback/:provider` with authorization code
4. OAuthCallback component processes the code and completes authentication
5. User is redirected to dashboard on success

## Security Features

- CSRF protection via random state parameter
- Secure token storage in localStorage
- Backend validation of OAuth tokens
- Automatic session cleanup on errors

## Troubleshooting

### Common Issues

1. **Invalid redirect URI**: Ensure redirect URIs match exactly in OAuth provider settings
2. **CORS errors**: Configure your backend to allow requests from your frontend domain
3. **Token exchange fails**: Verify client secret is correct and backend endpoints are working
4. **User not found**: Ensure backend properly handles both login and registration flows

### Debug Mode

Set `NODE_ENV=development` to see detailed OAuth flow logs in the browser console.
