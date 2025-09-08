import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';
import { env } from '../config/env';
import { persistEncryptTransform } from './encryptionTransform';
import { PERSIST_VERSION, persistMigrations } from './persistMigrations';

// Temporarily disable socket middleware to prevent connection errors
let notificationsSocketMiddleware: any = null;
console.log('🔧 [store] Socket middleware disabled temporarily to prevent connection errors');

// Import reducers here
import appReducer from './slices/appSlice';
import taskReducer from './slices/taskSlice';
import workspaceReducer from './slices/workspaceSlice';
import spaceReducer from './slices/spaceSlice';
import boardReducer from './slices/boardSlice';
import columnReducer from './slices/columnSlice';
import authReducer from './slices/authSlice';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import templatesReducer from './slices/templatesSlice';
import analyticsReducer from './slices/analyticsSlice';
import permissionReducer from './slices/permissionSlice';

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
