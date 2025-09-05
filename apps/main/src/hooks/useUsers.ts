import { useState, useCallback } from 'react';
import { UserService, type User } from '../services/userService';

export const useUsers = () => {
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await UserService.searchUsers(query);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
        setSearchError(response.message || 'No users found');
      }
    } catch (error: any) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
      setSearchError(error.message || 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchUsers,
    clearSearch,
  };
};
