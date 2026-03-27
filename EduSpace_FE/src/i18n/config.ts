import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { vi } from './locales/vi';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            vi: { translation: vi }
        },
        lng: 'vi',
        fallbackLng: 'vi',
        supportedLngs: ['vi', 'en'],
        detection: {
            // Keep user's explicit choice first; otherwise default to Vietnamese.
            order: ['localStorage', 'cookie'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
