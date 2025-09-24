/**
 * Cross-platform themed components for React Native
 * Supports both iOS and Android with consistent theming
 */

import React from 'react';
import { Text as DefaultText, View as DefaultView, TextInput as DefaultTextInput, ScrollView as DefaultScrollView, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { useTheme, useThemeColors } from './ThemeProvider';
import { ThemeColors } from '@/constants/Colors';
type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  colorKey?: keyof ThemeColors;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'];
export type ScrollViewProps = ThemeProps & DefaultScrollView['props'];

/**
 * Hook to get theme color with fallback support
 */
export function useThemeColor(
  props: { light?: string; dark?: string; colorKey?: keyof ThemeColors },
  colorName: keyof ThemeColors
) {
  const { theme, colors } = useTheme();
  const colorFromProps = props[theme];
  const colorFromKey = props.colorKey ? colors[props.colorKey] : null;

  if (colorFromProps) {
    return colorFromProps;
  } else if (colorFromKey) {
    return colorFromKey;
  } else {
    return colors[colorName];
  }
}

/**
 * Themed Text component
 */
export function Text(props: TextProps) {
  const { style, lightColor, darkColor, colorKey, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor, colorKey }, 'foreground');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

/**
 * Themed View component
 */
export function View(props: ViewProps) {
  const { style, lightColor, darkColor, colorKey, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor, colorKey }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

/**
 * Themed TextInput component
 */
export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, colorKey, ...otherProps } = props;
  const colors = useThemeColors();
  
  const textColor = useThemeColor({ light: lightColor, dark: darkColor, colorKey }, 'foreground');
  const backgroundColor = colors.input;
  const borderColor = colors.border;

  return (
    <DefaultTextInput 
      style={[
        { 
          color: textColor, 
          backgroundColor, 
          borderColor,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          minHeight: 48,
          fontSize: 16,
        }, 
        style
      ]} 
      placeholderTextColor={colors['muted-foreground']}
      {...otherProps} 
    />
  );
}

/**
 * Themed ScrollView component
 */
export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, colorKey, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor, colorKey }, 'background');

  return <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}

/**
 * Card component with themed styling
 */
export function Card(props: ViewProps) {
  const { style, ...otherProps } = props;
  const colors = useThemeColors();
  
  return (
    <View 
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors['neutral-0'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
        style
      ]} 
      {...otherProps} 
    />
  );
}

/**
 * Button component with themed styling
 */
type ThemedButtonProps = TouchableOpacityProps & ThemeProps & { variant?: 'primary' | 'secondary' | 'destructive' };

export function Button(props: ThemedButtonProps) {
  const { style, lightColor, darkColor, colorKey, variant = 'primary', ...touchableProps } = props;
  const colors = useThemeColors();
  
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: colors['primary-foreground'],
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: colors['secondary-foreground'],
        };
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
          color: colors['destructive-foreground'],
        };
      default:
        return {
          backgroundColor: colors.primary,
          color: colors['primary-foreground'],
        };
    }
  };

  const buttonColors = getButtonColors();
  
  return (
    <TouchableOpacity  
      style={[
        {
          backgroundColor: buttonColors.backgroundColor,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: touchableProps.disabled ? 0.6 : 1,
        },
        style
      ]} 
      disabled={touchableProps.disabled}
      {...touchableProps} 
    />
  );
}

/**
 * ButtonText component for themed button text
 */
export function ButtonText(props: TextProps & { variant?: 'primary' | 'secondary' | 'destructive' }) {
  const { style, variant = 'primary', ...otherProps } = props;
  const colors = useThemeColors();
  
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors['primary-foreground'];
      case 'secondary':
        return colors['secondary-foreground'];
      case 'destructive':
        return colors['destructive-foreground'];
      default:
        return colors['primary-foreground'];
    }
  };

  return (
    <Text 
      style={[
        {
          color: getTextColor(),
          fontSize: 16,
          fontWeight: '600',
        },
        style
      ]} 
      {...otherProps} 
    />
  );
}
