import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, View } from '../Themed';
import InputField from '../forms/InputField';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onForgotPassword?: () => void;
  onSignup?: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({
  onForgotPassword,
  onSignup,
  onSuccess
}: LoginFormProps) {
  const colors = useThemeColors();
  const { login, isLoading, error, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      // Clear any general auth error before attempting login
      clearAuthError();
      setSubmitting(true);
      const result = await login({ email, password });
      if ((result as any)?.meta?.requestStatus === 'fulfilled') {
        onSuccess?.();
      }
    } catch (_) {
      // Error is handled in the auth slice; local UI will display via `error`
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
        Welcome Back
      </Text>
      
      <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
        Sign in to your account to continue
      </Text>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <InputField
          label="Email"
          value={email}
          onChangeText={(val) => {
            if (error) clearAuthError();
            setEmail(val);
            if (emailError) setEmailError('');
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          required
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={(val) => {
            if (error) clearAuthError();
            setPassword(val);
            if (passwordError) setPasswordError('');
          }}
          placeholder="Enter your password"
          secureTextEntry
          error={passwordError}
          required
        />

        {onForgotPassword && (
          <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
            <Text style={[TextStyles.body.small, { color: colors.primary }]}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={submitting}
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
        >
          <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {onSignup && (
        <View style={styles.signupContainer}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSignup}>
            <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    margin: 16,
  },
  form: {
    marginTop: 24,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
