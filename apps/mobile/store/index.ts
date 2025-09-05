import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';
import { env } from '../config/env';

// Conditionally import socket middleware only when not in mock mode
let notificationsSocketMiddleware: any = null;
if (!(env.IS_DEV && env.ENABLE_API_MOCKING)) {
  console.log('🔧 [store] Loading socket middleware - not in mock mode');
  const middlewareModule = require('./middleware/notificationsSocketMiddleware');
  notificationsSocketMiddleware = middlewareModule.notificationsSocketMiddleware;
} else {
  console.log('🔧 [store] Skipping socket middleware import - using mock authentication');
}

// Import reducers here
import appReducer from './slices/appSlice.ts';
import taskReducer from './slices/taskSlice.ts';
import workspaceReducer from './slices/workspaceSlice.ts';
import spaceReducer from './slices/spaceSlice.ts';
import boardReducer from './slices/boardSlice.ts';
import columnReducer from './slices/columnSlice.ts';
import authReducer from './slices/authSlice.ts';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import templatesReducer from './slices/templatesSlice.ts';
import analyticsReducer from './slices/analyticsSlice.ts';
import testReducer from './slices/testSlice.ts';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
    workspace: workspaceReducer,
    spaces: spaceReducer,
    boards: boardReducer,
    columns: columnReducer,
    auth: authReducer,
    activity: activityReducer,
    notifications: notificationReducer,
    templates: templatesReducer,
    analytics: analyticsReducer,
    test: testReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types that might contain non-serializable data
        ignoredActions: [
          'persist/PERSIST',
          'auth/setCredentials',
          'auth/updateUser',
          'auth/loginUser/fulfilled'
        ],
        // Ignore specific paths in the state that might contain non-serializable data
        ignoredPaths: [
          'auth.user.lastLogin',
          'auth.user.createdAt', 
          'auth.user.updatedAt'
        ],
        // Warn about non-serializable values in development
        warnAfter: 128,
      },
    });

    // Only add socket middleware if not in mock mode
    console.log('🔧 [store] Configuring middleware...');
    console.log('🔧 [store] env.IS_DEV:', env.IS_DEV);
    console.log('🔧 [store] env.ENABLE_API_MOCKING:', env.ENABLE_API_MOCKING);
    console.log('🔧 [store] Should skip socket middleware:', env.IS_DEV && env.ENABLE_API_MOCKING);
    console.log('🔧 [store] Socket middleware available:', !!notificationsSocketMiddleware);
    
    if (notificationsSocketMiddleware) {
      console.log('🔧 [store] Adding socket middleware - not in mock mode');
      return middleware.concat(notificationsSocketMiddleware);
    } else {
      console.log('🔧 [store] Socket middleware not available - using mock authentication');
      return middleware;
    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export selectors
export * from './selectors';
