import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useThemeColors } from '../ThemeProvider';

interface PremiumAuthCardProps {
  children: React.ReactNode;
  style?: any;
}

export default function PremiumAuthCard({ children, style }: PremiumAuthCardProps) {
  const colors = useThemeColors();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: colors.card + 'F5',
          borderColor: colors.border + '40',
          shadowColor: colors.foreground,
        },
        style,
      ]}
    >
      {/* Glassmorphism Background */}
      <View
        style={[
          styles.glassBackground,
          {
            backgroundColor: colors.background + 'A0',
          },
        ]}
      />

      {/* Shimmer Overlay */}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            backgroundColor: colors.primary,
            opacity: shimmerOpacity,
          },
        ]}
      />

      {/* Border Glow */}
      <View
        style={[
          styles.borderGlow,
          {
            borderColor: colors.primary + '30',
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Corner Accents */}
      <View style={[styles.cornerAccent, styles.topLeft, { backgroundColor: colors.primary + '20' }]} />
      <View style={[styles.cornerAccent, styles.topRight, { backgroundColor: colors.accent + '20' }]} />
      <View style={[styles.cornerAccent, styles.bottomLeft, { backgroundColor: colors.accent + '15' }]} />
      <View style={[styles.cornerAccent, styles.bottomRight, { backgroundColor: colors.primary + '15' }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 32,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  borderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 29,
    borderWidth: 1,
  },
  content: {
    padding: 32,
    zIndex: 1,
  },
  cornerAccent: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 0,
  },
  topLeft: {
    top: -20,
    left: -20,
  },
  topRight: {
    top: -20,
    right: -20,
  },
  bottomLeft: {
    bottom: -20,
    left: -20,
  },
  bottomRight: {
    bottom: -20,
    right: -20,
  },
});
