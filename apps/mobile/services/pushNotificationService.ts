import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { EnvironmentDetector } from '../utils/environmentDetector';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  async initialize(): Promise<string | null> {
    try {
      console.log('🔔 Initializing push notifications...');

      // Use environment detector to prevent any push notification calls in Expo Go
      if (!EnvironmentDetector.supportsPushNotifications()) {
        const envInfo = EnvironmentDetector.getEnvironmentInfo();
        console.log('⚠️ Environment Info:', envInfo);
        console.log('⚠️', EnvironmentDetector.getEnvironmentMessage());
        console.log('💡 Real-time socket notifications will still work perfectly');
        console.log('💡 Use "eas build --profile development" for push notification testing');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission denied');
        return null;
      }

      // Get the push token with project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId: projectId! });

      this.expoPushToken = token.data;
      console.log('✅ Push token obtained:', this.expoPushToken);

      // Store token for later use
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      
      // Provide helpful error context
      if (error instanceof Error) {
        if (error.message.includes('projectId')) {
          console.log('💡 Push notifications require a projectId in app.json/app.config.js');
        } else if (error.message.includes('Expo Go')) {
          console.log('💡 Use a development build instead of Expo Go for push notifications');
        } else if (error.message.includes('permission')) {
          console.log('💡 Check notification permissions in device settings');
        }
      }
      
      console.log('💡 Real-time socket notifications will still work perfectly');
      return null;
    }
  }

  private setupNotificationListeners() {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📱 Notification received:', notification);
        // Handle foreground notification
        this.handleForegroundNotification(notification);
      }
    );

    // Handle notification responses (when user taps on notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        // Handle notification tap
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleForegroundNotification(notification: Notifications.Notification) {
    // You can customize how notifications are handled when app is in foreground
    // For example, show a toast or update UI
    console.log('🔔 Foreground notification:', notification.request.content);
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    // Handle what happens when user taps on a notification
    const data = response.notification.request.content.data;
    console.log('👆 Notification response data:', data);

    // Navigate to specific screen based on notification data
    if (data?.screen) {
      // Use your navigation system to navigate to the screen
      console.log('🧭 Navigating to:', data.screen);
    }
  }

  async scheduleLocalNotification(data: PushNotificationData): Promise<string> {
    // Safety check to prevent expo-notifications calls in Expo Go
    if (!EnvironmentDetector.supportsPushNotifications()) {
      console.log('⚠️ Skipping local notification - not supported in current environment');
      console.log('💡 Real-time socket notifications will still work perfectly');
      return 'skipped-expo-go';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: data.sound !== false,
        },
        trigger: null, // Show immediately
      });

      console.log('📅 Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule local notification:', error);
      throw error;
    }
  }

  async scheduleDelayedNotification(
    data: PushNotificationData,
    delaySeconds: number
  ): Promise<string> {
    // Safety check to prevent expo-notifications calls in Expo Go
    if (!EnvironmentDetector.supportsPushNotifications()) {
      console.log('⚠️ Skipping delayed notification - not supported in current environment');
      return 'skipped-expo-go';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: data.sound !== false,
        },
        trigger: {
          seconds: delaySeconds,
        } as any,
      });

      console.log('⏰ Delayed notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule delayed notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error);
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All notifications cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error);
      throw error;
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('❌ Failed to get badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('🔢 Badge count set to:', count);
    } catch (error) {
      console.error('❌ Failed to set badge count:', error);
      throw error;
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('🧹 Badge cleared');
    } catch (error) {
      console.error('❌ Failed to clear badge:', error);
      throw error;
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
      console.error('❌ Failed to get stored token:', error);
      return null;
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
