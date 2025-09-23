import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { FREE_PLAN_LIMITS, getUpgradeMessage } from '@/utils/planLimits';

export interface PremiumSpaceLimitModalProps {
  visible: boolean;
  onClose: () => void;
  currentSpacesCount: number;
  maxFreeSpaces?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PremiumSpaceLimitModal({
  visible,
  onClose,
  currentSpacesCount,
  maxFreeSpaces = FREE_PLAN_LIMITS.MAX_SPACES_PER_WORKSPACE
}: PremiumSpaceLimitModalProps) {
  const colors = useThemeColors();

  const handleUpgrade = () => {
    onClose();
    router.push('/(tabs)/settings?section=upgrade');
  };

  const benefits = [
    "Unlimited spaces (currently limited to 5)",
    "Advanced analytics & reporting",
    "Priority support & faster response",
    "Custom integrations & API access",
    "Advanced security features",
    "Team collaboration tools"
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <FontAwesome name="folder-plus" size={24} color={colors.primary} />
            </View>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
              Space Limit Reached
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.muted }]}
            >
              <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[TextStyles.body.large, { color: colors.foreground, textAlign: 'center', marginBottom: 8 }]}>
              You've reached your space limit
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginBottom: 16 }]}>
              You currently have {currentSpacesCount} spaces. Free accounts are limited to {maxFreeSpaces} spaces.
            </Text>

            {/* Current Usage Indicator */}
            <View style={[styles.usageContainer, { backgroundColor: colors.muted + '20', borderColor: colors.border }]}>
              <View style={styles.usageHeader}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
                  Current Usage
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {currentSpacesCount}/{maxFreeSpaces} spaces
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${(currentSpacesCount / maxFreeSpaces) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 12, fontWeight: '600' }]}>
                Upgrade to Premium for:
              </Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <FontAwesome name="check" size={16} color={colors.success} style={styles.checkIcon} />
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                Maybe Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpgrade}
              style={[styles.button, styles.upgradeButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="star" size={16} color={colors['primary-foreground']} style={styles.upgradeIcon} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '600' }]}>
                Upgrade to Premium
              </Text>
            </TouchableOpacity>
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
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  usageContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  benefitsContainer: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
  },
  upgradeButton: {
    // backgroundColor set dynamically
  },
  upgradeIcon: {
    marginRight: 8,
  },
});
