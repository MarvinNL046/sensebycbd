/**
 * Format a date string or Date object to a localized date string
 * @param date Date string or Date object
 * @param locale Locale string (e.g., 'en', 'nl', 'de', 'fr')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, locale: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
