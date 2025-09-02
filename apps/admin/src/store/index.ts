import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers here
import adminReducer from './slices/adminSlice';
import userManagementReducer from './slices/userManagementSlice';
import analyticsReducer from './slices/analyticsSlice';
import templatesReducer from './slices/templatesSlice';
import boardTemplateReducer from './slices/boardTemplateSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    userManagement: userManagementReducer,
    analytics: analyticsReducer,
    templates: templatesReducer,
    boardTemplates: boardTemplateReducer,
    notifications: notificationReducer,
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
