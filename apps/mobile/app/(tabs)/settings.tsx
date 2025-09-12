import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useTheme } from '@/components/ThemeProvider';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/hooks/useAuth';
import { useLocalSearchParams, router } from 'expo-router';
import Sidebar from '@/components/navigation/Sidebar';

// Import new settings components
import AccountSettings from '@/components/settings/AccountSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AccountSummary from '@/components/settings/AccountSummary';
import SubscriptionCard from '@/components/settings/SubscriptionCard';
import ActivityPage from '@/components/settings/ActivityPage';
import DangerZone from '@/components/settings/DangerZone';

type SettingsTab = 'profile' | 'theme' | 'notifications' | 'activity' | 'upgrade';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { logout, deleteAccount } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Get navigation parameters
  const params = useLocalSearchParams();
  const { section } = params;

  // Redux selectors
  const { user } = useAppSelector(state => state.auth);
  const { workspaces } = useAppSelector(state => state.workspace);
  const { data: analytics } = useAppSelector(state => state.analytics);

  // Handle navigation from sidebar
  useEffect(() => {
    if (section) {
      switch (section) {
        case 'profile':
          setActiveTab('profile');
          break;
        case 'theme':
          setActiveTab('theme');
          break;
        case 'notifications':
          setActiveTab('notifications');
          break;
        case 'activity':
          setActiveTab('activity');
          break;
        case 'upgrade':
          setActiveTab('upgrade');
          break;
        default:
          setActiveTab('profile');
      }
    }
  }, [section]);

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

  const handleThemeToggle = async (value: boolean) => {
    await setTheme(value ? 'dark' : 'light');
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
        },
      ]
    );
  };

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
        },
      ]
    );
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ScrollView style={styles.content}>
            <AccountSettings />
            <DangerZone />
          </ScrollView>
        );
      case 'theme':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'activity':
        return <ActivityPage />;
      case 'upgrade':
        return <SubscriptionCard />;
      default:
        return (
          <ScrollView style={styles.content}>
            <AccountSummary />
            <SubscriptionCard />
          </ScrollView>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Arrow and Sidebar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)')}
          >
            <FontAwesome name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sidebarButton}
            onPress={toggleSidebar}
          >
            <FontAwesome name="bars" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
            Settings
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>


      {/* Content */}
      {renderContent()}

      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        context="settings"
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  quickLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
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