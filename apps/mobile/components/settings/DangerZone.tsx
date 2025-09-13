import React, { useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

const DangerZone: React.FC = () => {
  const colors = useThemeColors();
  const { logout, deleteAccount } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              // Navigate to login screen after successful deletion
              await deleteAccount({ navigate: (path: string) => router.replace(path as any) });
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            } catch (error: any) {
              const errorMessage = error?.message || 'Failed to delete account. Please try again.';
              Alert.alert('Deletion Failed', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to login again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout({ navigate: (path: string) => router.replace(path as any) });
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error: any) {
              const errorMessage = error?.message || 'Failed to logout. Please try again.';
              Alert.alert('Logout Failed', errorMessage);
            }
          }
        }
      ]
    );
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
      <View style={[styles.header, { borderBottomColor: colors.destructive }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.destructive + '20' }]}>
          <FontAwesome name="exclamation-triangle" size={20} color={colors.destructive} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[TextStyles.heading.h3, { color: colors.destructive }]}>
            Danger Zone
          </Text>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Irreversible actions that affect your account
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Warning Section */}
        <View style={[styles.warningSection, { backgroundColor: colors.destructive + '10' }]}>
          <View style={styles.warningHeader}>
            <FontAwesome name="shield" size={16} color={colors.destructive} />
            <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
              Important Warning
            </Text>
          </View>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            These actions are permanent and cannot be undone. Please proceed with caution.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Logout Action */}
          <View style={styles.actionItem}>
            <View style={styles.actionHeader}>
              <FontAwesome name="sign-out" size={16} color={colors.foreground} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                Logout
              </Text>
            </View>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Sign out of your account on this device
            </Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={14} color={colors.destructive} />
              <Text style={[TextStyles.body.small, { color: colors.destructive }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete Account Action */}
          <View style={styles.actionItem}>
            <View style={styles.actionHeader}>
              <FontAwesome name="trash" size={16} color={colors.destructive} />
              <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
                Delete Account
              </Text>
            </View>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Permanently delete your account and all associated data
            </Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeleteAccount}
            >
              <FontAwesome name="trash" size={14} color={colors.destructive} />
              <Text style={[TextStyles.body.small, { color: colors.destructive }]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.muted }]}>
          <FontAwesome name="lock" size={14} color={colors['muted-foreground']} />
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            All actions are logged for security purposes
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  warningSection: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsContainer: {
    gap: 16,
  },
  actionItem: {
    gap: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
  },
});

export default DangerZone;
