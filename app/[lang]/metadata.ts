import { Metadata } from 'next';
import { supportedLanguages } from '../../middleware';

// Define metadata for the home page
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  return {
    title: 'SenseBy CBD | Premium CBD Products for Pain Relief and Wellness',
    description: 'Discover premium CBD products designed to alleviate pain and improve your overall wellness. High-quality, lab-tested CBD oils, creams, and more.',
    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        nl: '/nl',
        de: '/de',
        fr: '/fr',
      },
    },
  };
}
