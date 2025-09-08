import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View, Card, Button, ButtonText } from '@/components/Themed';
import { useTheme, useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AccentColorTestScreen() {
  const { userPrimaryColor, setUserPrimaryColor } = useTheme();
  const colors = useThemeColors();

  const colorOptions = [
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Green', color: '#10B981' },
    { name: 'Purple', color: '#8B5CF6' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Orange', color: '#F59E0B' },
    { name: 'Red', color: '#EF4444' },
  ];

  const handleColorChange = async (color: string) => {
    await setUserPrimaryColor(color);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <FontAwesome name="paint-brush" size={24} color={colors.primary} />
            <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
              Accent Color Test
            </Text>
          </View>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Test accent color changes in real-time
          </Text>
        </Card>

        {/* Current Color Info */}
        <Card style={styles.infoCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Current Accent Color
          </Text>
          <View style={styles.infoRow}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Primary Color:
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
              {userPrimaryColor || colors.primary}
            </Text>
          </View>
          <View style={styles.colorDisplay}>
            <View style={[styles.colorSwatch, { backgroundColor: userPrimaryColor || colors.primary }]} />
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              This is your current accent color
            </Text>
          </View>
        </Card>

        {/* Color Selection */}
        <Card style={styles.controlsCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Choose Accent Color
          </Text>
          
          <View style={styles.colorGrid}>
            {colorOptions.map((colorOption) => (
              <TouchableOpacity
                key={colorOption.name}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: (userPrimaryColor || colors.primary) === colorOption.color ? colorOption.color + '20' : colors.card,
                    borderColor: (userPrimaryColor || colors.primary) === colorOption.color ? colorOption.color : colors.border,
                  }
                ]}
                onPress={() => handleColorChange(colorOption.color)}
              >
                <View style={[styles.colorCircle, { backgroundColor: colorOption.color }]}>
                  {(userPrimaryColor || colors.primary) === colorOption.color && (
                    <FontAwesome name="check" size={12} color="white" />
                  )}
                </View>
                <Text style={[TextStyles.caption.small, { color: colors.foreground, marginTop: 4 }]}>
                  {colorOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Live Preview */}
        <Card style={styles.previewCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Live Preview
          </Text>
          
          <View style={styles.previewGroup}>
            <Button variant="primary" style={styles.previewButton}>
              <ButtonText variant="primary">Primary Button</ButtonText>
            </Button>
            
            <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.previewHeader, { backgroundColor: userPrimaryColor || colors.primary }]}>
                <FontAwesome name="star" size={16} color="white" />
                <Text style={[TextStyles.body.small, { color: 'white', fontWeight: '600' }]}>
                  Sample Card Header
                </Text>
              </View>
              <View style={styles.previewContent}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  This card uses your accent color
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  Notice how the header color changes
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Reset Button */}
        <Card style={styles.resetCard}>
          <Button 
            variant="secondary" 
            onPress={() => setUserPrimaryColor(null)}
            style={styles.resetButton}
          >
            <ButtonText variant="secondary">
              <FontAwesome name="refresh" size={16} color={colors['secondary-foreground']} />
              <Text style={{ color: colors['secondary-foreground'], marginLeft: 8 }}>
                Reset to Default
              </Text>
            </ButtonText>
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  controlsCard: {
    gap: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    gap: 16,
  },
  previewGroup: {
    gap: 16,
  },
  previewButton: {
    width: '100%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  previewContent: {
    padding: 16,
    gap: 4,
  },
  resetCard: {
    alignItems: 'center',
  },
  resetButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
