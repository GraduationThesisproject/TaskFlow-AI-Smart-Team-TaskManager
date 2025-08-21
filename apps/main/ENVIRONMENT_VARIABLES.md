# Environment Variables

This document describes the environment variables used in the TaskFlow frontend application.

## Overview

The application uses Vite's environment variable system. All environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Required Environment Variables

### API Configuration

- `VITE_API_URL`: The base URL for the API server
  - Default: `http://localhost:3001/api`
  - Example: `VITE_API_URL=https://api.taskflow.com/api`

## Optional Environment Variables

### App Configuration

- `VITE_APP_NAME`: The name of the application
  - Default: `TaskFlow`
  - Example: `VITE_APP_NAME=My Task Manager`

- `VITE_APP_VERSION`: The version of the application
  - Default: `1.0.0`
  - Example: `VITE_APP_VERSION=2.1.0`

### Feature Flags

- `VITE_ENABLE_ANALYTICS`: Enable analytics tracking
  - Default: `false`
  - Values: `true` or `false`
  - Example: `VITE_ENABLE_ANALYTICS=true`

- `VITE_ENABLE_DEBUG`: Enable debug mode
  - Default: `true` (in development)
  - Values: `true` or `false`
  - Example: `VITE_ENABLE_DEBUG=false`

### Build Information

These are typically auto-generated during the build process:

- `VITE_BUILD_TIME`: Timestamp of when the build was created
- `VITE_COMMIT_HASH`: Git commit hash of the current build

## Development Setup

1. Create a `.env` file in the `apps/main` directory
2. Copy the variables you need from the example below
3. Set the values according to your environment

### Example `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=TaskFlow
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## Production Setup

For production deployments:

1. Set `VITE_ENABLE_DEBUG=false`
2. Set `VITE_API_URL` to your production API URL
3. Configure `VITE_ENABLE_ANALYTICS` as needed
4. Ensure all required environment variables are set

## Environment Configuration

The application uses a centralized environment configuration in `src/config/env.ts`:

```typescript
import { env } from '../config/env';

// Access environment variables
const apiUrl = env.API_URL;
const isDebugEnabled = env.ENABLE_DEBUG;
```

## Security Notes

- Only variables prefixed with `VITE_` are included in the client bundle
- Never include sensitive information like API keys in frontend environment variables
- All environment variables are visible to users in the browser

## Troubleshooting

### Common Issues

1. **Environment variables not working**: Ensure they are prefixed with `VITE_`
2. **API calls failing**: Check that `VITE_API_URL` is correctly set
3. **Build errors**: Verify all required environment variables are defined

### Debugging

To debug environment variables:

```typescript
import { env } from '../config/env';
console.log('Environment:', env);
```

This will show all available environment variables in the console.
