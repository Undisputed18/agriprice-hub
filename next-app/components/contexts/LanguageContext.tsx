'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LanguageContextType = {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isTranslating: boolean;
  setIsTranslating: (loading: boolean) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, isTranslating, setIsTranslating }}>
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
