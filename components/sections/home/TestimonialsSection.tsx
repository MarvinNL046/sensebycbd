'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../app/lib/useTranslation';
import Image from 'next/image';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

// Testimonial type
type Testimonial = {
  id: string;
  name: string;
  image: string;
  rating: number;
  text: string;
  product: string;
};

/**
 * Modern testimonials section for the homepage
 */
export const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Create a local translations object with fallbacks
  const testimonialTranslations = {
    title: (t.testimonials as any)?.title || "What Our Customers Say",
    readMore: (t.testimonials as any)?.readMore || "Read More",
    badge: (t.testimonials as any)?.badge || "Customer Stories",
    subtitle: (t.testimonials as any)?.subtitle || "Hear from our satisfied customers about how our CBD products have improved their lives",
    verifiedPurchases: (t.testimonials as any)?.verifiedPurchases || "Verified Purchases",
    averageRating: (t.testimonials as any)?.averageRating || "4.8/5 Average Rating",
    happyCustomers: (t.testimonials as any)?.happyCustomers || "1000+ Happy Customers"
  };
  
  // Intersection observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Mock testimonials data (in a real app, this would come from the database)
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      text: 'The CBD oil has been a game changer for my chronic back pain. I sleep better and feel more relaxed during the day.',
      product: 'Full Spectrum CBD Oil 1000mg'
    },
    {
      id: '2',
      name: 'Michael Chen',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 4,
      text: 'I\'ve been using the CBD cream for my arthritis and it has significantly reduced the inflammation. Very pleased with the results.',
      product: 'CBD Relief Cream 250mg'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      text: 'The CBD gummies have helped me manage my anxiety. They taste great and I feel calmer within 30 minutes of taking them.',
      product: 'CBD Gummies 300mg'
    }
  ];

  // Handle carousel navigation
  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => {
    goToSlide((activeIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    goToSlide((activeIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span 
        key={index} 
        className={`material-icons text-sm ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        star
      </span>
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-accent/30 relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.4),transparent_70%)] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.4),transparent_70%)] -z-10"></div>
      
      {/* Quote decoration */}
      <div className="absolute top-20 left-10 text-primary/5">
        <span className="material-icons text-[150px]">format_quote</span>
      </div>
      <div className="absolute bottom-20 right-10 text-primary/5 rotate-180">
        <span className="material-icons text-[150px]">format_quote</span>
      </div>
      
      <div className="container-custom">
        <div className="flex flex-col items-center mb-16">
          <Badge variant="outline" className="mb-4">{testimonialTranslations.badge}</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
            {testimonialTranslations.title}
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl">
            {testimonialTranslations.subtitle}
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 transition-all duration-700 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border-4 border-accent shadow-md">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          sizes="(max-width: 768px) 80px, 96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex mb-2">
                          {renderStars(testimonial.rating)}
                        </div>
                        <blockquote className="text-gray-700 italic text-lg mb-4 relative">
                          <span className="text-primary/20 absolute -left-2 -top-2 text-4xl">&ldquo;</span>
                          {testimonial.text}
                          <span className="text-primary/20 absolute -right-2 bottom-0 text-4xl">&rdquo;</span>
                        </blockquote>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h3 className="text-xl font-heading font-bold text-primary">
                            {testimonial.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="material-icons text-primary text-sm mr-1">shopping_bag</span>
                            <p className="text-primary-dark text-sm">
                              {testimonial.product}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <Button 
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 bg-white/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-md z-10 border-0"
                aria-label="Previous testimonial"
                disabled={isAnimating}
              >
                <span className="material-icons text-primary">chevron_left</span>
              </Button>
              <Button 
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 bg-white/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-md z-10 border-0"
                aria-label="Next testimonial"
                disabled={isAnimating}
              >
                <span className="material-icons text-primary">chevron_right</span>
              </Button>
            </>
          )}
          
          {/* Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full mx-1 transition-all duration-300 ${
                    activeIndex === index ? 'bg-primary w-8' : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  disabled={isAnimating}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-full py-2 px-4 flex items-center border border-accent">
            <span className="material-icons text-primary text-sm mr-1">verified_user</span>
            <span className="text-sm">{testimonialTranslations.verifiedPurchases}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-full py-2 px-4 flex items-center border border-accent">
            <span className="material-icons text-primary text-sm mr-1">star</span>
            <span className="text-sm">{testimonialTranslations.averageRating}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-full py-2 px-4 flex items-center border border-accent">
            <span className="material-icons text-primary text-sm mr-1">people</span>
            <span className="text-sm">{testimonialTranslations.happyCustomers}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
