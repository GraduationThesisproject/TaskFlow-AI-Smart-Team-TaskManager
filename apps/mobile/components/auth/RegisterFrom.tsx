import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, View } from '../Themed';
import InputField from '../forms/InputField';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormProps {
  onSignin?: () => void;
  onSuccess?: () => void; // called after successful registration (parent can navigate)
}

export default function RegisterFrom({ onSignin, onSuccess }: RegisterFormProps) {
  const colors = useThemeColors();
  const { register, isLoading, error, clearAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim().toLowerCase());
  const validatePasswordComplexity = (val: string) =>
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val);

  const validateForm = () => {
    let isValid = true;

    // Name
    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
      isValid = false;
    } else {
      setNameError('');
    }

    // Email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (!validatePasswordComplexity(password)) {
      setPasswordError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    // Clear global error and per-field errors if re-submitting
    clearAuthError();
    if (!validateForm()) return;

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if ((result as any)?.meta?.requestStatus === 'rejected') {
        const backendMessage: string | undefined = (result as any)?.payload;
        if (backendMessage && /user already exists/i.test(backendMessage)) {
          setEmailError('An account with this email already exists');
        }
        return;
      }
      if ((result as any)?.meta?.requestStatus === 'fulfilled') {
        onSuccess?.();
      }
    } catch {
      // Error surfaced via `error` from useAuth
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
        Create Account
      </Text>

      <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
        Join thousands of users managing their tasks efficiently
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
          label="Full Name"
          value={name}
          onChangeText={(val) => {
            if (error) clearAuthError();
            setName(val);
            if (nameError) setNameError('');
          }}
          placeholder="Enter your full name"
          error={nameError}
          required
        />

        <InputField
          label="Email Address"
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

        <InputField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(val) => {
            if (error) clearAuthError();
            setConfirmPassword(val);
            if (confirmPasswordError) setConfirmPasswordError('');
          }}
          placeholder="Confirm your password"
          secureTextEntry
          error={confirmPasswordError}
          required
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }]}
        >
          <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      {onSignin && (
        <View style={styles.signinContainer}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSignin}>
            <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
              Sign in here
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
  submitButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});