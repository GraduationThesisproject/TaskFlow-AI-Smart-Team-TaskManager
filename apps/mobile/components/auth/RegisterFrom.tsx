import React, { useState, useEffect, useRef } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for accent elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
        // After signup, navigate to verify-email screen with the email used
        const emailParam = email.trim().toLowerCase();
        onSuccess?.();
        router.replace({ pathname: '/verify-email', params: { email: emailParam } });
      }
    } catch {
      // Error surfaced via `error` from useAuth
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
        {onSignin && (
          <TouchableOpacity onPress={onSignin} style={[styles.signinLink, { backgroundColor: 'rgba(255,255,255,0.1)' }]} activeOpacity={0.7}>
            <Text style={[styles.signinText, { color: 'white' }]}>Sign In</Text>
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
              <MaterialIcons name="person-add" size={24} color="white" />
            </View>
            <Text style={[styles.appTitle, { color: '#007ADF' }]}>Join TaskFlow</Text>
            <Text style={styles.subtitleText}>Create your account to get started</Text>
          </View>

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
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Full Name</Text>
            <TextInput
              style={[styles.textInput, { 
                color: colors.foreground,
                borderColor: nameError ? colors.error : colors.border
              }]}
              value={name}
              onChangeText={(val) => {
                if (error) clearAuthError();
                setName(val);
                if (nameError) setNameError('');
              }}
              placeholder="Enter your full name"
              placeholderTextColor={colors['muted-foreground']}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {nameError && <Text style={[styles.fieldError, { color: colors.error }]}>{nameError}</Text>}
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.foreground,
                  borderColor: confirmPasswordError ? colors.error : colors.border,
                  flex: 1
                }]}
                value={confirmPassword}
                onChangeText={(val) => {
                  if (error) clearAuthError();
                  setConfirmPassword(val);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                placeholder="Confirm your password"
                placeholderTextColor={colors['muted-foreground']}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.showPasswordButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.showPasswordText, { color: '#007ADF' }]}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError && <Text style={[styles.fieldError, { color: colors.error }]}>{confirmPasswordError}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={[
              styles.registerButton, 
              { 
                backgroundColor: '#007ADF',
                opacity: isLoading ? 0.7 : 1 
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerButtonText, { color: 'white' }]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <Text style={[styles.oauthDivider, { color: colors['muted-foreground'] }]}>
              or continue with
            </Text>
            
            <TouchableOpacity 
              onPress={() => console.log('Google OAuth pressed')} 
              style={styles.googleButton}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#007ADF" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => console.log('GitHub OAuth pressed')} 
              style={styles.githubButton}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-github" size={20} color="white" />
              <Text style={styles.githubButtonText}>Continue with GitHub</Text>
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
  signinLink: {
    padding: 12,
    borderRadius: 20,
  },
  signinText: {
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
  // Button Styles
  registerButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: FontWeights.semiBold,
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