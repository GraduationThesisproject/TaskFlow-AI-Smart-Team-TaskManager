import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Platform 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles, FontWeights } from '@/constants/Fonts';

interface PremiumAuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send' | 'go';
}

export default function PremiumAuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  required = false,
  icon,
  onSubmitEditing,
  returnKeyType = 'next',
}: PremiumAuthInputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Focus animation
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Glow animation when focused
    if (isFocused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isFocused]);

  useEffect(() => {
    // Shake animation on error
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background + 'F0', colors.primary + '08'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateX: shakeAnim }] }
      ]}
    >
      {/* Premium Label */}
      <View style={styles.labelContainer}>
        <Text style={[
          styles.label, 
          { 
            color: error ? colors.error : isFocused ? colors.primary : colors['muted-foreground'],
            fontWeight: isFocused ? FontWeights.semiBold : FontWeights.medium
          }
        ]}>
          {label}
          {required && (
            <Text style={[styles.required, { color: colors.error }]}> *</Text>
          )}
        </Text>
        
        {error && (
          <View style={styles.errorBadge}>
            <Ionicons name="alert-circle" size={12} color={colors.error} />
          </View>
        )}
      </View>

      {/* Premium Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : borderColor,
            backgroundColor,
            shadowColor: colors.primary,
          },
        ]}
      >
        {/* Glow Effect */}
        {isFocused && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                backgroundColor: colors.primary + '20',
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Leading Icon */}
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isFocused ? colors.primary : colors['muted-foreground']} 
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors['muted-foreground'] + '80'}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          selectionColor={colors.primary}
        />

        {/* Password Toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={[styles.passwordToggle, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors['muted-foreground']}
            />
          </TouchableOpacity>
        )}

        {/* Success Indicator */}
        {value && !error && (
          <View style={[styles.successIndicator, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          </View>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.View style={styles.errorContainer}>
          <View style={[styles.errorIcon, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="warning" size={12} color={colors.error} />
          </View>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </Animated.View>
      )}

      {/* Character Counter for longer inputs */}
      {value.length > 20 && (
        <Text style={[styles.counter, { color: colors['muted-foreground'] }]}>
          {value.length} characters
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  required: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    zIndex: -1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
  },
  passwordToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  successIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    flex: 1,
  },
  counter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '400',
  },
});
