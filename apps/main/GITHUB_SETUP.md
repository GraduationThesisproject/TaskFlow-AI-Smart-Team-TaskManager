# GitHub Integration Setup Guide

## Frontend Configuration

### Environment Variables
Create a `.env` file in the `apps/main` directory with the following variables:

```bash
# GitHub OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Other Configuration
VITE_APP_NAME=TaskFlow-AI
VITE_APP_VERSION=1.0.0
```

### GitHub OAuth App Setup

1. **Go to GitHub Developer Settings**
   - Navigate to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"

2. **Configure OAuth App**
   - **Application name**: `TaskFlow-AI` (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
   - **Application description**: `TaskFlow-AI GitHub Integration`

3. **Register Application**
   - Click "Register application"
   - Copy the **Client ID** and **Client Secret**

4. **Update Environment Variables**
   - Replace `your_github_client_id_here` with your actual Client ID
   - The Client Secret is only needed on the backend

### Required Scopes
The GitHub OAuth app will request the following scopes:
- `user:email` - Access to user's email address
- `read:org` - Access to user's organizations
- `repo` - Access to public and private repositories

## Features Implemented

### 1. GitHub Account Linking
- Users can connect their GitHub account via OAuth
- Secure token storage with encryption
- Automatic scope validation

### 2. Workspace Organization Linking
- Link workspaces to GitHub organizations
- Dropdown selection of available organizations
- Visual feedback for linked organizations

### 3. Real-time Status
- Check GitHub account connection status
- Validate token permissions
- Sync GitHub data on demand

### 4. Error Handling
- Comprehensive error messages
- Graceful fallbacks for missing permissions
- User-friendly alerts and notifications

## Usage

### Connecting GitHub Account
1. Navigate to Workspace Settings
2. Click "Connect GitHub" button
3. Authorize TaskFlow-AI on GitHub
4. Grant required permissions

### Linking Workspace to Organization
1. Ensure GitHub account is connected
2. Select organization from dropdown
3. Click "Link Workspace to [Organization]"
4. Workspace is now linked to GitHub organization

### Managing Connections
- **Refresh**: Update organization list and permissions
- **Unlink Account**: Remove GitHub connection entirely
- **Unlink Workspace**: Remove workspace-organization link

## Security Features

- **Token Encryption**: GitHub access tokens are encrypted before storage
- **Scope Validation**: Ensures required permissions are granted
- **Secure API Calls**: All requests use proper authentication headers
- **Permission Checks**: Validates user access to organizations/repositories

## Troubleshooting

### Common Issues

1. **"GitHub not connected"**
   - Check if GitHub OAuth app is properly configured
   - Verify environment variables are set correctly
   - Ensure backend GitHub routes are accessible

2. **"Insufficient permissions"**
   - User needs to re-authenticate with required scopes
   - Check if `read:org` and `repo` scopes are granted
   - Verify GitHub OAuth app configuration

3. **"Failed to fetch organizations"**
   - Check GitHub API rate limits
   - Verify token is valid and not expired
   - Ensure user has access to organizations

### Debug Steps

1. **Check Browser Console**
   - Look for API error messages
   - Verify network requests are successful

2. **Verify Backend Status**
   - Check if GitHub routes are working
   - Verify environment variables on backend

3. **Test GitHub OAuth Flow**
   - Try connecting GitHub account manually
   - Check callback URL handling

## Development Notes

### API Endpoints Used
- `GET /api/github/status` - Check GitHub connection status
- `GET /api/github/orgs` - Fetch user's organizations
- `POST /api/github/sync` - Sync GitHub data
- `DELETE /api/github/unlink` - Unlink GitHub account
- `PUT /api/workspaces/:id` - Update workspace with GitHub org

### State Management
- Uses custom `useGitHub` hook for centralized state
- Automatic data fetching on component mount
- Real-time updates for GitHub status changes

### UI Components
- Responsive design with Tailwind CSS
- Loading states and error handling
- Consistent with existing design system
