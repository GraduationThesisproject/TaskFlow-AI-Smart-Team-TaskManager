import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({
  children,
  variant = 'default',
  size = 'medium'
}: BadgeProps) {
  const colors = useThemeColors();

  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: colors.success, color: '#FFFFFF' };
      case 'warning':
        return { backgroundColor: colors.warning, color: '#000000' };
      case 'error':
        return { backgroundColor: colors.error, color: '#FFFFFF' };
      case 'info':
        return { backgroundColor: colors.accent, color: colors['accent-foreground'] };
      default:
        return { backgroundColor: colors.secondary, color: colors['secondary-foreground'] };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 };
      case 'large':
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 16 };
      default:
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View style={[styles.container, { backgroundColor: variantStyle.backgroundColor }, sizeStyle]}>
      <Text style={[TextStyles.caption.small, { color: variantStyle.color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
});
