import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View, Card, Button, ButtonText } from '@/components/Themed';
import { useTheme, useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ThemeTestScreen() {
  const { theme, toggleTheme, isSystemTheme, setIsSystemTheme } = useTheme();
  const colors = useThemeColors();

  const handleSystemThemeToggle = async () => {
    await setIsSystemTheme(!isSystemTheme);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <FontAwesome name="paint-brush" size={24} color={colors.primary} />
            <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
              Theme Test
            </Text>
          </View>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Test the theme system functionality
          </Text>
        </Card>

        {/* Current Theme Info */}
        <Card style={styles.infoCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Current Theme
          </Text>
          <View style={styles.infoRow}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Theme:
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
              {theme}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              System Theme:
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
              {isSystemTheme ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </Card>

        {/* Theme Controls */}
        <Card style={styles.controlsCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Theme Controls
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button onPress={toggleTheme} style={styles.themeButton}>
              <ButtonText>
                <FontAwesome name="refresh" size={16} color={colors['primary-foreground']} />
                <Text style={{ color: colors['primary-foreground'], marginLeft: 8 }}>
                  Toggle Theme
                </Text>
              </ButtonText>
            </Button>

            <Button 
              onPress={handleSystemThemeToggle} 
              style={[styles.themeButton, { backgroundColor: colors.secondary }]}
            >
              <ButtonText style={{ color: colors['secondary-foreground'] }}>
                <FontAwesome name="desktop" size={16} color={colors['secondary-foreground']} />
                <Text style={{ color: colors['secondary-foreground'], marginLeft: 8 }}>
                  {isSystemTheme ? 'Disable' : 'Enable'} System Theme
                </Text>
              </ButtonText>
            </Button>
          </View>
        </Card>

        {/* Color Palette */}
        <Card style={styles.paletteCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Color Palette
          </Text>
          
          <View style={styles.colorGrid}>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.background }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Background</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.foreground }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Foreground</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.card }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Card</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Primary</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Secondary</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Accent</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.muted }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Muted</Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.border }]} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Border</Text>
            </View>
          </View>
        </Card>

        {/* Component Examples */}
        <Card style={styles.examplesCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Component Examples
          </Text>
          
          <View style={styles.exampleGroup}>
            <Button variant="primary" style={styles.exampleButton}>
              <ButtonText variant="primary">Primary Button</ButtonText>
            </Button>
            
            <Button variant="secondary" style={styles.exampleButton}>
              <ButtonText variant="secondary">Secondary Button</ButtonText>
            </Button>
            
            <Button variant="destructive" style={styles.exampleButton}>
              <ButtonText variant="destructive">Destructive Button</ButtonText>
            </Button>
          </View>
          
          <View style={styles.textExamples}>
            <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
              Heading 1
            </Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
              Heading 2
            </Text>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              Heading 3
            </Text>
            <Text style={[TextStyles.body.large, { color: colors.foreground }]}>
              Large body text
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
              Medium body text
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Small muted text
            </Text>
          </View>
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
  controlsCard: {
    gap: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteCard: {
    gap: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorRow: {
    alignItems: 'center',
    width: '30%',
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  examplesCard: {
    gap: 16,
  },
  exampleGroup: {
    gap: 12,
  },
  exampleButton: {
    width: '100%',
  },
  textExamples: {
    gap: 8,
  },
});
