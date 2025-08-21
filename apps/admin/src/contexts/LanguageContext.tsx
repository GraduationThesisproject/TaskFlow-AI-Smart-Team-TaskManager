import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage, Language, LanguageConfig } from '../hooks/useLanguage';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  supportedLanguages: LanguageConfig[];
  getLanguageConfig: (code: Language) => LanguageConfig | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageUtils = useLanguage();

  return (
    <LanguageContext.Provider value={languageUtils}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
