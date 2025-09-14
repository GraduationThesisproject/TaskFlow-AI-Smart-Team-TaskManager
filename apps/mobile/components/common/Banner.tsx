import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar
} from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export type BannerType = 'success' | 'error' | 'warning' | 'info';

export interface BannerProps {
  visible: boolean;
  type: BannerType;
  message: string;
  title?: string;
  duration?: number; // Auto-hide duration in ms, 0 = no auto-hide
  onClose?: () => void;
  onPress?: () => void;
  showCloseButton?: boolean;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
  textStyle?: TextStyle;
  animationDuration?: number;
  testID?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onActionPress?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Banner({
  visible,
  type,
  message,
  title,
  duration = 3000,
  onClose,
  onPress,
  showCloseButton = true,
  position = 'bottom',
  style,
  textStyle,
  animationDuration = 400,
  testID,
  icon,
  actionText,
  onActionPress,
}: BannerProps) {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'bottom' ? 120 : -120)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // Get colors based on type with professional gradients
  const getBannerColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#10B981',
          backgroundGradient: ['#10B981', '#059669'],
          border: '#059669',
          text: '#FFFFFF',
          iconBackground: 'rgba(255, 255, 255, 0.2)',
          actionBackground: 'rgba(255, 255, 255, 0.15)',
        };
      case 'error':
        return {
          background: '#EF4444',
          backgroundGradient: ['#EF4444', '#DC2626'],
          border: '#DC2626',
          text: '#FFFFFF',
          iconBackground: 'rgba(255, 255, 255, 0.2)',
          actionBackground: 'rgba(255, 255, 255, 0.15)',
        };
      case 'warning':
        return {
          background: '#F59E0B',
          backgroundGradient: ['#F59E0B', '#D97706'],
          border: '#D97706',
          text: '#FFFFFF',
          iconBackground: 'rgba(255, 255, 255, 0.2)',
          actionBackground: 'rgba(255, 255, 255, 0.15)',
        };
      case 'info':
        return {
          background: '#3B82F6',
          backgroundGradient: ['#3B82F6', '#2563EB'],
          border: '#2563EB',
          text: '#FFFFFF',
          iconBackground: 'rgba(255, 255, 255, 0.2)',
          actionBackground: 'rgba(255, 255, 255, 0.15)',
        };
      default:
        return {
          background: colors.primary,
          backgroundGradient: [colors.primary, colors.primary],
          border: colors.primary,
          text: '#FFFFFF',
          iconBackground: 'rgba(255, 255, 255, 0.2)',
          actionBackground: 'rgba(255, 255, 255, 0.15)',
        };
    }
  };

  const bannerColors = getBannerColors();

  // Enhanced show animation with professional effects
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Reset values
      opacity.setValue(0);
      translateY.setValue(position === 'bottom' ? 120 : -120);
      scale.setValue(0.9);
      progress.setValue(0);

      // Entrance animation with spring effect
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar animation
      if (duration > 0) {
        Animated.timing(progress, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }).start();

        const timer = setTimeout(() => {
          hideBanner();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [visible, duration, animationDuration, position]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'bottom' ? 120 : -120,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose?.();
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onClose) {
      hideBanner();
    }
  };

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress();
    }
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  if (!visible || !isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          [position]: Platform.OS === 'ios' ? 20 : 16,
          backgroundColor: bannerColors.background,
          borderColor: bannerColors.border,
          opacity,
          transform: [
            { translateY },
            { scale }
          ],
        },
        style,
      ]}
      testID={testID}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={styles.bannerContent}
        onPress={handlePress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: bannerColors.iconBackground }]}>
          {icon || (
            <Text style={[styles.iconText, { color: bannerColors.text }]}>
              {getDefaultIcon()}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                TextStyles.heading.h4,
                {
                  color: bannerColors.text,
                  fontWeight: '600',
                  marginBottom: 4,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          <Text
            style={[
              TextStyles.body.medium,
              {
                color: bannerColors.text,
                fontWeight: '500',
                opacity: 0.95,
                lineHeight: 20,
              },
              textStyle,
            ]}
            numberOfLines={3}
          >
            {message}
          </Text>
        </View>

        {/* Action Button */}
        {actionText && onActionPress && (
          <TouchableOpacity
            onPress={handleActionPress}
            style={[
              styles.actionButton,
              { backgroundColor: bannerColors.actionBackground }
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                TextStyles.body.small,
                {
                  color: bannerColors.text,
                  fontWeight: '600',
                },
              ]}
            >
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Close Button */}
        {showCloseButton && (
          <TouchableOpacity
            onPress={hideBanner}
            style={[
              styles.closeButton,
              { backgroundColor: bannerColors.iconBackground }
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                TextStyles.body.medium,
                {
                  color: bannerColors.text,
                  opacity: 0.8,
                  fontSize: 16,
                  fontWeight: 'bold',
                },
              ]}
            >
              ×
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 72,
    maxWidth: screenWidth - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
    minHeight: 72,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
