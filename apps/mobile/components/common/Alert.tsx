import React from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, Pressable } from 'react-native';
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
  // Popup dialog actions (optional)
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function MobileAlert({
  variant = 'info',
  title,
  description,
  onClose,
  visible = true,
  testID,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: AlertProps) {
  const colors = useThemeColors();

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

  // Render as themed popup dialog
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel || onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onCancel || onClose} />
      {/* Centered dialog */}
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View
          testID={testID}
          style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {!!title && (
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{title}</Text>
          )}
          {!!description && (
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 6 }]}>
              {description}
            </Text>
          )}
          <View style={{ height: 14 }} />
          {/* Actions */}
          {onConfirm || onCancel ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onCancel || onClose}
                style={[styles.ghostBtn, { borderColor: colors.border }]}
                accessibilityRole="button"
              >
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm || onClose}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                accessibilityRole="button"
              >
                <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            onClose && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, alignSelf: 'flex-end' }]}
                  accessibilityRole="button"
                >
                  <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal-based popup styles
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000088',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  primaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});