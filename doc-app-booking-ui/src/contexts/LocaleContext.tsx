import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, Translations, getTranslation } from '../constants/locales';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // Try to get saved locale from localStorage
    const saved = localStorage.getItem('app-locale');
    return (saved === 'en' || saved === 'ta') ? saved : 'en';
  });

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('app-locale', newLocale);
  };

  const value: LocaleContextType = {
    locale,
    setLocale: handleSetLocale,
    t: getTranslation(locale),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
