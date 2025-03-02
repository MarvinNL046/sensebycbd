'use client';

import { useTranslation } from '../../../lib/i18n/useTranslation';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

/**
 * Modern benefits of CBD section for the homepage
 */
export const BenefitsSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
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
  
  // Benefits data with icons
  const benefits = [
    {
      id: 'painRelief',
      icon: 'healing',
      title: t.benefits.painRelief,
      description: t.benefits.painReliefDesc,
      color: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/20',
    },
    {
      id: 'anxiety',
      icon: 'psychology',
      title: t.benefits.anxiety,
      description: t.benefits.anxietyDesc,
      color: 'from-secondary/10 to-secondary/5',
      iconBg: 'bg-secondary/20',
    },
    {
      id: 'sleep',
      icon: 'bedtime',
      title: t.benefits.sleep,
      description: t.benefits.sleepDesc,
      color: 'from-accent-dark/10 to-accent-dark/5',
      iconBg: 'bg-accent-dark/20',
    },
    {
      id: 'wellness',
      icon: 'spa',
      title: t.benefits.wellness,
      description: t.benefits.wellnessDesc,
      color: 'from-primary-light/10 to-primary-light/5',
      iconBg: 'bg-primary-light/20',
    },
  ];
  
  return (
    <section className="py-20 bg-white relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.3),transparent_70%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.3),transparent_70%)]"></div>
      </div>
      
      <div className="container-custom">
        <div className="flex flex-col items-center mb-16">
          <Badge variant="outline" className="mb-4">Why Choose CBD</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
            {t.benefits.title}
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl">
            Discover how our premium CBD products can enhance your daily wellness routine with these science-backed benefits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={benefit.id}
              className={`p-6 bg-gradient-to-br ${benefit.color} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative z-10">
                <div className={`${benefit.iconBg} rounded-2xl w-16 h-16 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <span className="material-icons text-primary text-3xl">
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-primary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-700">
                  {benefit.description}
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8 transition-transform duration-500 group-hover:scale-150"></div>
            </Card>
          ))}
        </div>
        
        {/* Scientific backing badge */}
        <div className="mt-16 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-full py-3 px-6 flex items-center border border-accent">
            <span className="material-icons text-primary mr-2">verified</span>
            <span className="text-sm font-medium">Backed by scientific research and third-party lab testing</span>
          </div>
        </div>
      </div>
    </section>
  );
};
