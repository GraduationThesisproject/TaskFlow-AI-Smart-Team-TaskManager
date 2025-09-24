import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Modal, 
  Pressable, 
  Animated, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Text } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type AlertVariant = 'warning' | 'error' | 'success' | 'info';
export type AlertType = 'modal' | 'banner' | 'toast';

export interface MobileAlertProps {
  variant?: AlertVariant;
  type?: AlertType;
  title?: string;
  description?: string;
  message?: string;
  visible?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
  duration?: number; // Auto-hide duration in ms, 0 = no auto-hide
  position?: 'top' | 'center' | 'bottom';
  animationDuration?: number;
  testID?: string;
  style?: any;
  backdropOpacity?: number;
  allowBackdropClose?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MobileAlert({
  variant = 'info',
  type = 'modal',
  title,
  description,
  message,
  visible = false,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCloseButton = true,
  showIcon = true,
  icon,
  duration = 0,
  position = 'center',
  animationDuration = 300,
  testID,
  style,
  backdropOpacity = 0.5,
  allowBackdropClose = true,
}: MobileAlertProps) {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(false);

  // Get colors based on variant
  const getAlertColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: '#10B981',
          backgroundLight: '#D1FAE5',
          text: '#FFFFFF',
          textDark: '#065F46',
          border: '#059669',
          icon: '#10B981',
        };
      case 'error':
        return {
          background: '#EF4444',
          backgroundLight: '#FEE2E2',
          text: '#FFFFFF',
          textDark: '#991B1B',
          border: '#DC2626',
          icon: '#EF4444',
        };
      case 'warning':
        return {
          background: '#F59E0B',
          backgroundLight: '#FEF3C7',
          text: '#FFFFFF',
          textDark: '#92400E',
          border: '#D97706',
          icon: '#F59E0B',
        };
      case 'info':
      default:
        return {
          background: '#3B82F6',
          backgroundLight: '#DBEAFE',
          text: '#FFFFFF',
          textDark: '#1E40AF',
          border: '#2563EB',
          icon: '#3B82F6',
        };
    }
  };

  const alertColors = getAlertColors();

  // Get default icon based on variant
  const getDefaultIcon = () => {
    if (icon) return icon;
    
    const iconProps = {
      size: 24,
      color: type === 'modal' ? alertColors.icon : alertColors.text,
    };

    switch (variant) {
      case 'success':
        return <FontAwesome name="check-circle" {...iconProps} />;
      case 'error':
        return <FontAwesome name="exclamation-circle" {...iconProps} />;
      case 'warning':
        return <FontAwesome name="exclamation-triangle" {...iconProps} />;
      case 'info':
      default:
        return <FontAwesome name="info-circle" {...iconProps} />;
    }
  };

  // Animation effects
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Reset values
      scale.setValue(0.8);
      opacity.setValue(0);
      translateY.setValue(position === 'top' ? -100 : position === 'bottom' ? 100 : 0);

      // Entrance animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide if duration is set
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideAlert();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideAlert();
    }
  }, [visible, duration, animationDuration, position]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // If parent toggles a new instance rapidly, ensure we restart animations cleanly
  useEffect(() => {
    const key = (typeof (arguments as any) !== 'undefined') ? undefined : undefined;
    // no-op, placeholder to keep dependency array minimal
    return () => {};
  }, []);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -50 : position === 'bottom' ? 50 : 0,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Defer state update to avoid scheduling during React insertion phase
      const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb: any) => setTimeout(cb, 0);
      schedule(() => {
        setIsVisible(false);
        onClose?.();
      });
    });
  };

  const handleBackdropPress = () => {
    if (allowBackdropClose && onCancel) {
      onCancel();
    } else if (allowBackdropClose && onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    try {
      onConfirm?.();
    } finally {
      // Let provider hide after confirm; also provide a fallback
      setTimeout(() => hideAlert(), 10);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      hideAlert();
    }
  };

  if (!visible || !isVisible) return null;

  // Banner/Toast type
  if (type === 'banner' || type === 'toast') {
    const isTop = position === 'top';
    const isBottom = position === 'bottom';
    
    return (
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            [isTop ? 'top' : 'bottom']: Platform.OS === 'ios' ? 20 : 16,
            opacity,
            transform: [{ translateY }],
          },
          style,
        ]}
        testID={testID}
      >
        <View
          style={[
            styles.banner,
            {
              backgroundColor: alertColors.background,
              borderColor: alertColors.border,
            },
          ]}
        >
          {showIcon && (
            <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              {getDefaultIcon()}
            </View>
          )}
          
          <View style={styles.bannerContent}>
            {title && (
              <Text style={[TextStyles.heading.h4, { color: alertColors.text, marginBottom: 4 }]}>
                {title}
              </Text>
            )}
            <Text style={[TextStyles.body.medium, { color: alertColors.text, opacity: 0.95 }]}>
              {message || description}
            </Text>
          </View>

          {showCloseButton && (
            <TouchableOpacity
              onPress={hideAlert}
              style={[styles.bannerCloseButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome name="times" size={16} color={alertColors.text} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  // Modal type
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel || onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.modalBackdrop,
          { opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, backdropOpacity] }) },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
      </Animated.View>

      <View style={[styles.modalContainer, { justifyContent: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center' }]}>
        <Animated.View
          style={[
            styles.modalDialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity,
              transform: [{ scale }, { translateY }],
            },
            style,
          ]}
          testID={testID}
        >
          {/* Header with icon and close button */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              {showIcon && (
                <View style={[styles.modalIcon, { backgroundColor: alertColors.backgroundLight }]}>
                  {getDefaultIcon()}
                </View>
              )}
              <View style={styles.modalHeaderText}>
                {title && (
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                    {title}
                  </Text>
                )}
              </View>
            </View>
            
            {showCloseButton && (
              <TouchableOpacity
                onPress={hideAlert}
                style={[styles.modalCloseButton, { backgroundColor: colors.muted }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          {(message || description) && (
            <View style={styles.modalContent}>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], lineHeight: 22 }]}>
                {message || description}
              </Text>
            </View>
          )}

          {/* Actions */}
          {(onConfirm || onCancel) && (
            <View style={styles.modalActions}>
              {onCancel && (
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
                  accessibilityRole="button"
                >
                  <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              
              {onConfirm && (
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: alertColors.background }]}
                  accessibilityRole="button"
                >
                  <Text style={[TextStyles.body.medium, { color: alertColors.text, fontWeight: '600' }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Banner/Toast styles
  bannerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
    marginRight: 8,
  },
  bannerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    // backgroundColor set dynamically
  },
  modalButtonSecondary: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
