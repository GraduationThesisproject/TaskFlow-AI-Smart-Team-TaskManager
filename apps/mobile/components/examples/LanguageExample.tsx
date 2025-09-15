import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { TextStyles } from '@/constants/Fonts';

/**
 * Example component showing how to use the language context
 * This demonstrates how to access current language, RTL status, and change language
 */
export default function LanguageExample() {
  const colors = useThemeColors();
  const { language, setLanguage, isRTL, getLanguageName, getLanguageFlag } = useLanguage();

  const handleLanguageChange = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
    console.log('Language changed to:', newLanguage);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
        Language Example
      </Text>
      
      <View style={styles.currentLanguage}>
        <Text style={styles.flag}>{getLanguageFlag(language)}</Text>
        <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
          Current: {getLanguageName(language)} ({language.toUpperCase()})
        </Text>
        {isRTL && (
          <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
            RTL Layout Active
          </Text>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            🇺🇸 English
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => handleLanguageChange('es')}
        >
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            🇪🇸 Español
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => handleLanguageChange('ar')}
        >
          <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
            🇸🇦 العربية
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  flag: {
    fontSize: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
