# TaskFlow Mobile Configuration

This directory contains the configuration files for the TaskFlow mobile app built with React Native and Expo.

## 📁 File Structure

```
config/
├── env.ts          # Environment configuration
├── axios.ts        # HTTP client configuration
├── routes.ts       # Navigation routes configuration
├── index.ts        # Main exports
└── README.md       # This file
```

## 🔧 Environment Configuration (`env.ts`)

The environment configuration uses Expo's environment variable system with `EXPO_PUBLIC_` prefix for client-side variables.

### Key Features

- **Type-safe environment variables** with TypeScript
- **Fallback values** for development
- **Environment-specific API URLs** (dev/staging/prod)
- **Feature flags** for enabling/disabling features
- **Validation** on app startup in development

### Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the client-side code.

#### API Configuration
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

#### OAuth Configuration
```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

#### Feature Flags
```bash
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_DEBUG=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

### Usage

```typescript
import { env, getApiUrl, isFeatureEnabled } from '@/config/env';

// Access environment variables
const apiUrl = env.API_BASE_URL;

// Get environment-specific API URL
const currentApiUrl = getApiUrl('/users');

// Check if feature is enabled
if (isFeatureEnabled('ENABLE_ANALYTICS')) {
  // Initialize analytics
}
```

## 🌐 HTTP Client Configuration (`axios.ts`)

Configured Axios instance with React Native specific features:

### Features

- **AsyncStorage integration** for token management
- **Platform-specific headers** (iOS/Android)
- **Automatic token refresh**
- **Error handling** with proper cleanup
- **Debug logging** in development

### Usage

```typescript
import { 
  axiosInstance, 
  setAuthToken, 
  clearAuthToken, 
  isAuthenticated 
} from '@/config/axios';

// Make API calls
const response = await axiosInstance.get('/users');

// Manage authentication
await setAuthToken('your-jwt-token');
const isAuth = await isAuthenticated();
```

## 🧭 Navigation Configuration (`routes.ts`)

Route configuration for Expo Router with role-based access control.

### Features

- **Role-based route protection**
- **Screen options** for navigation
- **Modal and card presentations**
- **Animation configurations**

### Route Structure

```typescript
export const ROUTES = {
  LANDING: { 
    path: '/(tabs)', 
    isPublic: true,
    screenOptions: { headerShown: false }
  },
  WORKSPACE: { 
    path: '/workspace', 
    requiredRole: 'member',
    screenOptions: { headerShown: true }
  },
  // ... more routes
};
```

### Usage

```typescript
import { ROUTES, requiresAuth, getRouteAnimation } from '@/config/routes';

// Check if route requires authentication
const needsAuth = requiresAuth('WORKSPACE');

// Get route animation
const animation = getRouteAnimation('SIGNIN');
```

## 🚀 Setup Instructions

### 1. Environment Variables

Copy the example environment file and configure your values:

```bash
cp env.example .env
```

### 2. Update Configuration

Edit `.env` file with your actual values:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-api.com/api
EXPO_PUBLIC_SOCKET_URL=https://your-api.com

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### 3. App Configuration

Update `app.json` or `app.config.js` with additional configuration:

```json
{
  "expo": {
    "name": "TaskFlow",
    "scheme": "taskflow",
    "extra": {
      "apiBaseUrl": "https://your-api.com/api",
      "enableAnalytics": true,
      "enablePushNotifications": true
    }
  }
}
```

## 🔒 Security Considerations

### Environment Variables

- Only use `EXPO_PUBLIC_` prefix for client-side variables
- Never expose sensitive data (secrets, private keys)
- Use server-side environment variables for sensitive data

### API Security

- Tokens are stored securely in AsyncStorage
- Automatic token refresh on 401 errors
- Proper cleanup on logout

## 🧪 Development

### Debug Mode

In development mode, the app will:

- Show environment validation warnings
- Enable debug logging
- Use development API URLs
- Show detailed error messages

### Testing

```typescript
import { validateEnvironment } from '@/config/env';

// Validate environment configuration
const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('Environment errors:', validation.errors);
}
```

## 📱 Platform-Specific Configuration

The configuration automatically adapts to the platform:

```typescript
import { getPlatformConfig } from '@/config/env';

const config = getPlatformConfig({
  ios: { apiUrl: 'https://ios-api.com' },
  android: { apiUrl: 'https://android-api.com' },
  default: { apiUrl: 'https://default-api.com' }
});
```

## 🔄 Updates and Maintenance

### Adding New Environment Variables

1. Add to `env.ts` with proper typing
2. Add to `env.example` with documentation
3. Update validation if needed
4. Add to feature flags if it's a toggle

### Adding New Routes

1. Add to `routes.ts` with proper configuration
2. Update role hierarchy if needed
3. Add screen options for navigation
4. Test on both platforms

## 📚 Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Axios Documentation](https://axios-http.com/docs/intro)
