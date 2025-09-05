import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useTheme } from '@/components/ThemeProvider';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Redux selectors
  const { user } = useAppSelector(state => state.auth);
  const { workspaces } = useAppSelector(state => state.workspace);
  const { data: analytics } = useAppSelector(state => state.analytics);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Calculate account summary from real data
  const getAccountSummary = () => {
    const totalWorkspaces = workspaces?.length || 0;
    const totalTasks = analytics?.coreMetrics?.totalTasks || 0;
    const completedTasks = Math.round((analytics?.coreMetrics?.completionRate || 0) * totalTasks / 100);
    
    return {
      workspaces: totalWorkspaces,
      tasks: totalTasks,
      completed: completedTasks,
    };
  };

  const accountSummary = getAccountSummary();

  const handleThemeToggle = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Sidebar Toggle */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.sidebarButton, { backgroundColor: colors.primary }]}
          onPress={toggleSidebar}
        >
          <FontAwesome name="bars" size={20} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Profile
          </Text>
          <View style={[styles.profileInfo, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <FontAwesome name="user" size={24} color={colors['primary-foreground']} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                {user?.user?.name || 'User'}
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {user?.user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Summary */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Account Summary
          </Text>
          <View style={styles.accountStats}>
            <View style={[styles.statItem, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>
                {accountSummary.workspaces}
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                Workspaces
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>
                {accountSummary.tasks}
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                Tasks
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h3, { color: colors.success }]}>
                {accountSummary.completed}
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                Completed
              </Text>
            </View>
          </View>
        </Card>

        {/* Appearance Settings */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Appearance
          </Text>
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="moon-o" size={20} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  Dark Mode
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Notifications
          </Text>
          <View style={styles.notificationSettings}>
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingInfo}>
                <FontAwesome name="bell" size={20} color={colors.primary} />
                <View style={styles.settingText}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                    Enable Notifications
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Receive push notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingInfo}>
                <FontAwesome name="envelope" size={20} color={colors.accent} />
                <View style={styles.settingText}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                    Email Notifications
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Receive email updates
                  </Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingInfo}>
                <FontAwesome name="mobile" size={20} color={colors.warning} />
                <View style={styles.settingText}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                    Push Notifications
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Receive mobile push notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </Card>

        {/* Upgrade Section */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Upgrade
          </Text>
          <View style={[styles.upgradeCard, { backgroundColor: colors.primary }]}>
            <FontAwesome name="star" size={32} color={colors['primary-foreground']} />
            <Text style={[TextStyles.heading.h3, { color: colors['primary-foreground'], marginTop: 12 }]}>
              Upgrade to Pro
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['primary-foreground'], textAlign: 'center', marginTop: 8 }]}>
              Get unlimited workspaces, advanced analytics, and priority support
            </Text>
            <TouchableOpacity 
              style={[styles.upgradeButton, { backgroundColor: colors['primary-foreground'] }]}
              onPress={() => Alert.alert('Upgrade', 'Upgrade feature will be implemented soon.')}
            >
              <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
                Upgrade Now
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Danger Zone
          </Text>
          <TouchableOpacity 
            style={[styles.dangerButton, { backgroundColor: colors.destructive }]}
            onPress={handleDeleteAccount}
          >
            <FontAwesome name="trash" size={16} color={colors['destructive-foreground']} />
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        context="settings"
        currentSectionId="settings"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sidebarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  accountStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationSettings: {
    gap: 12,
  },
  upgradeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
});
