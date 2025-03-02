import { SEO, generateMetadata } from './components/SEO';
import { Suspense } from 'react';
import { Metadata } from 'next';

// Export metadata for the page
export const metadata: Metadata = generateMetadata({
  title: "SenseBy CBD - Premium CBD Products for a Better Life",
  description: "Discover premium CBD products for wellness, relaxation, and a better life. Shop our range of oils, edibles, topicals, and more.",
  keywords: "CBD, hemp, wellness, oils, edibles, topicals, relaxation, premium CBD",
  canonicalPath: "/"
});

// Import homepage sections
import { HeroSection } from '../components/sections/home/HeroSection';
import { FeaturedProducts } from '../components/sections/home/FeaturedProducts';
import { CategoriesGrid } from '../components/sections/home/CategoriesGrid';
import { BenefitsSection } from '../components/sections/home/BenefitsSection';
import { TestimonialsSection } from '../components/sections/home/TestimonialsSection';
import { HowItWorks } from '../components/sections/home/HowItWorks';
import { NewsletterSection } from '../components/sections/home/NewsletterSection';
import { FAQSection } from '../components/sections/home/FAQSection';

// Loading fallbacks
function SectionSkeleton() {
  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* SEO component */}
      <SEO 
        title="SenseBy CBD - Premium CBD Products for a Better Life"
        description="Discover premium CBD products for wellness, relaxation, and a better life. Shop our range of oils, edibles, topicals, and more."
        keywords="CBD, hemp, wellness, oils, edibles, topicals, relaxation, premium CBD"
        canonicalPath="/"
      />

      {/* Hero Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>
      
      {/* Featured Products */}
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      
      {/* Categories Grid */}
      <Suspense fallback={<SectionSkeleton />}>
        <CategoriesGrid />
      </Suspense>
      
      {/* Benefits of CBD */}
      <Suspense fallback={<SectionSkeleton />}>
        <BenefitsSection />
      </Suspense>
      
      {/* How CBD Works */}
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>
      
      {/* Testimonials */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
      
      {/* Newsletter Signup */}
      <Suspense fallback={<SectionSkeleton />}>
        <NewsletterSection />
      </Suspense>
      
      {/* FAQ Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>
    </div>
  );
}
