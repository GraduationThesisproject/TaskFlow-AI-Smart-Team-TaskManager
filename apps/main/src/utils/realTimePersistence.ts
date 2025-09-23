import { persistor } from '../store';

/**
 * Utility function to handle real-time updates with immediate persistence
 * This ensures that Redux state changes are immediately flushed to localStorage
 * so that page reloads show the latest data
 */
export const handleRealTimeUpdate = async (
  updateFunction: () => void,
  updateType: string
): Promise<void> => {
  try {
    // Execute the update function first
    updateFunction();
    
    // Force Redux Persist to flush changes to localStorage immediately
    await persistor.flush();
    
    console.log(`🔔 ${updateType} update flushed to localStorage`);
  } catch (error) {
    console.error(`❌ Failed to flush ${updateType} update to localStorage:`, error);
  }
};

/**
 * Hook for handling real-time updates with persistence
 * This can be used in components that need to handle real-time updates
 */
export const useRealTimePersistence = () => {
  const handleUpdate = async (
    updateFunction: () => void,
    updateType: string
  ) => {
    await handleRealTimeUpdate(updateFunction, updateType);
  };

  return { handleUpdate };
};
