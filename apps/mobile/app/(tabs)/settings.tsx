import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useTheme } from '@/components/ThemeProvider';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useLocalSearchParams } from 'expo-router';

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
  const { logout } = useAuth();
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
              await logout();
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error) {
              Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
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
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
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