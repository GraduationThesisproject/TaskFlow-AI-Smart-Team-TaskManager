import React, { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View, TextInput, TouchableOpacity } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { MockAuthService, TEST_ACCOUNT } from '@/services/mockAuthService';
import { useAppDispatch } from '@/store';
import { loginUser } from '@/store/slices/authSlice';

interface MockLoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function MockLoginScreen({ onLoginSuccess }: MockLoginScreenProps) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(TEST_ACCOUNT.email);
  const [password, setPassword] = useState(TEST_ACCOUNT.password);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting mock login...');
      
      // Use the mock auth service
      const result = await MockAuthService.login({ email, password });
      
      if (result.success) {
        console.log('✅ Mock login successful');
        
        // Dispatch the login action to update Redux state
        await dispatch(loginUser({ email, password }));
        
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => onLoginSuccess?.(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('❌ Mock login failed:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(TEST_ACCOUNT.email);
    setPassword(TEST_ACCOUNT.password);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[TextStyles.h1, { color: colors.text }]}>
            TaskFlow Login
          </Text>
          <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: 8 }]}>
            Mock Authentication (Testing Mode)
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, { color: colors.text }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, { color: colors.text }]}>
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: loading ? colors.textSecondary : colors.primary,
              }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[TextStyles.button, { color: colors.surface }]}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={fillTestCredentials}
          >
            <Text style={[TextStyles.caption, { color: colors.primary }]}>
              Fill Test Credentials
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testInfo}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 8,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  testButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  testInfo: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
