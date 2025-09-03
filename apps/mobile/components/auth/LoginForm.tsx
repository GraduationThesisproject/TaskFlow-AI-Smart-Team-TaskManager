import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, View } from '../Themed';
import InputField from '../forms/InputField';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  onOAuthLogin?: (provider: 'google' | 'github') => void;
  loading?: boolean;
  error?: string;
}

export default function LoginForm({
  onSubmit,
  onForgotPassword,
  onSignup,
  onOAuthLogin,
  loading = false,
  error
}: LoginFormProps) {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email, password);
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
          onChangeText={setEmail}
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
          onChangeText={setPassword}
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
          disabled={loading} 
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {onOAuthLogin && (
        <View style={styles.oauthContainer}>
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.oauthButtons}>
            <TouchableOpacity
              onPress={() => onOAuthLogin('google')}
              style={[styles.oauthButton, { borderColor: colors.border }]}
            >
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onOAuthLogin('github')}
              style={[styles.oauthButton, { borderColor: colors.border }]}
            >
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                GitHub
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  oauthContainer: {
    marginTop: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  oauthButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  oauthButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
