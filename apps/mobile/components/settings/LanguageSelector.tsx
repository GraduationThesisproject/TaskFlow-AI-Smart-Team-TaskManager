import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, ScrollView, View as RNView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useLanguage, getAvailableLanguages, Language } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const colors = useThemeColors();
  const { language, setLanguage, getLanguageName, getLanguageFlag } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const availableLanguages = getAvailableLanguages();

  const handleLanguageSelect = async (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
    await setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
    setModalVisible(false);
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.languageInfo}>
            <Text style={styles.flag}>{currentLanguage?.flag || '🌐'}</Text>
            <View style={styles.languageDetails}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
                {currentLanguage?.name || 'Language'}
              </Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {currentLanguage?.code?.toUpperCase() || 'EN'}
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color={colors['muted-foreground']} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
                Select Language
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.muted }]}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesome name="times" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    { 
                      backgroundColor: selectedLanguage === lang.code ? colors.primary + '15' : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <View style={styles.languageItemContent}>
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <View style={styles.languageItemDetails}>
                      <Text style={[
                        TextStyles.body.medium, 
                        { 
                          color: selectedLanguage === lang.code ? colors.primary : colors.foreground,
                          fontWeight: selectedLanguage === lang.code ? '600' : '500'
                        }
                      ]}>
                        {lang.name}
                      </Text>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                        {lang.code.toUpperCase()}
                        {lang.rtl && ' • RTL'}
                      </Text>
                    </View>
                    {selectedLanguage === lang.code && (
                      <FontAwesome name="check" size={16} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageDetails: {
    flex: 1,
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageItemDetails: {
    flex: 1,
    gap: 2,
  },
});
