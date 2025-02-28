import { TranslatedSlug } from '../../types/product';

/**
 * Map of product slugs translations
 * This would ideally come from a database or CMS
 */
const productSlugMap: Record<string, TranslatedSlug> = {
  // CBD Oils
  'full-spectrum-cbd-oil-1000mg': {
    en: 'full-spectrum-cbd-oil-1000mg',
    nl: 'full-spectrum-cbd-olie-1000mg',
    de: 'full-spectrum-cbd-öl-1000mg',
    fr: 'huile-cbd-spectre-complet-1000mg',
  },
  'broad-spectrum-cbd-oil-500mg': {
    en: 'broad-spectrum-cbd-oil-500mg',
    nl: 'breed-spectrum-cbd-olie-500mg',
    de: 'breitspektrum-cbd-öl-500mg',
    fr: 'huile-cbd-large-spectre-500mg',
  },
  
  // Topicals
  'cbd-relief-cream-250mg': {
    en: 'cbd-relief-cream-250mg',
    nl: 'cbd-verzachtende-crème-250mg',
    de: 'cbd-erleichterungscreme-250mg',
    fr: 'crème-soulagement-cbd-250mg',
  },
  'cbd-massage-oil-500mg': {
    en: 'cbd-massage-oil-500mg',
    nl: 'cbd-massage-olie-500mg',
    de: 'cbd-massageöl-500mg',
    fr: 'huile-massage-cbd-500mg',
  },
  
  // Edibles
  'cbd-gummies-300mg': {
    en: 'cbd-gummies-300mg',
    nl: 'cbd-gummies-300mg',
    de: 'cbd-gummis-300mg',
    fr: 'gummies-cbd-300mg',
  },
  
  // Capsules
  'cbd-capsules-750mg': {
    en: 'cbd-capsules-750mg',
    nl: 'cbd-capsules-750mg',
    de: 'cbd-kapseln-750mg',
    fr: 'capsules-cbd-750mg',
  },
  
  // Pet CBD
  'pet-cbd-oil-250mg': {
    en: 'pet-cbd-oil-250mg',
    nl: 'huisdier-cbd-olie-250mg',
    de: 'haustier-cbd-öl-250mg',
    fr: 'huile-cbd-animaux-250mg',
  },
};

/**
 * Map of category slugs translations
 */
const categorySlugMap: Record<string, TranslatedSlug> = {
  'cbd-oils': {
    en: 'cbd-oils',
    nl: 'cbd-olien',
    de: 'cbd-öle',
    fr: 'huiles-cbd',
  },
  'topicals': {
    en: 'topicals',
    nl: 'topicals',
    de: 'topika',
    fr: 'topiques',
  },
  'edibles': {
    en: 'edibles',
    nl: 'eetbare-producten',
    de: 'essbare-produkte',
    fr: 'comestibles',
  },
  'capsules': {
    en: 'capsules',
    nl: 'capsules',
    de: 'kapseln',
    fr: 'capsules',
  },
  'pet-cbd': {
    en: 'pet-cbd',
    nl: 'huisdier-cbd',
    de: 'haustier-cbd',
    fr: 'cbd-animaux',
  },
};

/**
 * Get the translated slug for a product
 * @param baseSlug The base (English) slug
 * @param locale The target locale
 * @returns The translated slug or the base slug if no translation exists
 */
export function getTranslatedProductSlug(baseSlug: string, locale: string = 'en'): string {
  if (locale === 'en') return baseSlug;
  
  const translatedSlugs = productSlugMap[baseSlug];
  if (!translatedSlugs) return baseSlug;
  
  return translatedSlugs[locale as keyof TranslatedSlug] || baseSlug;
}

/**
 * Get the base (English) slug from a translated slug
 * @param translatedSlug The translated slug
 * @param locale The locale of the translated slug
 * @returns The base slug or the translated slug if no mapping exists
 */
export function getBaseProductSlug(translatedSlug: string, locale: string = 'en'): string {
  if (locale === 'en') return translatedSlug;
  
  // Find the entry in the map where the translated slug matches
  for (const [baseSlug, translations] of Object.entries(productSlugMap)) {
    if (translations[locale as keyof TranslatedSlug] === translatedSlug) {
      return baseSlug;
    }
  }
  
  return translatedSlug;
}

/**
 * Get the translated slug for a category
 * @param baseSlug The base (English) slug
 * @param locale The target locale
 * @returns The translated slug or the base slug if no translation exists
 */
export function getTranslatedCategorySlug(baseSlug: string, locale: string = 'en'): string {
  if (locale === 'en') return baseSlug;
  
  const translatedSlugs = categorySlugMap[baseSlug];
  if (!translatedSlugs) return baseSlug;
  
  return translatedSlugs[locale as keyof TranslatedSlug] || baseSlug;
}

/**
 * Get the base (English) slug from a translated category slug
 * @param translatedSlug The translated slug
 * @param locale The locale of the translated slug
 * @returns The base slug or the translated slug if no mapping exists
 */
export function getBaseCategorySlug(translatedSlug: string, locale: string = 'en'): string {
  if (locale === 'en') return translatedSlug;
  
  // Find the entry in the map where the translated slug matches
  for (const [baseSlug, translations] of Object.entries(categorySlugMap)) {
    if (translations[locale as keyof TranslatedSlug] === translatedSlug) {
      return baseSlug;
    }
  }
  
  return translatedSlug;
}
