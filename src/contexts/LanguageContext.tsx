import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { t } from '../utils/translations';

export type Language = 'en' | 'ar';

type LanguageContextType = {
  lang: Language;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { lang } = useParams<{ lang: Language }>();
  const currentLang = (lang === 'ar' || lang === 'en') ? lang : 'en';
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    document.title = t('siteTitle', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang: currentLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
