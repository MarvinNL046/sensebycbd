'use client';

import { useSiteConfig } from '../../lib/use-site-config';
import en from '../../public/locales/en/common.json';

// Define the default translations
const defaultTranslations = en;

/**
 * Custom hook for translations
 * @returns The translation object
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
  
  // For now, we're using English translations for all languages
  // In a real implementation, you would load different translation files based on the locale
  const t = defaultTranslations;
  
  return {
    t,
    locale,
  };
};

// Export the type for the translations
export type Translations = typeof defaultTranslations;
