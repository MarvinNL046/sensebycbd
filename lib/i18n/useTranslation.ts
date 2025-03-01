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
export type Translations = typeof en & {
  blog?: {
    title: string;
    readMore: string;
    by: string;
    categories: string;
    tags: string;
    recentPosts: string;
    relatedPosts: string;
    noPosts: string;
    comments: string;
    leaveComment: string;
    yourName: string;
    yourEmail: string;
    commentPlaceholder: string;
    submitComment: string;
    loginToComment: string;
    thankYouComment: string;
    noComments: string;
    search: string;
    searchResults: string;
    noSearchResults: string;
    backToBlog: string;
    publishedOn: string;
    share: string;
  };
};

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
