import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PremiumSpaceCard from './PremiumSpaceCard';
import SpaceCard from './SpaceCard';

export default function PremiumLockDemo() {
  const colors = useThemeColors();
  const [showDemo, setShowDemo] = useState(false);

  const demoSpaces = [
    { id: '1', name: 'Free Space 1', description: 'This space is free to access', icon: '📂' },
    { id: '2', name: 'Free Space 2', description: 'Another free space', icon: '📁' },
    { id: '3', name: 'Premium Space 1', description: 'This space requires Premium', icon: '🔒' },
    { id: '4', name: 'Free Space 3', description: 'Yet another free space', icon: '📂' },
    { id: '5', name: 'Free Space 4', description: 'One more free space', icon: '📁' },
    { id: '6', name: 'Premium Space 2', description: 'Another premium space', icon: '🔒' },
  ];

  if (!showDemo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          Premium Lock Demo
        </Text>
        <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginBottom: 24 }]}>
          See how spaces are locked with premium features
        </Text>
        <TouchableOpacity
          onPress={() => setShowDemo(true)}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
            Show Demo
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Premium Lock Demo
        </Text>
        <TouchableOpacity
          onPress={() => setShowDemo(false)}
          style={[styles.closeButton, { backgroundColor: colors.muted }]}
        >
          <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
        </TouchableOpacity>
      </View>

      <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginBottom: 24 }]}>
        Every 3rd space (starting from the 2nd) is locked and requires Premium
      </Text>

      <View style={styles.spaceGrid}>
        {demoSpaces.map((space, index) => {
          const isLocked = index > 0 && (index + 1) % 3 === 0;
          const SpaceComponent = isLocked ? PremiumSpaceCard : SpaceCard;
          
          return (
            <SpaceComponent
              key={space.id}
              name={space.name}
              description={space.description}
              membersCount={Math.floor(Math.random() * 10) + 1}
              icon={space.icon}
              isArchived={false}
              createdAt={new Date()}
              tileSize="medium"
              onPress={() => console.log('Space pressed:', space.name)}
              onToggleArchive={() => console.log('Toggle archive:', space.name)}
              isLocked={isLocked}
              lockReason="This space requires Premium"
            />
          );
        })}
      </View>

      <View style={[styles.info, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FontAwesome name="info-circle" size={20} color={colors.primary} />
        <Text style={[TextStyles.body.small, { color: colors.foreground, marginLeft: 12, flex: 1 }]}>
          Locked spaces show a premium overlay and display a popup when clicked, encouraging users to upgrade.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  spaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
