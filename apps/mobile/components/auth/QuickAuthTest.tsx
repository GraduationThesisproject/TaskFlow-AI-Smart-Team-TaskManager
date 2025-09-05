import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Text, View, TouchableOpacity } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { AuthService } from '@/services/authService';
import { MockAuthService, TEST_ACCOUNT } from '@/services/mockAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuickAuthTest() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('Not checked');

  const testMockLogin = async () => {
    setLoading(true);
    setAuthStatus('Testing mock login...');
    
    try {
      console.log('🧪 Testing mock login directly...');
      
      // Test MockAuthService directly
      const result = await MockAuthService.login({
        email: TEST_ACCOUNT.email,
        password: TEST_ACCOUNT.password
      });
      
      if (result.success) {
        setAuthStatus('✅ Mock login successful');
        console.log('✅ Mock login successful:', result);
        
        // Test getting profile
        const profile = await MockAuthService.getProfile();
        console.log('✅ Profile retrieved:', profile);
        
        Alert.alert('Success', 'Mock login successful! Check console for details.');
      } else {
        setAuthStatus('❌ Mock login failed');
        Alert.alert('Error', 'Mock login failed');
      }
    } catch (error: any) {
      setAuthStatus('❌ Mock login error: ' + error.message);
      console.error('❌ Mock login error:', error);
      Alert.alert('Error', 'Mock login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthServiceLogin = async () => {
    setLoading(true);
    setAuthStatus('Testing AuthService login...');
    
    try {
      console.log('🧪 Testing AuthService login...');
      
      // Test AuthService (which should use mock in dev mode)
      const result = await AuthService.login({
        email: TEST_ACCOUNT.email,
        password: TEST_ACCOUNT.password
      });
      
      if (result.success) {
        setAuthStatus('✅ AuthService login successful');
        console.log('✅ AuthService login successful:', result);
        
        // Test getting profile
        const profile = await AuthService.getProfile();
        console.log('✅ Profile retrieved:', profile);
        
        Alert.alert('Success', 'AuthService login successful! Check console for details.');
      } else {
        setAuthStatus('❌ AuthService login failed');
        Alert.alert('Error', 'AuthService login failed');
      }
    } catch (error: any) {
      setAuthStatus('❌ AuthService login error: ' + error.message);
      console.error('❌ AuthService login error:', error);
      Alert.alert('Error', 'AuthService login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setAuthStatus('✅ Token found: ' + token.substring(0, 20) + '...');
        console.log('✅ Token found:', token);
      } else {
        setAuthStatus('❌ No token found');
        console.log('❌ No token found');
      }
    } catch (error) {
      setAuthStatus('❌ Error checking token: ' + error);
      console.error('❌ Error checking token:', error);
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setAuthStatus('✅ Token cleared');
      console.log('✅ Token cleared');
    } catch (error) {
      setAuthStatus('❌ Error clearing token: ' + error);
      console.error('❌ Error clearing token:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[TextStyles.h2, { color: colors.text }]}>
        Quick Auth Test
      </Text>
      
      <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: 16 }]}>
        Test authentication directly to debug issues
      </Text>

      <View style={styles.statusContainer}>
        <Text style={[TextStyles.label, { color: colors.text }]}>
          Status: {authStatus}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: loading ? colors.textSecondary : colors.primary,
            }
          ]}
          onPress={testMockLogin}
          disabled={loading}
        >
          <Text style={[TextStyles.button, { color: colors.surface }]}>
            {loading ? 'Testing...' : 'Test Mock Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: loading ? colors.textSecondary : colors.secondary,
            }
          ]}
          onPress={testAuthServiceLogin}
          disabled={loading}
        >
          <Text style={[TextStyles.button, { color: colors.surface }]}>
            {loading ? 'Testing...' : 'Test AuthService Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          onPress={checkToken}
        >
          <Text style={[TextStyles.button, { color: colors.text }]}>
            Check Token
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={clearToken}
        >
          <Text style={[TextStyles.button, { color: colors.surface }]}>
            Clear Token
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
          Test Account:
        </Text>
        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
          Email: {TEST_ACCOUNT.email}
        </Text>
        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
          Password: {TEST_ACCOUNT.password}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  infoContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
