import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';
import { env } from '../config/env';
import { persistEncryptTransform } from './encryptionTransform';
import { PERSIST_VERSION, persistMigrations } from './persistMigrations';

// Import socket middleware
import { notificationsSocketMiddleware } from './middleware/notificationsSocketMiddleware';

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
import permissionReducer from './slices/permissionSlice.ts';

const rootReducer = combineReducers({
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
  permissions: permissionReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: PERSIST_VERSION,
  migrate: createMigrate(persistMigrations, { debug: false }),
  whitelist: ['auth', 'workspace', 'boards', 'spaces'],
  transforms: persistEncryptTransform ? [persistEncryptTransform] : [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types that might contain non-serializable data
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
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

    // Add socket middleware for real-time notifications
    console.log('🔧 [store] Adding socket middleware for real-time notifications');
    return middleware.concat(notificationsSocketMiddleware);
  },
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export selectors
export * from './selectors';
