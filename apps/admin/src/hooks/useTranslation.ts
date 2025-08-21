import { useLanguageContext } from '../contexts/LanguageContext';
import { t } from '../translations';

export function useTranslation() {
  const { currentLanguage } = useLanguageContext();
  
  const translate = (key: string): string => {
    return t(currentLanguage, key);
  };
  
  return {
    t: translate,
    currentLanguage,
  };
}
