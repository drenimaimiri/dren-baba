import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import sq from './locales/sq/translation.json';
import en from './locales/en/translation.json';
import sr from './locales/sr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sq: { translation: sq },
      en: { translation: en },
      sr: { translation: sr },
    },
    fallbackLng: 'sq',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
