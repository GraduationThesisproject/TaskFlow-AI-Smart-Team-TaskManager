import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook} from 'react-redux';


// Import reducers here
import appReducer from './slices/appSlice';
// import authReducer from './slices/authSlice';
// import taskReducer from './slices/taskSlice';
// import workspaceReducer from './slices/workspaceSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    // auth: authReducer,
    // task: taskReducer,
    // workspace: workspaceReducer,
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
