import { useRouter } from 'next/router';
import en from '../../public/locales/en/common.json';
import nl from '../../public/locales/nl/common.json';
import de from '../../public/locales/de/common.json';
import fr from '../../public/locales/fr/common.json';

// Define the translations object
const translations = {
  en,
  nl,
  de,
  fr,
};

// Define the type for the translations
export type Translations = typeof en;

/**
 * Custom hook for translations
 * @returns The translation object for the current locale
 */
export const useTranslation = () => {
  const router = useRouter();
  const { locale = 'en' } = router;
  
  // Get the translations for the current locale or fallback to English
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  return {
    t,
    locale,
  };
};
