import React from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, ButtonText, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger' | 'warning';
  loading?: boolean;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false
}: ConfirmationDialogProps) {
  const colors = useThemeColors();

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return { 
          confirmColor: colors.destructive,
          confirmTextColor: colors['destructive-foreground'],
          icon: '⚠️'
        };
      case 'warning':
        return { 
          confirmColor: colors.warning,
          confirmTextColor: '#000000',
          icon: '⚠️'
        };
      default:
        return { 
          confirmColor: colors.primary,
          confirmTextColor: colors['primary-foreground'],
          icon: '❓'
        };
    }
  };

  const variantColors = getVariantColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={styles.icon}>{variantColors.icon}</Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
              {title}
            </Text>
          </View>

          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 16 }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <Button
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: variantColors.confirmColor }
              ]}
            >
              <ButtonText style={{ color: variantColors.confirmTextColor }}>
                {loading ? 'Loading...' : confirmText}
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    borderWidth: 0,
  },
});
