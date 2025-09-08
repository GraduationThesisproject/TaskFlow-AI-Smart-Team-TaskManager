import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Environment detection utilities for push notifications
 */
export class EnvironmentDetector {
  /**
   * Check if we're running in Expo Go
   */
  static isExpoGo(): boolean {
    // Method 1: Check app name
    const appName = Constants.appName?.toLowerCase();
    if (appName === 'expo go' || appName === 'expo-go') {
      return true;
    }

    // Method 2: Check if we're in development without EAS project ID
    if (__DEV__ && !Constants.expoConfig?.extra?.eas?.projectId) {
      return true;
    }

    // Method 3: Check for Expo Go specific constants
    if (Constants.appOwnership === 'expo') {
      return true;
    }

    return false;
  }

  /**
   * Check if push notifications are supported in current environment
   */
  static supportsPushNotifications(): boolean {
    return !this.isExpoGo() && !!Constants.expoConfig?.extra?.eas?.projectId;
  }

  /**
   * Get environment info for debugging
   */
  static getEnvironmentInfo() {
    return {
      isExpoGo: this.isExpoGo(),
      supportsPushNotifications: this.supportsPushNotifications(),
      appName: Constants.appName,
      appOwnership: Constants.appOwnership,
      hasProjectId: !!Constants.expoConfig?.extra?.eas?.projectId,
      isDev: __DEV__,
      platform: Platform.OS,
    };
  }

  /**
   * Get helpful message about current environment
   */
  static getEnvironmentMessage(): string {
    if (this.isExpoGo()) {
      return 'Running in Expo Go - push notifications not supported. Use development build for testing.';
    }
    
    if (!Constants.expoConfig?.extra?.eas?.projectId) {
      return 'No EAS projectId found - add to app.json/app.config.js for push notifications.';
    }
    
    return 'Environment supports push notifications.';
  }
}
