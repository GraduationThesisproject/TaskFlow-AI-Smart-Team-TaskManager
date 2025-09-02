import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useMobileTheme } from '../../theme/ThemeProvider';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'small' | 'muted';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

export function Text({
  children,
  variant = 'p',
  size,
  weight,
  color,
  style,
  numberOfLines,
  ellipsizeMode,
}: TextProps) {
  const theme = useMobileTheme();

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: theme.colors.foreground,
    };

    // Variant styles
    switch (variant) {
      case 'h1':
        baseStyle.fontSize = theme.typography.fontSizes.xxxl;
        baseStyle.fontWeight = theme.typography.fontWeights.bold;
        break;
      case 'h2':
        baseStyle.fontSize = theme.typography.fontSizes.xxl;
        baseStyle.fontWeight = theme.typography.fontWeights.bold;
        break;
      case 'h3':
        baseStyle.fontSize = theme.typography.fontSizes.xl;
        baseStyle.fontWeight = theme.typography.fontWeights.semibold;
        break;
      case 'h4':
        baseStyle.fontSize = theme.typography.fontSizes.lg;
        baseStyle.fontWeight = theme.typography.fontWeights.semibold;
        break;
      case 'h5':
        baseStyle.fontSize = theme.typography.fontSizes.md;
        baseStyle.fontWeight = theme.typography.fontWeights.medium;
        break;
      case 'h6':
        baseStyle.fontSize = theme.typography.fontSizes.sm;
        baseStyle.fontWeight = theme.typography.fontWeights.medium;
        break;
      case 'p':
        baseStyle.fontSize = theme.typography.fontSizes.md;
        baseStyle.fontWeight = theme.typography.fontWeights.normal;
        break;
      case 'span':
        baseStyle.fontSize = theme.typography.fontSizes.sm;
        baseStyle.fontWeight = theme.typography.fontWeights.normal;
        break;
      case 'small':
        baseStyle.fontSize = theme.typography.fontSizes.xs;
        baseStyle.fontWeight = theme.typography.fontWeights.normal;
        break;
      case 'muted':
        baseStyle.fontSize = theme.typography.fontSizes.sm;
        baseStyle.fontWeight = theme.typography.fontWeights.normal;
        baseStyle.color = theme.colors.mutedForeground;
        break;
    }

    // Override size if provided
    if (size) {
      baseStyle.fontSize = theme.typography.fontSizes[size];
    }

    // Override weight if provided
    if (weight) {
      baseStyle.fontWeight = theme.typography.fontWeights[weight];
    }

    // Override color if provided
    if (color) {
      baseStyle.color = color;
    }

    return baseStyle;
  };

  return (
    <RNText
      style={[getTextStyle(), style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </RNText>
  );
}

// Convenience components for common text variants
export function H1(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h1" {...props} />;
}

export function H2(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h2" {...props} />;
}

export function H3(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h3" {...props} />;
}

export function H4(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h4" {...props} />;
}

export function H5(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h5" {...props} />;
}

export function H6(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h6" {...props} />;
}

export function P(props: Omit<TextProps, 'variant'>) {
  return <Text variant="p" {...props} />;
}

export function Small(props: Omit<TextProps, 'variant'>) {
  return <Text variant="small" {...props} />;
}

export function Muted(props: Omit<TextProps, 'variant'>) {
  return <Text variant="muted" {...props} />;
}
