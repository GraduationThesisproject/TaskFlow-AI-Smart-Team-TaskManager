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
import { useOAuth } from '../../hooks/useOAuth';
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
  const { handleGoogleLogin, handleGitHubLogin, isLoading: oauthLoading, error: oauthError, clearError: clearOAuthError } = useOAuth();
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Cool Professional Background */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundPattern} />
      
      {/* Floating Geometric Elements */}
      <Animated.View style={[styles.floatingElement1, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.floatingElement2, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.floatingElement3, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.floatingElement4, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.floatingElement5, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.floatingElement6, { transform: [{ scale: pulseAnim }] }]} />
      
      {/* Subtle Grid Pattern */}
      <View style={styles.gridPattern} />
      
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        {onSignup && (
          <TouchableOpacity onPress={onSignup} style={[styles.signupLink, { backgroundColor: 'rgba(255,255,255,0.1)' }]} activeOpacity={0.7}>
            <Text style={[styles.signupText, { color: 'white' }]}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Centered Form Card */}
      <View style={styles.formContainer}>
        <View style={[styles.formCard, { 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          shadowColor: '#000',
          backdropFilter: 'blur(20px)'
        }]}>
          
          {/* App Header Inside Form */}
          <View style={styles.cardHeader}>
            <View style={[styles.appIcon, { backgroundColor: '#007ADF' }]}>
              <MaterialIcons name="security" size={24} color="white" />
            </View>
            <Text style={[styles.appTitle, { color: '#007ADF' }]}>Welcome back</Text>
            <Text style={styles.subtitleText}>Sign in to your account to continue</Text>
          </View>

          {(error || oauthError) && (
            <View style={[styles.errorContainer, { 
              backgroundColor: colors.error + '10', 
              borderColor: colors.error + '20',
              borderWidth: 1
            }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error || oauthError}
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
                <Text style={[styles.showPasswordText, { color: '#007ADF' }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError && <Text style={[styles.fieldError, { color: colors.error }]}>{passwordError}</Text>}
          </View>

          {/* Remember Me Checkbox */}
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxContainer}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: rememberMe ? '#007ADF' : 'transparent',
                  borderColor: rememberMe ? '#007ADF' : colors.border
                }
              ]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={[styles.rememberMeText, { color: colors.foreground }]}>
                Remember me
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || isLoading}
            style={[
              styles.loginButton, 
              { 
                backgroundColor: '#007ADF',
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
               <Text style={[styles.forgotPasswordText, { color: '#007ADF' }]}>
                 Forgot Password?
               </Text>
            </TouchableOpacity>
          )}

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <Text style={[styles.oauthDivider, { color: colors['muted-foreground'] }]}>
              or continue with
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                clearOAuthError();
                handleGoogleLogin();
              }} 
              style={[styles.googleButton, { opacity: oauthLoading ? 0.7 : 1 }]}
              activeOpacity={0.8}
              disabled={oauthLoading}
            >
              <Ionicons name="logo-google" size={20} color="#4285f4" />
              <Text style={styles.googleButtonText}>
                {oauthLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                clearOAuthError();
                handleGitHubLogin();
              }} 
              style={[styles.githubButton, { opacity: oauthLoading ? 0.7 : 1 }]}
              activeOpacity={0.8}
              disabled={oauthLoading}
            >
              <Ionicons name="logo-github" size={20} color="white" />
              <Text style={styles.githubButtonText}>
                {oauthLoading ? 'Signing in...' : 'Continue with GitHub'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  // Cool Professional Background
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#007ADF',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.3,
  },
  // Floating Geometric Elements
  floatingElement1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  floatingElement2: {
    position: 'absolute',
    top: 300,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.5,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: 200,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.4,
  },
  floatingElement4: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.3,
  },
  floatingElement5: {
    position: 'absolute',
    top: 50,
    left: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.4,
  },
  floatingElement6: {
    position: 'absolute',
    bottom: 300,
    right: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.3,
  },
  // Subtle Grid Pattern
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.1,
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
    padding: 12,
    borderRadius: 20,
  },
  signupLink: {
    padding: 12,
    borderRadius: 20,
  },
  signupText: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
  },
  // Card Header Inside Form
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  // Form Container
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  // Remember Me Styles
  rememberMeContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rememberMeText: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
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
  // OAuth Styles
  oauthContainer: {
    marginTop: 24,
  },
  oauthDivider: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: FontWeights.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: FontWeights.medium,
    marginLeft: 12,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24292e',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  githubButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FontWeights.medium,
    marginLeft: 12,
  },
});

