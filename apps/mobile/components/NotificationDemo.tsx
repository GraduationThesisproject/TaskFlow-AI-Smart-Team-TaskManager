import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRealTimeNotifications } from '../hooks/socket/useRealTimeNotifications';
import { useNotifications } from '../hooks/useNotifications';
import { useSocketContext } from '../contexts/SocketContext';
import { pushNotificationService } from '../services/pushNotificationService';
import { EnvironmentDetector } from '../utils/environmentDetector';
import Constants from 'expo-constants';

interface NotificationDemoProps {
  // Add any props you need
}

export const NotificationDemo: React.FC<NotificationDemoProps> = () => {
  const [testNotifications, setTestNotifications] = useState<any[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);
  
  // Use the real-time notification hook
  const {
    isConnected,
    isConnecting,
    connectionError,
    reconnect,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getRecentNotifications,
  } = useRealTimeNotifications();

  // Use the regular notifications hook for UI state
  const {
    notifications,
    stats,
    loading,
    fetchNotifications,
    clearError,
  } = useNotifications();

  // Get socket context for additional functionality
  const { notificationSocket } = useSocketContext();

  // Check push notification status and environment
  useEffect(() => {
    const checkStatus = async () => {
      const token = pushNotificationService.getExpoPushToken();
      setPushToken(token);
      
      const info = EnvironmentDetector.getEnvironmentInfo();
      setEnvInfo(info);
    };
    checkStatus();
  }, []);

  // Test notification creation
  const createTestNotification = () => {
    if (!notificationSocket?.connected) {
      Alert.alert('Error', 'Socket not connected');
      return;
    }

    const testNotification = {
      title: 'Test Notification',
      message: `Test notification created at ${new Date().toLocaleTimeString()}`,
      type: 'info',
      _id: `test_${Date.now()}`,
    };

    // Emit test notification (this would normally come from the server)
    notificationSocket.emit('notification:test', testNotification);
    
    setTestNotifications(prev => [testNotification, ...prev]);
  };

  // Test marking notification as read
  const testMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    Alert.alert('Success', 'Notification marked as read');
  };

  // Test getting unread count
  const testGetUnreadCount = () => {
    getUnreadCount();
    Alert.alert('Info', 'Requested unread count from server');
  };

  // Test getting recent notifications
  const testGetRecent = () => {
    getRecentNotifications(10);
    Alert.alert('Info', 'Requested recent notifications from server');
  };

  // Test marking all as read
  const testMarkAllAsRead = () => {
    markAllAsRead();
    Alert.alert('Success', 'All notifications marked as read');
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    if (isConnecting) return '#FFA500'; // Orange
    if (isConnected) return '#00FF00'; // Green
    return '#FF0000'; // Red
  };

  const getConnectionStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real-Time Notifications Demo</Text>
        
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusIndicator, 
              { backgroundColor: getConnectionStatusColor() }
            ]} 
          />
          <Text style={styles.statusText}>
            {getConnectionStatusText()}
          </Text>
        </View>

        {/* Push Notification Status */}
        <View style={styles.pushStatusContainer}>
          <Text style={styles.pushStatusTitle}>Push Notifications:</Text>
          <Text style={[
            styles.pushStatusText,
            { color: pushToken ? '#4CAF50' : '#FF9800' }
          ]}>
            {pushToken ? 'Available' : 'Not Available (Expo Go/Missing Project ID)'}
          </Text>
          {!pushToken && (
            <Text style={styles.pushStatusHint}>
              💡 Use a development build for push notifications
            </Text>
          )}
          
          {/* Environment Info */}
          {envInfo && (
            <View style={styles.envInfoContainer}>
              <Text style={styles.envInfoTitle}>Environment Details:</Text>
              <Text style={styles.envInfoText}>App: {envInfo.appName}</Text>
              <Text style={styles.envInfoText}>Ownership: {envInfo.appOwnership}</Text>
              <Text style={styles.envInfoText}>Platform: {envInfo.platform}</Text>
              <Text style={styles.envInfoText}>Dev Mode: {envInfo.isDev ? 'Yes' : 'No'}</Text>
              <Text style={styles.envInfoText}>Has Project ID: {envInfo.hasProjectId ? 'Yes' : 'No'}</Text>
              <Text style={styles.envInfoText}>Expo Go: {envInfo.isExpoGo ? 'Yes' : 'No'}</Text>
            </View>
          )}
        </View>

        {/* Connection Error */}
        {connectionError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {connectionError}</Text>
            <TouchableOpacity style={styles.reconnectButton} onPress={reconnect}>
              <Text style={styles.buttonText}>Reconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Test Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        
        <TouchableOpacity 
          style={[styles.button, !isConnected && styles.buttonDisabled]} 
          onPress={createTestNotification}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Create Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, !isConnected && styles.buttonDisabled]} 
          onPress={testGetUnreadCount}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Get Unread Count</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, !isConnected && styles.buttonDisabled]} 
          onPress={testGetRecent}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Get Recent Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, !isConnected && styles.buttonDisabled]} 
          onPress={testMarkAllAsRead}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Mark All as Read</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>
          Notifications ({notifications.length})
        </Text>
        
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
        
        {notifications.length === 0 && !loading && (
          <Text style={styles.emptyText}>No notifications</Text>
        )}
        
        {notifications.map((notification, index) => (
          <View key={notification._id || index} style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>
                {notification.title || 'No Title'}
              </Text>
              <TouchableOpacity 
                style={styles.markReadButton}
                onPress={() => testMarkAsRead(notification._id)}
              >
                <Text style={styles.markReadText}>Mark Read</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationType}>
              Type: {notification.type || 'info'}
            </Text>
            <Text style={styles.notificationTime}>
              {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown time'}
            </Text>
          </View>
        ))}
      </View>

      {/* Test Notifications */}
      {testNotifications.length > 0 && (
        <View style={styles.testNotificationsContainer}>
          <Text style={styles.sectionTitle}>
            Test Notifications ({testNotifications.length})
          </Text>
          
          {testNotifications.map((notification, index) => (
            <View key={notification._id || index} style={styles.testNotificationItem}>
              <Text style={styles.testNotificationTitle}>
                {notification.title}
              </Text>
              <Text style={styles.testNotificationMessage}>
                {notification.message}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pushStatusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pushStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pushStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  pushStatusHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  envInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  envInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  envInfoText: {
    fontSize: 11,
    color: '#555',
    marginBottom: 2,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
  },
  reconnectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  controlsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  notificationsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  markReadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  markReadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  testNotificationsContainer: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  testNotificationItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  testNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testNotificationMessage: {
    fontSize: 14,
    color: '#666',
  },
});
