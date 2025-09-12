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
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Subtle Background Elements */}
      <View style={[styles.backgroundLeaf1, { backgroundColor: colors.accent + '15' }]} />
      <View style={[styles.backgroundLeaf2, { backgroundColor: colors.primary + '10' }]} />
      
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {onSignin && (
          <TouchableOpacity onPress={onSignin} style={styles.signinLink} activeOpacity={0.7}>
            <Text style={[styles.signinText, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={[styles.appIcon, { backgroundColor: colors.accent }]}>
          <MaterialIcons name="person-add" size={32} color="white" />
        </View>
        <Text style={[styles.appTitle, { color: colors.accent }]}>Join TaskFlow</Text>
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
                <Text style={[styles.showPasswordText, { color: colors.accent }]}>
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
                <Text style={[styles.showPasswordText, { color: colors.accent }]}>
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
                backgroundColor: colors.accent,
                opacity: isLoading ? 0.7 : 1 
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerButtonText, { color: 'white' }]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
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
  signinLink: {
    padding: 8,
  },
  signinText: {
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
});