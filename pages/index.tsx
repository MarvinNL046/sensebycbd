import { GetStaticProps } from 'next';
import { useTranslation } from '../lib/i18n/useTranslation';
import { SEO } from '../lib/seo/SEO';

// Import homepage sections
import { HeroSection } from '../components/sections/home/HeroSection';
import { FeaturedProducts } from '../components/sections/home/FeaturedProducts';
import { CategoriesGrid } from '../components/sections/home/CategoriesGrid';
import { BenefitsSection } from '../components/sections/home/BenefitsSection';
import { TestimonialsSection } from '../components/sections/home/TestimonialsSection';
import { HowItWorks } from '../components/sections/home/HowItWorks';
import { NewsletterSection } from '../components/sections/home/NewsletterSection';
import { FAQSection } from '../components/sections/home/FAQSection';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <SEO 
        title={t.seo.homeTitle}
        description={t.seo.homeDescription}
        keywords={t.seo.homeKeywords}
        canonicalPath="/"
      />

      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Categories Grid */}
      <CategoriesGrid />
      
      {/* Benefits of CBD */}
      <BenefitsSection />
      
      {/* How CBD Works */}
      <HowItWorks />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Newsletter Signup */}
      <NewsletterSection />
      
      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      // We'll add more props here later
    },
    // Enable ISR with a revalidation period
    revalidate: 60 * 60, // Revalidate every hour
  };
};
