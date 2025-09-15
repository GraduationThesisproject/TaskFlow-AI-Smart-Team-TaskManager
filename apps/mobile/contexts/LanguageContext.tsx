import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isRTL: boolean;
  getLanguageName: (code: Language) => string;
  getLanguageFlag: (code: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

const LANGUAGE_STORAGE_KEY = 'taskflow-mobile-language';

// Language configurations
const LANGUAGE_CONFIG = {
  en: { name: 'English', flag: '🇺🇸', rtl: false },
  es: { name: 'Español', flag: '🇪🇸', rtl: false },
  fr: { name: 'Français', flag: '🇫🇷', rtl: false },
  de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
  it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
  pt: { name: 'Português', flag: '🇵🇹', rtl: false },
  ru: { name: 'Русский', flag: '🇷🇺', rtl: false },
  ja: { name: '日本語', flag: '🇯🇵', rtl: false },
  ko: { name: '한국어', flag: '🇰🇷', rtl: false },
  zh: { name: '中文', flag: '🇨🇳', rtl: false },
  ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
  hi: { name: 'हिन्दी', flag: '🇮🇳', rtl: false },
} as const;

export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en',
  storageKey = LANGUAGE_STORAGE_KEY
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from storage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  // Update document language and direction when language changes
  useEffect(() => {
    if (isInitialized && typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [language, isInitialized]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(storageKey);
      if (savedLanguage && savedLanguage in LANGUAGE_CONFIG) {
        setLanguageState(savedLanguage as Language);
      }
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      setIsInitialized(true);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem(storageKey, newLanguage);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  };

  const isRTL = LANGUAGE_CONFIG[language]?.rtl || false;

  const getLanguageName = (code: Language): string => {
    return LANGUAGE_CONFIG[code]?.name || code;
  };

  const getLanguageFlag = (code: Language): string => {
    return LANGUAGE_CONFIG[code]?.flag || '🌐';
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    getLanguageName,
    getLanguageFlag,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook to get just the language
export function useLanguageCode() {
  const { language } = useLanguage();
  return language;
}

// Hook to check if current language is RTL
export function useIsRTL() {
  const { isRTL } = useLanguage();
  return isRTL;
}

// Utility function to get all available languages
export function getAvailableLanguages(): Array<{ code: Language; name: string; flag: string; rtl: boolean }> {
  return Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
    code: code as Language,
    name: config.name,
    flag: config.flag,
    rtl: config.rtl,
  }));
}
