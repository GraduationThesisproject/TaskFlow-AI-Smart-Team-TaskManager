import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

export type AlertVariant = 'warning' | 'error' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  showIcon?: boolean;
  showCloseButton?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const variantIcons = {
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const variantTheme: Record<AlertVariant, { bg: string; text: string; border: string }> = {
  warning: { bg: '#FFFBEB', text: '#B45309', border: '#F59E0B' },
  error: { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' },
  success: { bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
  info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#3B82F6' },
};

export const Alert = React.forwardRef<View, AlertProps>(
  (
    {
      variant = 'warning',
      title,
      description,
      onClose,
      showIcon = true,
      showCloseButton = true,
      style,
      children,
    },
    ref
  ) => {
    const Icon = variantIcons[variant];
    const theme = variantTheme[variant];

    return (
      <View
        ref={ref}
        accessibilityRole="alert"
        style={[
          styles.container,
          { backgroundColor: theme.bg, borderColor: theme.border },
          style,
        ]}
      >
        <View style={styles.row}>
          {showIcon && (
            <View style={styles.iconWrapper}>
              <Icon color={theme.text} size={20} />
            </View>
          )}

          <View style={styles.content}>
            {title ? (
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {title}
              </Text>
            ) : null}

            {description ? (
              <Text style={[styles.description, { color: theme.text }]}>
                {description}
              </Text>
            ) : null}

            {children}
          </View>

          {showCloseButton && onClose ? (
            <View style={styles.closeWrapper}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color={theme.text} size={18} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
);

Alert.displayName = 'Alert';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginRight: 12,
    paddingTop: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.9,
  },
  closeWrapper: {
    marginLeft: 12,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});
