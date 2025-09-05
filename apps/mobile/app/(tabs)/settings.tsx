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
import { MockAuthService, TEST_ACCOUNT } from '@/services/mockAuthService';
import { loginUser } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<string>('Not checked');

  // Redux selectors
  const { user } = useAppSelector(state => state.auth);
  
  // Debug logging
  console.log('🔧 [Settings] User data from Redux:', {
    hasUser: !!user,
    userEmail: user?.user?.email,
    userName: user?.user?.name,
    userStructure: user ? Object.keys(user) : 'No user',
    fullUser: user
  });
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
              console.log('🚪 Logging out user...');
              await logout();
              console.log('✅ Logout successful');
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error) {
              console.error('❌ Logout failed:', error);
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
            // Handle account deletion
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
          }
        },
      ]
    );
  };

  const checkToken = async () => {
    try {
      setTokenStatus('Checking...');
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setTokenStatus('✅ Token found: ' + token.substring(0, 20) + '...');
        console.log('✅ Token found:', token);
        Alert.alert('Token Status', 'Token found and stored correctly!');
      } else {
        setTokenStatus('❌ No token found');
        console.log('❌ No token found');
        Alert.alert('Token Status', 'No authentication token found. Please login first.');
      }
    } catch (error) {
      setTokenStatus('❌ Error checking token: ' + error);
      console.error('❌ Error checking token:', error);
      Alert.alert('Error', 'Failed to check token: ' + error);
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      setTokenStatus('✅ Token cleared');
      console.log('✅ Token cleared');
      Alert.alert('Token Cleared', 'Authentication token has been cleared. You will need to login again.');
    } catch (error) {
      setTokenStatus('❌ Error clearing token: ' + error);
      console.error('❌ Error clearing token:', error);
      Alert.alert('Error', 'Failed to clear token: ' + error);
    }
  };

  const quickLogin = async () => {
    try {
      setTokenStatus('Logging in...');
      console.log('🔐 Attempting quick login with test account...');
      
      // Use Redux action to ensure state is updated properly
      const result = await dispatch(loginUser({
        email: TEST_ACCOUNT.email,
        password: TEST_ACCOUNT.password
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        const payload = result.payload as any;
        setTokenStatus('✅ Login successful: ' + payload.token.substring(0, 20) + '...');
        console.log('✅ Quick login successful:', payload);
        Alert.alert('Login Successful', 'You are now logged in with the test account!');
      } else {
        const payload = result.payload as string;
        setTokenStatus('❌ Login failed: ' + payload);
        console.log('❌ Quick login failed:', payload);
        Alert.alert('Login Failed', 'Failed to login: ' + payload);
      }
    } catch (error: any) {
      setTokenStatus('❌ Login error: ' + error.message);
      console.error('❌ Quick login error:', error);
      Alert.alert('Login Error', 'Failed to login: ' + error.message);
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
          
          {/* Quick Logout Button */}
          <TouchableOpacity 
            style={[styles.quickLogoutButton, { backgroundColor: colors.secondary, marginTop: 16 }]}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={16} color={colors['secondary-foreground']} />
            <Text style={[TextStyles.body.small, { color: colors['secondary-foreground'] }]}>
              Logout
            </Text>
          </TouchableOpacity>
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

        {/* Debug Section */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Debug Tools
          </Text>
          
          {/* Token Status */}
          <View style={[styles.settingItem, { backgroundColor: colors.card, marginBottom: 12 }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="key" size={20} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  Authentication Token
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  {tokenStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Token Actions */}
          <View style={styles.debugActions}>
            <TouchableOpacity 
              style={[styles.debugButton, { backgroundColor: colors.primary }]}
              onPress={checkToken}
            >
              <FontAwesome name="search" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                Check Token
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.debugButton, { backgroundColor: colors.destructive }]}
              onPress={clearToken}
            >
              <FontAwesome name="trash" size={16} color={colors['destructive-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>
                Clear Token
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Login */}
          <TouchableOpacity 
            style={[styles.quickLoginButton, { backgroundColor: colors.accent, marginTop: 12 }]}
            onPress={quickLogin}
          >
            <FontAwesome name="sign-in" size={16} color={colors['accent-foreground']} />
            <Text style={[TextStyles.body.medium, { color: colors['accent-foreground'] }]}>
              Quick Login (Test Account)
            </Text>
          </TouchableOpacity>

          {/* Test Account Info */}
          <View style={[styles.testAccountInfo, { backgroundColor: colors.card, marginTop: 12 }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Test Account: {TEST_ACCOUNT.email}
            </Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Password: {TEST_ACCOUNT.password}
            </Text>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Danger Zone
          </Text>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.warning }]}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={16} color={colors.foreground} />
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
              Logout
            </Text>
          </TouchableOpacity>
          
          {/* Delete Account Button */}
          <TouchableOpacity 
            style={[styles.dangerButton, { backgroundColor: colors.destructive, marginTop: 12 }]}
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
  debugActions: {
    flexDirection: 'row',
    gap: 12,
  },
  debugButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  testAccountInfo: {
    padding: 12,
    borderRadius: 8,
  },
});
