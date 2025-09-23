import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { notificationsSocketMiddleware } from './middleware/notificationsSocketMiddleware';
import { columnSocketMiddleware } from './middleware/columnSocketMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';
import { env } from '../config/env';
import { persistEncryptTransform } from './encryptionTransform';
import { PERSIST_VERSION, persistMigrations } from './persistMigrations';

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
  storage,
  version: PERSIST_VERSION,
  migrate: createMigrate(persistMigrations, { debug: process.env.NODE_ENV === 'development' }),
  whitelist: ['auth', 'workspace', 'boards', 'spaces'],
  transforms: [persistEncryptTransform],
  debug: process.env.NODE_ENV === 'development',
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
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
    }).concat(
      // Temporarily disabled socket middleware to prevent conflicts with SocketContext
      // notificationsSocketMiddleware, 
      // columnSocketMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' ? {
    name: 'TaskFlow Store',
    trace: true,
    traceLimit: 25,
    // This helps Redux DevTools properly handle the persist store
    serialize: {
      options: {
        map: true,
      },
    },
    // This ensures DevTools shows the actual application state, not persist internal state
    actionSanitizer: (action: any) => {
      if (action.type && action.type.startsWith('persist/')) {
        return { ...action, type: `[PERSIST] ${action.type}` };
      }
      return action;
    },
    stateSanitizer: (state: any) => {
      // Return the actual application state, not the persist wrapper
      if (state && typeof state === 'object' && 'phase' in state && 'completed' in state && 'shouldFlush' in state) {
        // This is the persist internal state, we need to extract the actual state
        if (state._persist && state._persist.rehydrated) {
          // If rehydrated, return the actual state
          return state;
        } else {
          // If not rehydrated, return a placeholder
          return { 
            _persist: state._persist,
            message: 'Redux Persist is rehydrating...',
            ...state 
          };
        }
      }
      return state;
    },
  } : false,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export selectors individually to avoid type conflicts
export * from './selectors/permissionSelectors';
