import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  visible: boolean;
  onHide?: () => void;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onHide
}: ToastProps) {
  const colors = useThemeColors();
  const [fadeAnim] = useState(new Animated.Value(0));

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success, borderColor: colors.success };
      case 'error':
        return { backgroundColor: colors.error, borderColor: colors.error };
      case 'warning':
        return { backgroundColor: colors.warning, borderColor: colors.warning };
      default:
        return { backgroundColor: colors.primary, borderColor: colors.primary };
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
      case 'error':
      case 'warning':
        return '#FFFFFF';
      default:
        return colors['primary-foreground'];
    }
  };

useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          }],
        },
      ]}
    >
      <Text style={[TextStyles.body.medium, { color: getTextColor() }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 32d51b586879fb337c0bdc120d266345058d0fc6
