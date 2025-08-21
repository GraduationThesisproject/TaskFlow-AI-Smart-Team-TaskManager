import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';

// Import reducers here

// import workspaceReducer from './slices/workspaceSlice';
import appReducer from './slices/appSlice.ts';
import taskReducer from './slices/taskSlice.ts';
import workspaceReducer from './slices/workspaceSlice.ts';
import authReducer from './slices/authSlice.ts';
import permissionReducer from './slices/permissionSlice.ts';
import dashboardReducer from './slices/dasboardSlice.ts';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
    workspace: workspaceReducer,
    auth: authReducer,
    permissions: permissionReducer,
    dashboard: dashboardReducer,

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
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export selectors
export * from './selectors';
