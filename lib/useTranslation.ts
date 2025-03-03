'use client';

import { useSiteConfig } from './use-site-config';
import en from '../public/locales/en/common.json';
import nl from '../public/locales/nl/common.json';
import de from '../public/locales/de/common.json';
import fr from '../public/locales/fr/common.json';

// Define the translations object
const translations = {
  en,
  nl,
  de,
  fr,
};

// Define the type for the translations
export type Translations = typeof en & {
  product?: {
    addToCart: string;
    addedToCart: string;
    viewCart: string;
    quantity: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    description: string;
    specifications: string;
    reviews: string;
    relatedProducts: string;
    strength: string;
    volume: string;
    count: string;
    ingredients: string;
    usage: string;
    benefits: string;
    writeReview: string;
    submitReview: string;
    reviewPlaceholder: string;
    rating: string;
    noReviews: string;
    loginToReview: string;
    thankYouReview: string;
    productDetails: string;
  };
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
  testimonials?: {
    title: string;
    readMore: string;
    badge: string;
    subtitle: string;
    verifiedPurchases: string;
    averageRating: string;
    happyCustomers: string;
  };
  faq?: {
    title: string;
    subtitle: string;
    badge: string;
    searchPlaceholder: string;
    noResults: string;
    categories: {
      all: string;
      general: string;
      usage: string;
      effects: string;
      shipping: string;
    };
    questions: {
      whatIsCbd: {
        question: string;
        answer: string;
      };
      isLegal: {
        question: string;
        answer: string;
      };
      howToUseOils: {
        question: string;
        answer: string;
      };
      howToUseTopicals: {
        question: string;
        answer: string;
      };
      feelHigh: {
        question: string;
        answer: string;
      };
      howLong: {
        question: string;
        answer: string;
      };
      sideEffects: {
        question: string;
        answer: string;
      };
      shipping: {
        question: string;
        answer: string;
      };
      international: {
        question: string;
        answer: string;
      };
    };
    recommendedProducts: string;
    fullSpectrumOil: string;
    topicalCream: string;
    stillHaveQuestions: string;
    supportText: string;
    contactSupport: string;
  };
};

/**
 * Custom hook for translations
 * @returns The translation object for the current locale
 */
export const useTranslation = () => {
  const { config } = useSiteConfig();
  
  // Get the language from the domain configuration or fallback to 'en'
  let locale = 'en';
  
  if (config && config.domains) {
    // Try to get the current hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // Find the domain configuration that matches the hostname
    const domainConfig = config.domains[hostname];
    if (domainConfig && domainConfig.language) {
      locale = domainConfig.language;
    } else {
      // Try to match without subdomain (e.g., www.example.com -> example.com)
      const baseDomain = hostname.split('.').slice(-2).join('.');
      const baseDomainConfig = config.domains[baseDomain];
      
      if (baseDomainConfig && baseDomainConfig.language) {
        locale = baseDomainConfig.language;
      }
    }
  }
  
  // Get the translations for the current locale or fallback to English
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  return {
    t,
    locale,
  };
};
