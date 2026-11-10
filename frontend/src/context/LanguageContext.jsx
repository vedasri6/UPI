import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { te } from '../translations/te';

const LanguageContext = createContext();

const translationsMap = {
  en,
  te
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('upi_suraksha_lang');
    if (saved === 'te') return 'te';
    return 'en';
  });

  const changeLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'te') {
      setLanguageState(newLang);
      localStorage.setItem('upi_suraksha_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (language !== 'en' && language !== 'te') {
      setLanguageState('en');
      localStorage.setItem('upi_suraksha_lang', 'en');
    } else {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translationsMap[language] || en;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
