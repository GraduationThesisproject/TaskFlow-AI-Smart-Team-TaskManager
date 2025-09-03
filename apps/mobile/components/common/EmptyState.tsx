import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button, ButtonText, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'error' | 'success' | 'warning';
}

export default function EmptyState({ 
  icon = '📭',
  title, 
  description, 
  actionText, 
  onAction,
  variant = 'default' 
}: EmptyStateProps) {
  const colors = useThemeColors();

  const getVariantColors = () => {
    switch (variant) {
      case 'error':
        return { icon: '❌', color: colors.error };
      case 'success':
        return { icon: '✅', color: colors.success };
      case 'warning':
        return { icon: '⚠️', color: colors.warning };
      default:
        return { icon, color: colors['muted-foreground'] };
    }
  };

  const variantColors = getVariantColors();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: variantColors.color }]}>
          {variantColors.icon}
        </Text>
        
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, textAlign: 'center', marginTop: 16 }]}>
          {title}
        </Text>
        
        {description && (
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            {description}
          </Text>
        )}
        
        {actionText && onAction && (
          <Button onPress={onAction} style={styles.actionButton}>
            <ButtonText>{actionText}</ButtonText>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 24,
    minWidth: 120,
  },
});
