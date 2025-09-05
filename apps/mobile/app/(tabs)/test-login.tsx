import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { checkAuthStatus, loginUser } from '@/store/slices/authSlice';
import { fetchWorkspaces } from '@/store/slices/workspaceSlice';
import { MockAuthService, TEST_ACCOUNT } from '@/services/mockAuthService';
import MockLoginScreen from '@/components/auth/MockLoginScreen';
import QuickAuthTest from '@/components/auth/QuickAuthTest';

export default function TestLoginScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useAppSelector(state => state.workspace);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await dispatch(checkAuthStatus());
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuth();
    if (isAuthenticated) {
      await dispatch(fetchWorkspaces());
    }
    setRefreshing(false);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await MockAuthService.logout();
      await dispatch(checkAuthStatus());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const testWorkspaces = async () => {
    if (isAuthenticated) {
      try {
        await dispatch(fetchWorkspaces());
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    }
  };

  if (showLogin) {
    return <MockLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={[TextStyles.h1, { color: colors.text }]}>
          Test Authentication
        </Text>
        
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: 24 }]}>
          Mock authentication for testing until the full system is ready
        </Text>

        {/* Authentication Status */}
        <Card style={styles.card}>
          <Text style={[TextStyles.h3, { color: colors.text }]}>
            Authentication Status
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Status:</Text>
            <Text style={[
              TextStyles.body, 
              { color: isAuthenticated ? colors.success : colors.error }
            ]}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Loading:</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              {isLoading ? '⏳ Loading...' : '✅ Ready'}
            </Text>
          </View>

          {user && (
            <View style={styles.statusRow}>
              <Text style={[TextStyles.label, { color: colors.text }]}>User:</Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                {user.user?.name || 'Unknown'}
              </Text>
            </View>
          )}

          {token && (
            <View style={styles.statusRow}>
              <Text style={[TextStyles.label, { color: colors.text }]}>Token:</Text>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                {token.substring(0, 20)}...
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.statusRow}>
              <Text style={[TextStyles.label, { color: colors.error }]}>Error:</Text>
              <Text style={[TextStyles.caption, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}
        </Card>

        {/* Test Account Info */}
        <Card style={styles.card}>
          <Text style={[TextStyles.h3, { color: colors.text }]}>
            Test Account
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Email:</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              {TEST_ACCOUNT.email}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Password:</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              {TEST_ACCOUNT.password}
            </Text>
          </View>
        </Card>

        {/* Workspaces Status */}
        <Card style={styles.card}>
          <Text style={[TextStyles.h3, { color: colors.text }]}>
            Workspaces Status
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Count:</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              {workspaces?.length || 0}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[TextStyles.label, { color: colors.text }]}>Loading:</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              {workspacesLoading ? '⏳ Loading...' : '✅ Ready'}
            </Text>
          </View>

          {workspacesError && (
            <View style={styles.statusRow}>
              <Text style={[TextStyles.label, { color: colors.error }]}>Error:</Text>
              <Text style={[TextStyles.caption, { color: colors.error }]}>
                {workspacesError}
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Auth Test */}
        <QuickAuthTest />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isAuthenticated ? (
            <Card style={styles.buttonCard}>
              <Text 
                style={[TextStyles.button, { color: colors.primary }]}
                onPress={() => setShowLogin(true)}
              >
                🔐 Login with Test Account
              </Text>
            </Card>
          ) : (
            <>
              <Card style={styles.buttonCard}>
                <Text 
                  style={[TextStyles.button, { color: colors.primary }]}
                  onPress={testWorkspaces}
                >
                  📁 Test Fetch Workspaces
                </Text>
              </Card>
              
              <Card style={styles.buttonCard}>
                <Text 
                  style={[TextStyles.button, { color: colors.error }]}
                  onPress={handleLogout}
                >
                  🚪 Logout
                </Text>
              </Card>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  buttonCard: {
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  },
});
