// Export all utility functions
export * from './apiClient';
export * from './userUtils';

// Date utilities for Redux serialization
export const toISODateString = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return undefined;
};

export const fromISODateString = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
};

// Device management utilities for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `mobile-${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `mobile-${Platform.OS}-${Date.now()}-fallback`;
  }
};

export const getDeviceInfo = () => {
  const { width, height } = Dimensions.get('window');
  return {
    type: 'mobile',
    platform: Platform.OS,
    version: Platform.Version,
    screenSize: `${width}x${height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
