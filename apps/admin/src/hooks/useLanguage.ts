import { useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow-language') as Language;
      if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
        return saved;
      }
    }
    return 'en';
  });

  const changeLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow-language', language);
    }
    
    // Update document language attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }, []);

  // Initialize language on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getLanguageConfig: (code: Language) => SUPPORTED_LANGUAGES.find(lang => lang.code === code),
  };
}
