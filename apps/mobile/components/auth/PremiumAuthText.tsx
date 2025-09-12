import React, { useRef, useEffect } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../ThemeProvider';
import { FontWeights } from '@/constants/Fonts';

interface PremiumAuthTextProps {
  children: React.ReactNode;
  variant: 'title' | 'subtitle' | 'body' | 'caption';
  style?: any;
  animated?: boolean;
  gradient?: boolean;
}

export default function PremiumAuthText({ 
  children, 
  variant, 
  style, 
  animated = false,
  gradient = false 
}: PremiumAuthTextProps) {
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return {
          fontSize: 34,
          fontWeight: FontWeights.bold,
          letterSpacing: -1.2,
          lineHeight: 40,
          color: gradient ? colors.primary : colors.foreground,
        };
      case 'subtitle':
        return {
          fontSize: 18,
          fontWeight: FontWeights.medium,
          letterSpacing: 0.3,
          lineHeight: 26,
          color: colors['muted-foreground'],
        };
      case 'body':
        return {
          fontSize: 16,
          fontWeight: FontWeights.medium,
          letterSpacing: 0.2,
          lineHeight: 24,
          color: colors.foreground,
        };
      case 'caption':
        return {
          fontSize: 14,
          fontWeight: FontWeights.medium,
          letterSpacing: 0.4,
          lineHeight: 20,
          color: colors['muted-foreground'],
        };
      default:
        return {};
    }
  };

  const textStyle = [
    getVariantStyles(),
    style,
  ];

  if (animated) {
    return (
      <Animated.Text
        style={[
          textStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.Text>
    );
  }

  return <Text style={textStyle}>{children}</Text>;
}
