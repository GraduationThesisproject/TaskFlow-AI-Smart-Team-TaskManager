import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import boardReducer from './slices/boardSlice';
import appReducer from './slices/appSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  workspaces: workspaceReducer,
  boards: boardReducer,
  ui: appReducer,
});
