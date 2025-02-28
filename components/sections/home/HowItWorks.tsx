import { useTranslation } from '../../../lib/i18n/useTranslation';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

/**
 * Modern How CBD Works section for the homepage with interactive cards
 */
export const HowItWorks = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
  
  // Steps data with icons and colors
  const steps = [
    {
      id: 'step1',
      icon: 'science',
      title: 'Extraction',
      description: 'CBD is extracted from hemp plants using CO2 extraction for maximum purity and potency.',
      color: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    {
      id: 'step2',
      icon: 'biotech',
      title: 'Endocannabinoid System',
      description: 'CBD interacts with your body\'s endocannabinoid system, which regulates many physiological processes.',
      color: 'from-secondary/10 to-secondary/5',
      iconBg: 'bg-secondary/20',
      iconColor: 'text-secondary'
    },
    {
      id: 'step3',
      icon: 'psychology',
      title: 'Receptors',
      description: 'Unlike THC, CBD doesn\'t bind directly to cannabinoid receptors but influences them indirectly.',
      color: 'from-accent-dark/10 to-accent-dark/5',
      iconBg: 'bg-accent-dark/20',
      iconColor: 'text-accent-dark'
    },
    {
      id: 'step4',
      icon: 'balance',
      title: 'Balance',
      description: 'CBD helps restore balance (homeostasis) in the body, supporting overall wellness and relief.',
      color: 'from-primary-light/10 to-primary-light/5',
      iconBg: 'bg-primary-light/20',
      iconColor: 'text-primary-light'
    }
  ];
  
  return (
    <section className="py-20 bg-white relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.3),transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.3),transparent_70%)]"></div>
      </div>
      
      <div className="container-custom">
        <div className="flex flex-col items-center mb-16">
          <Badge variant="outline" className="mb-4">Educational</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
            How CBD Works
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl">
            Understanding the science behind CBD helps you make informed decisions about your wellness journey
          </p>
        </div>
        
        {/* Desktop version - Interactive cards */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection line with animated gradient */}
            <div className="absolute top-32 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary-light/20 z-0"></div>
            
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className="w-1/4 px-4 relative"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Step number with pulse animation */}
                  <div className={`absolute top-[5.85rem] left-1/2 -translate-x-1/2 bg-white text-primary border-2 ${
                    activeStep === index ? 'border-primary' : 'border-gray-200'
                  } w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-colors duration-300`}>
                    <span>{index + 1}</span>
                    {activeStep === index && (
                      <span className="absolute w-full h-full rounded-full bg-primary/20 animate-ping"></span>
                    )}
                  </div>
                  
                  {/* Card */}
                  <Card 
                    className={`bg-gradient-to-br ${step.color} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    } ${activeStep === index ? 'ring-2 ring-primary/20' : ''}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Icon */}
                    <div className={`${step.iconBg} rounded-full w-24 h-24 flex items-center justify-center mx-auto mt-8 mb-6 transition-transform duration-500 group-hover:scale-110 relative z-20`}>
                      <span className={`material-icons ${step.iconColor} text-4xl`}>
                        {step.icon}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center p-6 pt-0">
                      <h3 className="text-xl font-heading font-bold text-primary mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile version - Modern vertical timeline */}
        <div className="md:hidden">
          <div className="relative pl-12">
            {/* Timeline line with gradient */}
            <div className="absolute top-0 left-6 h-full w-1 bg-gradient-to-b from-primary via-secondary to-primary-light"></div>
            
            {/* Steps */}
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`mb-10 relative ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Step number with pulse effect */}
                <div className="absolute top-6 left-0 -translate-x-1/2 bg-white text-primary border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center font-bold z-10">
                  {index + 1}
                  <span className="absolute w-full h-full rounded-full bg-primary/20 animate-ping opacity-75"></span>
                </div>
                
                {/* Content */}
                <Card className={`bg-gradient-to-br ${step.color} backdrop-blur-sm border-0 shadow-lg p-6 overflow-hidden`}>
                  <div className="flex items-center mb-4">
                    <div className={`${step.iconBg} rounded-full w-12 h-12 flex items-center justify-center mr-4`}>
                      <span className={`material-icons ${step.iconColor} text-2xl`}>
                        {step.icon}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-primary">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 pl-16">
                    {step.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scientific backing badge */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-full py-3 px-6 flex items-center border border-accent">
            <span className="material-icons text-primary mr-2">verified</span>
            <span className="text-sm font-medium">Based on scientific research and clinical studies</span>
          </div>
        </div>
      </div>
    </section>
  );
};
