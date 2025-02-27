import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalPath?: string;
}

/**
 * SEO component for managing meta tags
 */
export const SEO = ({
  title,
  description,
  keywords,
  ogImage = '/images/og-image.jpg',
  canonicalPath = '',
}: SEOProps) => {
  const router = useRouter();
  const { locale = 'en' } = router;
  
  // Create the canonical URL
  const siteUrl = 'https://sensebycbd.com';
  const localizedCanonical = `${siteUrl}/${locale}${canonicalPath}`;
  
  // Create alternate links for each language
  const alternateLinks = ['en', 'nl', 'de', 'fr'].map(lang => ({
    hrefLang: lang,
    href: `${siteUrl}/${lang}${canonicalPath}`,
  }));

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={localizedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={localizedCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
      
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
    </Head>
  );
};
