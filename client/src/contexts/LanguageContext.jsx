import React, { createContext, useContext, useState, useEffect } from 'react';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';
import mr from '../locales/mr.json';
import pa from '../locales/pa.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';

import api from '../services/api';

const translations = { en, hi, gu, mr, pa, bn, ta, te, kn };

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', nativeLabel: 'हिंदी', nativeName: 'हिंदी', englishName: 'Hindi', name: 'Hindi', script: 'देवनागरी' },
  { code: 'en', label: 'English', nativeLabel: 'English', nativeName: 'English', englishName: 'English', name: 'English', script: 'Latin' },
  { code: 'gu', label: 'ગુજરાતી', nativeLabel: 'ગુજરાતી', nativeName: 'ગુજરાતી', englishName: 'Gujarati', name: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'mr', label: 'मराठी', nativeLabel: 'मराठी', nativeName: 'मराठी', englishName: 'Marathi', name: 'Marathi', script: 'देवनागरी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', nativeLabel: 'ਪੰਜਾਬੀ', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', name: 'Punjabi', script: 'ਗੁਰਮੁਖੀ' },
  { code: 'bn', label: 'বাংলা', nativeLabel: 'বাংলা', nativeName: 'বাংলা', englishName: 'Bengali', name: 'Bengali', script: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்', nativeLabel: 'தமிழ்', nativeName: 'தமிழ்', englishName: 'Tamil', name: 'Tamil', script: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు', nativeLabel: 'తెలుగు', nativeName: 'తెలుగు', englishName: 'Telugu', name: 'Telugu', script: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ', nativeLabel: 'ಕನ್ನಡ', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', name: 'Kannada', script: 'ಕನ್ನಡ' }
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('fasalniti_lang') || localStorage.getItem('fasalniti_lang') || 'hi';
  });

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLang(langCode);
      localStorage.setItem('fasalniti_lang', langCode);
      // If user is authenticated, sync preferredLanguage to profile
      const token = localStorage.getItem('token');
      if (token) {
        api.put('/auth/profile', { preferredLanguage: langCode }).catch(() => {});
      }
    }
  };

  const t = (key, defaultText) => {
    const dict = translations[currentLang] || translations.en;
    if (dict && dict[key] !== undefined) return dict[key];

    // Support nested dot notation: e.g. "schemes.title"
    if (key && typeof key === 'string' && key.includes('.')) {
      const parts = key.split('.');
      let val = dict;
      for (const p of parts) {
        if (val && typeof val === 'object' && val[p] !== undefined) {
          val = val[p];
        } else {
          val = undefined;
          break;
        }
      }
      if (val !== undefined && typeof val === 'string') return val;

      let enVal = translations.en;
      for (const p of parts) {
        if (enVal && typeof enVal === 'object' && enVal[p] !== undefined) {
          enVal = enVal[p];
        } else {
          enVal = undefined;
          break;
        }
      }
      if (enVal !== undefined && typeof enVal === 'string') return enVal;
    }

    if (translations.en && translations.en[key] !== undefined) return translations.en[key];
    return defaultText !== undefined ? defaultText : key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
