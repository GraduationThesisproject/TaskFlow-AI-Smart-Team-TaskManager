import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useNotifications } from '@/hooks/useNotifications';
// import { pushNotificationService } from '@/services/pushNotificationService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function NotificationTest() {
  const colors = useThemeColors();
  const { stats, notifications } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const testToastNotifications = () => {
    Alert.alert(
      'Test Toast Notifications',
      'Choose a notification type to test:',
      [
        {
          text: 'Success',
          onPress: () => {
            // Simulate success notification
            const mockNotification = {
              _id: Date.now().toString(),
              title: 'Success!',
              message: 'This is a test success notification',
              type: 'success',
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            // This would normally come from socket
            console.log('🧪 Testing success notification:', mockNotification);
          },
        },
        {
          text: 'Error',
          onPress: () => {
            // Simulate error notification
            const mockNotification = {
              _id: Date.now().toString(),
              title: 'Error!',
              message: 'This is a test error notification',
              type: 'error',
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            console.log('🧪 Testing error notification:', mockNotification);
          },
        },
        {
          text: 'Warning',
          onPress: () => {
            // Simulate warning notification
            const mockNotification = {
              _id: Date.now().toString(),
              title: 'Warning!',
              message: 'This is a test warning notification',
              type: 'warning',
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            console.log('🧪 Testing warning notification:', mockNotification);
          },
        },
        {
          text: 'Info',
          onPress: () => {
            // Simulate info notification
            const mockNotification = {
              _id: Date.now().toString(),
              title: 'Info',
              message: 'This is a test info notification',
              type: 'info',
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            console.log('🧪 Testing info notification:', mockNotification);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const testPushNotification = async () => {
    setIsLoading(true);
    try {
      // await pushNotificationService.scheduleLocalNotification({
      //   title: 'Test Push Notification',
      //   body: 'This is a test push notification from TaskFlow',
      //   data: {
      //     test: true,
      //     timestamp: Date.now(),
      //   },
      // });
      Alert.alert('Info', 'Push notifications are temporarily disabled for testing');
    } catch (error) {
      Alert.alert('Error', `Failed to schedule push notification: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDelayedNotification = async () => {
    setIsLoading(true);
    try {
      // await pushNotificationService.scheduleDelayedNotification(
      //   {
      //     title: 'Delayed Test Notification',
      //     body: 'This notification was scheduled 5 seconds ago',
      //     data: {
      //       delayed: true,
      //       timestamp: Date.now(),
      //     },
      //   },
      //   5 // 5 seconds delay
      // );
      Alert.alert('Info', 'Delayed notifications are temporarily disabled for testing');
    } catch (error) {
      Alert.alert('Error', `Failed to schedule delayed notification: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    setIsLoading(true);
    try {
      // await pushNotificationService.cancelAllNotifications();
      // await pushNotificationService.clearBadge();
      Alert.alert('Info', 'Notification clearing is temporarily disabled for testing');
    } catch (error) {
      Alert.alert('Error', `Failed to clear notifications: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPushToken = async () => {
    try {
      // const token = pushNotificationService.getExpoPushToken();
      // const storedToken = await pushNotificationService.getStoredToken();
      
      Alert.alert(
        'Push Token',
        'Push notification service is temporarily disabled for testing',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to get push token: ${error}`);
    }
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <FontAwesome name="bell" size={20} color={colors.primary} />
        <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
          Notification Test Panel
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Total Notifications
          </Text>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            {notifications.length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Unread Count
          </Text>
          <Text style={[TextStyles.heading.h2, { color: colors.destructive }]}>
            {stats?.unread || 0}
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={testToastNotifications}
          disabled={isLoading}
        >
          <FontAwesome name="flash" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            Test Toast Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={testPushNotification}
          disabled={isLoading}
        >
          <FontAwesome name="mobile" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            Test Push Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.warning }]}
          onPress={testDelayedNotification}
          disabled={isLoading}
        >
          <FontAwesome name="clock-o" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            Test Delayed Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.destructive }]}
          onPress={clearAllNotifications}
          disabled={isLoading}
        >
          <FontAwesome name="trash" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            Clear All Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.muted }]}
          onPress={getPushToken}
          disabled={isLoading}
        >
          <FontAwesome name="key" size={16} color={colors.foreground} />
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
            Get Push Token
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <FontAwesome name="spinner" size={16} color={colors['muted-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Processing...
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
