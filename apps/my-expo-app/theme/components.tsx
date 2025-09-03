import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

// Themed Container Component
interface ThemedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'background' | 'surface' | 'card';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  children, 
  style, 
  variant = 'background' 
}) => {
  const { theme } = useTheme();
  
  const backgroundColor = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    card: theme.colors.card,
  }[variant];
  
  return (
    <View style={[{ backgroundColor }, style]}>
      {children}
    </View>
  );
};

// Themed Text Component
interface ThemedTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'primary' | 'secondary' | 'muted';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'bold';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
}) => {
  const { theme } = useTheme();
  
  const color = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
  }[variant];
  
  return (
    <Text
      style={[
        {
          color,
          fontSize: theme.typography.fontSize[size],
          fontWeight: theme.typography.fontWeight[weight],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Themed Button Component
interface ThemedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  const { theme } = useTheme();
  
  const buttonStyles = {
    primary: {
      backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: disabled ? theme.colors.disabled : theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
    },
  }[variant];
  
  const textColor = {
    primary: variant === 'primary' ? '#000000' : theme.colors.text,
    secondary: theme.colors.text,
    outline: disabled ? theme.colors.disabled : theme.colors.primary,
  }[variant];
  
  const padding = {
    sm: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm },
    md: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
    lg: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
  }[size];
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          borderRadius: theme.borderRadius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          ...buttonStyles,
          ...padding,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: textColor,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
