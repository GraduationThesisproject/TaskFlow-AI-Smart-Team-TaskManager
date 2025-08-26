import { configureStore } from '@reduxjs/toolkit';
import { notificationsSocketMiddleware } from './middleware/notificationsSocketMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';

// Import reducers here
import appReducer from './slices/appSlice.ts';
import taskReducer from './slices/taskSlice.ts';
import boardReducer from './slices/boardSlice.ts';
import columnReducer from './slices/columnSlice.ts';
import spaceReducer from './slices/spaceSlice.ts';
import workspaceReducer from './slices/workspaceSlice.ts';
import authReducer from './slices/authSlice.ts';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import templatesReducer from './slices/templatesSlice.ts';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
    boards: boardReducer,
    columns: columnReducer,
    spaces: spaceReducer,
    workspace: workspaceReducer,
    auth: authReducer,
    activity: activityReducer,
    notifications: notificationReducer,
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
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
    }).concat(notificationsSocketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export selectors
export * from './selectors';
