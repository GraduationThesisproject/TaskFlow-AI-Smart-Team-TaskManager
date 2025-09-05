import { store, persistor } from '../store';
import { logout } from '../store/slices/authSlice';

export const logoutHelper = () => {
  // Dispatch logout action to clear Redux state
  store.dispatch(logout());
  
  // Purge persisted state from Redux persist
  persistor.purge();
  
  // Clear all localStorage items related to the app
  if (typeof window !== 'undefined') {
    // Clear Redux persist storage
    localStorage.removeItem('persist:root');
    
    // Clear authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    
    // Clear device ID
    localStorage.removeItem('deviceId');
    
    // Clear language and text direction preferences
    localStorage.removeItem('taskflow-language');
    localStorage.removeItem('text-direction');
    
    // Clear theme preferences (optional - you might want to keep these)
    // localStorage.removeItem('theme');
    // localStorage.removeItem('taskflow-user-primary-color');
    
    // Clear any other app-specific storage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('persist:') ||
        key.includes('taskflow') ||
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('workspace') ||
        key.includes('board') ||
        key.includes('space') ||
        key.includes('language') ||
        key.includes('direction') ||
        key.includes('test-') // Remove test keys
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  // Redirect to landing page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};
