import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, Platform, TextInput } from 'react-native';
import { Text, View } from 'react-native';
import PremiumAuthInput from './PremiumAuthInput';
import PremiumAuthCard from './PremiumAuthCard';
import PremiumAuthText from './PremiumAuthText';
import PremiumAuthButton from './PremiumAuthButton';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles, FontSizes, FontWeights } from '@/constants/Fonts';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for accent elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const { width, height } = Dimensions.get('window');
  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Subtle Background Elements */}
      <View style={[styles.backgroundLeaf1, { backgroundColor: colors.primary + '15' }]} />
      <View style={[styles.backgroundLeaf2, { backgroundColor: colors.accent + '10' }]} />
      
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {onSignup && (
          <TouchableOpacity onPress={onSignup} style={styles.signupLink} activeOpacity={0.7}>
            <Text style={[styles.signupText, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="security" size={32} color="white" />
        </View>
        <Text style={[styles.appTitle, { color: colors.primary }]}>Log In To TaskFlow</Text>
      </View>

      {/* Centered Form Card */}
      <View style={styles.formContainer}>
        <View style={[styles.formCard, { backgroundColor: 'white', shadowColor: colors.foreground }]}>

          {error && (
            <View style={[styles.errorContainer, { 
              backgroundColor: colors.error + '10', 
              borderColor: colors.error + '20',
              borderWidth: 1
            }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Email Address</Text>
            <TextInput
              style={[styles.textInput, { 
                color: colors.foreground,
                borderColor: emailError ? colors.error : colors.border
              }]}
              value={email}
              onChangeText={(val) => {
                if (error) clearAuthError();
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              placeholder="Enter your email"
              placeholderTextColor={colors['muted-foreground']}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError && <Text style={[styles.fieldError, { color: colors.error }]}>{emailError}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.foreground,
                  borderColor: passwordError ? colors.error : colors.border,
                  flex: 1
                }]}
                value={password}
                onChangeText={(val) => {
                  if (error) clearAuthError();
                  setPassword(val);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors['muted-foreground']}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.showPasswordText, { color: colors.primary }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError && <Text style={[styles.fieldError, { color: colors.error }]}>{passwordError}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || isLoading}
            style={[
              styles.loginButton, 
              { 
                backgroundColor: colors.primary,
                opacity: (submitting || isLoading) ? 0.7 : 1 
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginButtonText, { color: 'white' }]}>
              {submitting || isLoading ? 'Signing In...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {onForgotPassword && (
            <TouchableOpacity 
              onPress={onForgotPassword} 
              style={styles.forgotPasswordLink}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Subtle Background Elements
  backgroundLeaf1: {
    position: 'absolute',
    top: 100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  backgroundLeaf2: {
    position: 'absolute',
    bottom: 100,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.08,
  },
  // Navigation Header
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  signupLink: {
    padding: 8,
  },
  signupText: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
  },
  // App Header
  appHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  // Form Container
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  showPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  showPasswordText: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
  },
  fieldError: {
    fontSize: 14,
    marginTop: 4,
  },
  // Button Styles
  loginButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: FontWeights.semiBold,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
  },
  // Error Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
});
