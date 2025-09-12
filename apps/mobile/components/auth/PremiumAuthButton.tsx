import React, { useRef, useEffect, useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  Animated, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../ThemeProvider';
import { FontWeights } from '@/constants/Fonts';

interface PremiumAuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: any;
}

export default function PremiumAuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  style,
}: PremiumAuthButtonProps) {
  const colors = useThemeColors();
  const [pressed, setPressed] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous glow animation for primary buttons
    if (variant === 'primary' && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [variant, disabled]);

  const handlePressIn = () => {
    setPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: size === 'small' ? 12 : size === 'medium' ? 16 : 20,
      minHeight: size === 'small' ? 44 : size === 'medium' ? 56 : 68,
      paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 24 : 32,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: disabled ? colors['muted-foreground'] + '40' : colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = () => {
    const baseTextStyles = {
      fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
      fontWeight: FontWeights.bold,
      letterSpacing: 0.5,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyles,
          color: disabled ? colors['muted-foreground'] : colors['primary-foreground'],
        };
      case 'secondary':
        return {
          ...baseTextStyles,
          color: colors.primary,
        };
      case 'ghost':
        return {
          ...baseTextStyles,
          color: colors.foreground,
        };
      default:
        return baseTextStyles;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          getButtonStyles(),
          {
            shadowColor: variant === 'primary' ? colors.primary : colors.foreground,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Glow Effect */}
        {variant === 'primary' && !disabled && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                backgroundColor: colors.primary + '60',
                opacity: glowOpacity,
                borderRadius: getButtonStyles().borderRadius + 8,
              },
            ]}
          />
        )}

        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.rippleEffect,
            {
              backgroundColor: colors.primary + '30',
              transform: [{ scale: rippleScale }],
              borderRadius: getButtonStyles().borderRadius,
            },
          ]}
        />

        {/* Button Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={variant === 'primary' ? colors['primary-foreground'] : colors.primary} 
            />
          ) : (
            <>
              <Text style={getTextStyles()}>{title}</Text>
              {icon && !loading && (
                <MaterialIcons
                  name={icon}
                  size={size === 'small' ? 18 : size === 'medium' ? 22 : 26}
                  color={(getTextStyles() as any).color || colors.foreground}
                  style={{ marginLeft: 8 }}
                />
              )}
            </>
          )}
        </View>

        {/* Success Pulse (when not loading/disabled) */}
        {!loading && !disabled && variant === 'primary' && (
          <View style={[styles.successPulse, { backgroundColor: colors.success + '20' }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    zIndex: -1,
  },
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  successPulse: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
});
