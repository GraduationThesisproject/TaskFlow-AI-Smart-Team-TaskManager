/**
 * Utility functions for handling archive countdown timers
 */

/**
 * Formats the remaining time until permanent deletion
 * @param archiveExpiresAt - ISO string of when the archive expires
 * @param currentTime - Optional current time in milliseconds (defaults to Date.now())
 * @returns Formatted time string (e.g., "2d 5h 30m", "1h 15m 30s", "45s")
 */
export const formatArchiveCountdown = (archiveExpiresAt?: string, currentTime?: number): string => {
  if (!archiveExpiresAt) return '';
  
  const now = currentTime || Date.now();
  const end = new Date(archiveExpiresAt).getTime();
  const diffMs = Math.max(0, end - now);
  
  const sec = Math.floor(diffMs / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

/**
 * Gets the appropriate styling classes for archive countdown based on urgency
 * @param archiveExpiresAt - ISO string of when the archive expires
 * @param currentTime - Optional current time in milliseconds (defaults to Date.now())
 * @returns Object with color and styling information
 */
export const getArchiveCountdownStyle = (archiveExpiresAt?: string, currentTime?: number) => {
  if (!archiveExpiresAt) return { color: '#6b7280', backgroundColor: '#f3f4f6' };
  
  const now = currentTime || Date.now();
  const end = new Date(archiveExpiresAt).getTime();
  const diffMs = Math.max(0, end - now);
  const hours = diffMs / (1000 * 60 * 60);
  
  if (hours <= 1) {
    return {
      color: '#dc2626', // red-600
      backgroundColor: '#fef2f2', // red-50
      borderColor: '#dc2626', // red-600
      urgent: true
    };
  }
  
  if (hours <= 24) {
    return {
      color: '#d97706', // amber-600
      backgroundColor: '#fffbeb', // amber-50
      borderColor: '#d97706', // amber-600
      urgent: false
    };
  }
  
  return {
    color: '#d97706', // amber-600
    backgroundColor: '#fef3c7', // amber-100
    borderColor: '#f59e0b', // amber-500
    urgent: false
  };
};

/**
 * Checks if an archived item is ready for permanent deletion
 * @param archiveExpiresAt - ISO string of when the archive expires
 * @param currentTime - Optional current time in milliseconds (defaults to Date.now())
 * @returns true if the item is ready for permanent deletion
 */
export const isReadyForDeletion = (archiveExpiresAt?: string, currentTime?: number): boolean => {
  if (!archiveExpiresAt) return false;
  
  const now = currentTime || Date.now();
  const end = new Date(archiveExpiresAt).getTime();
  return end <= now;
};

/**
 * Gets a human-readable message for the archive status
 * @param archiveExpiresAt - ISO string of when the archive expires
 * @param currentTime - Optional current time in milliseconds (defaults to Date.now())
 * @returns Status message
 */
export const getArchiveStatusMessage = (archiveExpiresAt?: string, currentTime?: number): string => {
  if (!archiveExpiresAt) return 'Archived';
  
  if (isReadyForDeletion(archiveExpiresAt, currentTime)) {
    return 'Ready for deletion';
  }
  
  return `Deletes in ${formatArchiveCountdown(archiveExpiresAt, currentTime)}`;
};
