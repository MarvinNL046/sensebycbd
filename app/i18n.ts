'use client';

import { useParams } from 'next/navigation';
import { supportedLanguages, defaultLanguage } from '../middleware';

/**
 * Get the current language from the URL parameters
 */
export function useLanguage() {
  const params = useParams();
  const lang = params?.lang as string || defaultLanguage;
  
  // Ensure the language is supported, otherwise fallback to default
  return supportedLanguages.includes(lang) ? lang : defaultLanguage;
}

/**
 * Get the URL for a different language
 */
export function getLanguageUrl(currentUrl: string, newLang: string) {
  // Check if the URL already has a language prefix
  const urlParts = currentUrl.split('/').filter(Boolean);
  
  // Log for debugging
  console.log('Current URL:', currentUrl);
  console.log('URL parts:', urlParts);
  console.log('New language:', newLang);
  
  if (urlParts.length > 0 && supportedLanguages.includes(urlParts[0])) {
    // Replace the language prefix
    urlParts[0] = newLang;
  } else {
    // Add the language prefix
    urlParts.unshift(newLang);
  }
  
  const newUrl = `/${urlParts.join('/')}`;
  console.log('New URL:', newUrl);
  
  return newUrl;
}
