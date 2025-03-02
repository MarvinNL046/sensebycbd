'use client';

import { useParams } from 'next/navigation';
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalPath?: string;
}

/**
 * SEO component for managing meta tags in App Router
 */
export const SEO = ({
  title,
  description,
  keywords,
  ogImage = '/images/og-image.jpg',
  canonicalPath = '',
}: SEOProps) => {
  const params = useParams();
  const locale = params?.locale || 'en';
  
  // Create the canonical URL
  const siteUrl = 'https://sensebycbd.com';
  const localizedCanonical = `${siteUrl}/${locale}${canonicalPath}`;
  
  // Create alternate links for each language
  const alternateLinks = ['en', 'nl', 'de', 'fr'].map(lang => ({
    hrefLang: lang,
    href: `${siteUrl}/${lang}${canonicalPath}`,
  }));

  return (
    <>
      {/* Canonical and alternate links */}
      <link rel="canonical" href={localizedCanonical} />
      {alternateLinks.map(link => (
        <link
          key={link.hrefLang}
          rel="alternate"
          hrefLang={link.hrefLang}
          href={link.href}
        />
      ))}
    </>
  );
};

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
