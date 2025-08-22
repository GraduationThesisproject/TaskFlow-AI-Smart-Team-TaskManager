import { createContext, useContext, ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export type Language = 'en' | 'es' | 'fr' | 'de';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

export interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  getLanguageConfig: (language: Language) => LanguageConfig | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const languageHook = useLanguage();
  
  return (
    <LanguageContext.Provider value={languageHook}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};
