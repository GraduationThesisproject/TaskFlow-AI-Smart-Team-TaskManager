import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useTheme } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppearanceSettings: React.FC = () => {
  const colors = useThemeColors();
  const { theme, setTheme, isSystemTheme, setIsSystemTheme, userPrimaryColor, setUserPrimaryColor } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: 'sun-o',
      gradient: 'from-yellow-400 to-orange-500',
      active: !isSystemTheme && theme === 'light'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes',
      icon: 'moon-o',
      gradient: 'from-slate-700 to-slate-900',
      active: !isSystemTheme && theme === 'dark'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your OS preference',
      icon: 'desktop',
      gradient: 'from-blue-500 to-purple-600',
      active: isSystemTheme
    }
  ];

  const colorOptions = [
    { name: 'Blue', color: '#3B82F6', icon: 'circle' },
    { name: 'Green', color: '#10B981', icon: 'circle' },
    { name: 'Purple', color: '#8B5CF6', icon: 'circle' },
    { name: 'Pink', color: '#EC4899', icon: 'circle' },
    { name: 'Orange', color: '#F59E0B', icon: 'circle' },
    { name: 'Red', color: '#EF4444', icon: 'circle' },
  ];

  const handleThemeChange = async (themeId: string) => {
    if (themeId === 'system') {
      await setIsSystemTheme(true);
      return;
    }
    
    await setTheme(themeId as 'light' | 'dark');
  };

  const handleColorChange = async (color: string) => {
    await setUserPrimaryColor(color);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Theme Selection */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="paint-brush" size={20} color={colors.primary} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Theme Selection
          </Text>
        </View>
        
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
          Choose your preferred theme and appearance
        </Text>

        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.themeOption,
                {
                  backgroundColor: option.active ? colors.primary + '20' : colors.card,
                  borderColor: option.active ? colors.primary : colors.border,
                }
              ]}
              onPress={() => handleThemeChange(option.id)}
            >
              <View style={styles.themeOptionContent}>
                <View style={[styles.themeIcon, { backgroundColor: colors.primary }]}>
                  <FontAwesome name={option.icon as any} size={24} color={colors['primary-foreground']} />
                </View>
                <View style={styles.themeText}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
                    {option.name}
                  </Text>
                  <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                    {option.description}
                  </Text>
                </View>
                {option.active && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
                    <FontAwesome name="check" size={12} color={colors['primary-foreground']} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Accent Color */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="paint-brush" size={20} color={colors.accent} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Accent Color
          </Text>
        </View>
        
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
          Customize the primary color used throughout the interface
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

        {/* Current Color Display */}
        <View style={[styles.currentColorDisplay, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <View style={[styles.currentColorCircle, { backgroundColor: userPrimaryColor || colors.primary }]} />
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Current accent color
          </Text>
        </View>
      </Card>

      {/* Preview Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="eye" size={20} color={colors.warning} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Preview
          </Text>
        </View>
        
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
          See how your theme and colors look
        </Text>

        <View style={styles.previewContainer}>
          <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.previewHeader, { backgroundColor: userPrimaryColor || colors.primary }]}>
              <FontAwesome name="star" size={16} color="white" />
              <Text style={[TextStyles.body.small, { color: 'white', fontWeight: '600' }]}>
                Sample Card
              </Text>
            </View>
            <View style={styles.previewContent}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                This is how your theme will look
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                With your selected accent color
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  themeOptions: {
    gap: 12,
  },
  themeOption: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeText: {
    flex: 1,
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
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
  currentColorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  currentColorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
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
});

export default AppearanceSettings;
