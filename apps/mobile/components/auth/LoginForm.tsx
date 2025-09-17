import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, View } from '../Themed';
import InputField from '../forms/InputField';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      const result = await login({ email, password, rememberMe });
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
          secureTextEntry={!showPassword}
          error={passwordError}
          required
          rightIcon={(
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={colors['muted-foreground']}
              />
            </TouchableOpacity>
          )}
        />

        {/* Remember me toggle */}
        <TouchableOpacity
          onPress={() => setRememberMe((v) => !v)}
          style={styles.rememberMeContainer}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: colors.border,
                backgroundColor: rememberMe ? colors.primary : 'transparent',
              }
            ]}
          >
            {/* simple check indicator */}
            {rememberMe ? (
              <Text style={[styles.checkmark, { color: colors['primary-foreground'] }]}>✓</Text>
            ) : null}
          </View>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Remember me</Text>
        </TouchableOpacity>

        {onForgotPassword && (
          <TouchableOpacity 
            onPress={onForgotPassword} 
            style={styles.forgotPassword}
            activeOpacity={0.7}
          >
            <Text style={[TextStyles.body.small, { color: colors.primary }]}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={submitting || isLoading}
          style={[
            styles.submitButton, 
            { 
              backgroundColor: colors.primary, 
              opacity: (submitting || isLoading) ? 0.6 : 1 
            }
          ]}
          activeOpacity={0.8}
        >
          <Text style={[TextStyles.button.medium, { color: colors['primary-foreground'], textAlign: 'center' }]}>
            {submitting || isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
      {onSignup && (
        <View style={styles.signupContainer}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity 
            onPress={onSignup}
            activeOpacity={0.7}
            style={styles.signupLink}
          >
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
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signupLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
