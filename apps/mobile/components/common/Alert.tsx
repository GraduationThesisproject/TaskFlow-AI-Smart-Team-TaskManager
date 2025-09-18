import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export type AlertVariant = 'warning' | 'error' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  visible?: boolean;
  testID?: string;
}

export default function Alert({
  variant = 'info',
  title,
  description,
  onClose,
  visible = true,
  testID,
}: AlertProps) {
  const colors = useThemeColors();

  // Early return after all hooks to avoid violating Rules of Hooks
  if (!visible) return null;

  const paletteByVariant = () => {
    switch (variant) {
      case 'warning':
        return { bg: colors.warning, fg: '#fff', border: colors.warning };
      case 'error':
        return { bg: colors.error, fg: '#fff', border: colors.error };
      case 'success':
        return { bg: colors.success, fg: '#fff', border: colors.success };
      default:
        return { bg: colors.primary, fg: colors['primary-foreground'], border: colors.primary };
    }
  };

  const palette = paletteByVariant();

    return (
        <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border }]} testID={testID}>
          <View style={styles.content}>
            <View style={styles.texts}>
          {!!title && (
            <Text style={[TextStyles.body.medium, { color: palette.fg }]} numberOfLines={2}>
              {title}
            </Text>
          )}
          {!!description && (
            <Text style={[TextStyles.caption.small, { color: palette.fg, opacity: 0.9, marginTop: 4 }]} numberOfLines={3}>
              {description}
            </Text>
          )}
        </View>
        {!!onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[TextStyles.body.small, { color: palette.fg }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  texts: {
    flex: 1,
    paddingRight: 12,
  },
  closeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
