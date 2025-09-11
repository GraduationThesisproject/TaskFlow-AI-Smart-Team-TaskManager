import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useNotifications } from '@/hooks/useNotifications';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface NotificationBellProps {
  size?: number;
  showBadge?: boolean;
  onPress?: () => void;
}

export default function NotificationBell({ 
  size = 24, 
  showBadge = true, 
  onPress 
}: NotificationBellProps) {
  const colors = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    clearError,
    fetchNotifications,
  } = useNotifications();

  const unreadCount = stats?.unread || 0;
  const hasNotifications = notifications.length > 0;

  const handleBellPress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      setIsModalVisible(true);
      // Refresh notifications on open
      fetchNotifications?.();
    }
  }, [onPress, fetchNotifications]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    console.log('🗑️ [NotificationBell] Delete button pressed for notification:', {
      notificationId,
      isValidMongoId: /^[a-f0-9]{24}$/i.test(notificationId),
      notificationIdLength: notificationId?.length,
      notificationIdType: typeof notificationId
    });
    
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('🗑️ [NotificationBell] User confirmed deletion for:', notificationId);
            try {
              await deleteNotification(notificationId);
              console.log('✅ [NotificationBell] Notification deleted successfully:', notificationId);
            } catch (error: any) {
              console.error('❌ [NotificationBell] Failed to delete notification:', {
                notificationId,
                error: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                url: error?.config?.url
              });
              
              let errorMessage = 'Unknown error';
              if (error?.response?.status === 404) {
                errorMessage = 'Notification not found on server';
              } else if (error?.response?.status === 403) {
                errorMessage = 'Permission denied to delete this notification';
              } else if (error?.response?.status === 500) {
                errorMessage = 'Server error occurred';
              } else if (error?.message) {
                errorMessage = error.message;
              }
              
              Alert.alert(
                'Delete Failed',
                `Failed to delete notification: ${errorMessage}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    console.log('🗑️ [NotificationBell] Clear all button pressed');
    
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            console.log('🗑️ [NotificationBell] User confirmed clear all');
            try {
              await clearAllNotifications();
              console.log('✅ [NotificationBell] All notifications cleared successfully');
            } catch (error: any) {
              console.error('❌ [NotificationBell] Failed to clear all notifications:', {
                error: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                url: error?.config?.url
              });
              
              let errorMessage = 'Unknown error';
              if (error?.response?.status === 404) {
                errorMessage = 'No notifications found to clear';
              } else if (error?.response?.status === 403) {
                errorMessage = 'Permission denied to clear notifications';
              } else if (error?.response?.status === 500) {
                errorMessage = 'Server error occurred';
              } else if (error?.message) {
                errorMessage = error.message;
              }
              
              Alert.alert(
                'Clear All Failed',
                `Failed to clear all notifications: ${errorMessage}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [clearAllNotifications]);

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 16, color: colors.foreground };
    switch (type) {
      case 'workspace_invitation':
      case 'space_invitation':
        return <FontAwesome name="user-plus" {...iconProps} color={colors.primary} />;
      case 'invitation_accepted':
      case 'success':
        return <FontAwesome name="check-circle" {...iconProps} color={colors.success} />;
      case 'warning':
        return <FontAwesome name="exclamation-triangle" {...iconProps} color={colors.warning} />;
      case 'error':
        return <FontAwesome name="times-circle" {...iconProps} color={colors.destructive} />;
      default:
        return <FontAwesome name="info-circle" {...iconProps} color={colors.accent} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.bellContainer}
        onPress={handleBellPress}
        activeOpacity={0.7}
      >
        <FontAwesome 
          name="bell" 
          size={size} 
          color={colors.primary} 
        />
        {showBadge && unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
            <Text style={[styles.badgeText, { color: colors['destructive-foreground'] }]}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={[styles.popupContainer, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={[styles.popupHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.popupHeaderLeft}>
                <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {unreadCount} unread
                  </Text>
                )}
              </View>
              <View style={styles.popupHeaderRight}>
                {hasNotifications && (
                  <>
                    <TouchableOpacity
                      style={styles.popupHeaderButton}
                      onPress={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      <FontAwesome 
                        name="check" 
                        size={14} 
                        color={unreadCount === 0 ? colors['muted-foreground'] : colors.foreground} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.popupHeaderButton}
                      onPress={handleClearAll}
                    >
                      <FontAwesome 
                        name="trash" 
                        size={14} 
                        color={colors.destructive} 
                      />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={styles.popupHeaderButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <FontAwesome name="times" size={14} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.popupContent} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.popupEmptyState}>
                <FontAwesome name="spinner" size={24} color={colors['muted-foreground']} />
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  Loading...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.popupEmptyState}>
                <FontAwesome name="exclamation-triangle" size={24} color={colors.destructive} />
                <Text style={[TextStyles.body.small, { color: colors.destructive }]}>
                  Failed to load
                </Text>
                <TouchableOpacity
                  style={[styles.popupRetryButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    clearError();
                    fetchNotifications?.();
                  }}
                >
                  <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : !hasNotifications ? (
              <View style={styles.popupEmptyState}>
                <FontAwesome name="bell-slash" size={24} color={colors['muted-foreground']} />
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  No notifications
                </Text>
              </View>
            ) : (
              <View style={styles.popupNotificationsList}>
                {notifications.slice(0, 50).map((notification) => {
                  // Debug notification structure
                  console.log('📋 [NotificationBell] Rendering notification:', {
                    _id: notification._id,
                    id: notification.id,
                    title: notification.title,
                    isValidMongoId: /^[a-f0-9]{24}$/i.test(notification._id || notification.id || ''),
                    clientOnly: notification.clientOnly
                  });
                  
                  return (
                    <TouchableOpacity
                      key={notification._id || notification.id}
                      style={[
                        styles.popupNotificationItem,
                        { 
                          backgroundColor: notification.isRead 
                            ? colors.card 
                            : colors.primary + '10',
                          borderLeftColor: notification.isRead 
                            ? colors.border 
                            : colors.primary,
                        }
                      ]}
                      onPress={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    >
                      <View style={styles.popupNotificationContent}>
                        <View style={styles.popupNotificationHeader}>
                          <View style={styles.popupNotificationIcon}>
                            {getNotificationIcon(notification.type)}
                          </View>
                          <View style={styles.popupNotificationText}>
                            <Text style={[TextStyles.body.small, { color: colors.foreground }]} numberOfLines={1}>
                              {notification.title}
                            </Text>
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>
                              {formatTime(notification.createdAt)}
                            </Text>
                          </View>
                          {!notification.isRead && (
                            <View style={[styles.popupUnreadDot, { backgroundColor: colors.primary }]} />
                          )}
                        </View>
                        
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                          {notification.message}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  popupContainer: {
    width: 320,
    maxHeight: 400,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  popupHeaderLeft: {
    flex: 1,
  },
  popupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popupHeaderButton: {
    padding: 6,
  },
  popupContent: {
    maxHeight: 300,
  },
  popupNotificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  popupNotificationContent: {
    gap: 6,
  },
  popupNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  popupNotificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  popupNotificationText: {
    flex: 1,
    gap: 2,
  },
  popupUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  popupEmptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  popupRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  popupNotificationsList: {
    gap: 0,
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  notificationContent: {
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  notificationText: {
    flex: 1,
    gap: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
