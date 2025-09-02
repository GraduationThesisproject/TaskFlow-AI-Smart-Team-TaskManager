import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useMobileTheme } from '../../theme/ThemeProvider';

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useMobileTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.paddingVertical = theme.spacing.xs;
        baseStyle.minHeight = 32;
        break;
      case 'lg':
        baseStyle.paddingHorizontal = theme.spacing.lg;
        baseStyle.paddingVertical = theme.spacing.md;
        baseStyle.minHeight = 48;
        break;
      case 'icon':
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.minHeight = 40;
        baseStyle.minWidth = 40;
        break;
      default:
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.minHeight = 40;
    }

    // Variant styles
    switch (variant) {
      case 'default':
        baseStyle.backgroundColor = theme.colors.primary;
        break;
      case 'destructive':
        baseStyle.backgroundColor = theme.colors.destructive;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'link':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.paddingHorizontal = 0;
        baseStyle.paddingVertical = 0;
        break;
    }

    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
    };

    // Variant text colors
    switch (variant) {
      case 'default':
        baseTextStyle.color = theme.colors.primaryForeground;
        break;
      case 'destructive':
        baseTextStyle.color = theme.colors.destructiveForeground;
        break;
      case 'outline':
        baseTextStyle.color = theme.colors.foreground;
        break;
      case 'secondary':
        baseTextStyle.color = theme.colors.secondaryForeground;
        break;
      case 'ghost':
        baseTextStyle.color = theme.colors.foreground;
        break;
      case 'link':
        baseTextStyle.color = theme.colors.primary;
        baseTextStyle.textDecorationLine = 'underline';
        break;
    }

    // Size text adjustments
    switch (size) {
      case 'sm':
        baseTextStyle.fontSize = theme.typography.fontSizes.xs;
        break;
      case 'lg':
        baseTextStyle.fontSize = theme.typography.fontSizes.md;
        break;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive' 
            ? theme.colors.primaryForeground 
            : theme.colors.foreground}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
