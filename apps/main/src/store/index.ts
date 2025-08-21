import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';

// Import reducers here
import appReducer from './slices/appSlice.ts';
import taskReducer from './slices/taskSlice.ts';
import workspaceReducer from './slices/workspaceSlice.ts';
// import authReducer from './slices/authSlice.ts';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
    workspace: workspaceReducer,
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
