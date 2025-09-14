import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SpaceCard, { SpaceCardProps } from './SpaceCard';
import PremiumLockModal from './PremiumLockModal';

export interface PremiumSpaceCardProps extends SpaceCardProps {
  isLocked?: boolean;
  lockReason?: string;
  onLockPress?: () => void;
  benefits?: string[];
}

export default function PremiumSpaceCard({
  isLocked = false,
  lockReason = "This space is locked",
  onLockPress,
  onPress,
  benefits = [
    "Unlimited spaces",
    "Advanced analytics",
    "Priority support",
    "Custom integrations"
  ],
  ...spaceCardProps
}: PremiumSpaceCardProps) {
  const colors = useThemeColors();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handlePress = () => {
    if (isLocked) {
      setShowPremiumModal(true);
      onLockPress?.();
    } else {
      onPress?.();
    }
  };

  const handleUpgrade = () => {
    setShowPremiumModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        <SpaceCard
          {...spaceCardProps}
          onPress={handlePress}
          style={[
            spaceCardProps.style,
            isLocked && styles.lockedCard
          ]}
        />
        
        {isLocked && (
          <View style={[styles.lockOverlay, { backgroundColor: colors.background + 'E6' }]}>
            <View style={[styles.lockIcon, { backgroundColor: colors.primary }]}>
              <FontAwesome name="lock" size={16} color={colors['primary-foreground']} />
            </View>
            <View style={styles.lockText}>
              <Text style={[TextStyles.caption.small, { color: colors.foreground, fontWeight: '600' }]}>
                Premium
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {lockReason}
              </Text>
            </View>
          </View>
        )}
      </View>

      <PremiumLockModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Unlock All Spaces"
        description="Access all your spaces with Premium"
        benefits={benefits}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.7,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockText: {
    alignItems: 'center',
  },
});
