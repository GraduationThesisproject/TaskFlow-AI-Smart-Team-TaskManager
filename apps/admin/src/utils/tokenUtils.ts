/**
 * Token Management Utilities
 * Helper functions for managing JWT tokens in localStorage
 */

export const TOKEN_KEY = 'adminToken';

/**
 * Store the admin token in localStorage
 */
export const storeAdminToken = (token: string): boolean => {
  try {
    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }
    
    localStorage.setItem(TOKEN_KEY, token);
    
    // Verify storage
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const success = storedToken === token;
    
    return success;
  } catch (error) {
    return false;
  }
};

/**
 * Retrieve the admin token from localStorage
 */
export const getAdminToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Remove the admin token from localStorage
 */
export const removeAdminToken = (): boolean => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if admin token exists and is valid
 */
export const hasValidAdminToken = (): boolean => {
  const token = getAdminToken();
  return !!token;
};

/**
 * Get token information (for debugging)
 */
export const getTokenInfo = () => {
  const token = getAdminToken();
  
  if (!token) {
    return { exists: false, length: 0, preview: null };
  }
  
  return {
    exists: true,
    length: token.length,
    preview: token.substring(0, 20) + '...',
    fullToken: token
  };
};
