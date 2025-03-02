// Note: This component is no longer needed in App Router
// Use the generateMetadata function instead for SEO

import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalPath?: string;
}

/**
 * Generate metadata for App Router pages
 */
export function generateMetadata({
  title,
  description,
  keywords,
  ogImage = '/images/og-image.jpg',
  canonicalPath = '',
}: SEOProps): Metadata {
  // Create the canonical URL
  const siteUrl = 'https://sensebycbd.com';
  
  return {
    title,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    openGraph: {
      title,
      description,
      images: [`${siteUrl}${ogImage}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}${ogImage}`],
    },
  };
}
