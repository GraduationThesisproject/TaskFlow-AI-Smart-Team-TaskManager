import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useMobileTheme } from '../../theme/ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const theme = useMobileTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  };

  if (variant === 'outlined') {
    cardStyle.borderWidth = 1;
    cardStyle.borderColor = theme.colors.border;
    // Remove shadow for outlined variant
    cardStyle.shadowOpacity = 0;
    cardStyle.elevation = 0;
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  const theme = useMobileTheme();

  return (
    <View style={[{ paddingBottom: theme.spacing.sm }, style]}>
      {children}
    </View>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={style}>
      {children}
    </View>
  );
}

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const theme = useMobileTheme();

  return (
    <View style={[{ paddingTop: theme.spacing.sm }, style]}>
      {children}
    </View>
  );
}
