'use client';

// Import homepage sections
import { HeroSection } from '../../components/sections/home/HeroSection';
import { FeaturedProducts } from '../../components/sections/home/FeaturedProducts';
import { CategoriesGrid } from '../../components/sections/home/CategoriesGrid';
import { BenefitsSection } from '../../components/sections/home/BenefitsSection';
import { TestimonialsSection } from '../../components/sections/home/TestimonialsSection';
import { HowItWorks } from '../../components/sections/home/HowItWorks';
import { NewsletterSection } from '../../components/sections/home/NewsletterSection';
import { FAQSection } from '../../components/sections/home/FAQSection';

/**
 * Localized homepage with all sections
 * Metadata is handled by the generateMetadata function in metadata.ts
 */
export default function LocalizedHomePage() {
  return (
    <div className="min-h-screen">
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
