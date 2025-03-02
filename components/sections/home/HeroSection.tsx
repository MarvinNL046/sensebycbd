'use client';

import { useTranslation } from '../../../app/lib/useTranslation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';

/**
 * Modern hero section for the homepage with split layout and animations
 */
export const HeroSection = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Trust badges data
  const trustBadges = [
    { icon: 'verified', text: 'Lab Tested' },
    { icon: 'local_shipping', text: 'Free Shipping' },
    { icon: 'eco', text: 'Organic' },
    { icon: 'thumb_up', text: '5-Star Reviews' },
  ];
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent via-accent/50 to-white py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCAzLjk4LTEuNzggMy45OC0zLjk4bC4wMi0uMDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content - Text and CTA */}
          <div className={`transition-all duration-700 ease-out ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-primary px-4 py-1.5 mb-6 text-sm font-medium rounded-full">
              <span className="material-icons text-sm mr-1">spa</span> Premium CBD Products
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 leading-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-xl text-primary-dark mb-8 max-w-lg">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="relative overflow-hidden group">
                <span className="relative z-10">{t.hero.cta}</span>
                <span className="absolute inset-0 bg-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
              
              <Button variant="outline" size="lg" className="border-2">
                Learn More
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index} 
                  className={`flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm transition-all duration-700 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <span className="material-icons text-primary mr-2">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right content - Image */}
          <div className={`relative transition-all duration-700 ease-out ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src="https://images.unsplash.com/photo-1621363542567-31027c772ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" 
                alt="CBD Oil Products" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              
              {/* Floating product card */}
              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[200px] transform rotate-3 transition-transform hover:rotate-0 duration-300">
                <div className="text-sm font-bold text-primary mb-1">Bestseller</div>
                <div className="text-base font-heading font-bold mb-1">Premium CBD Oil</div>
                <div className="text-primary-dark text-sm mb-2">500mg | Full Spectrum</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">€39.95</span>
                  <Button size="sm" variant="secondary" className="h-8 px-3 py-1">
                    <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Floating review */}
            <div className="absolute top-10 -left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[180px] transform -rotate-3 transition-transform hover:rotate-0 duration-300">
              <div className="flex text-yellow-400 mb-2">
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
              </div>
              <div className="text-sm italic">&ldquo;Changed my life! I sleep better than ever.&rdquo;</div>
              <div className="text-xs text-primary-dark mt-2">- Sarah K.</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
};
