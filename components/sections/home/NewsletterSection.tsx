'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

/**
 * Modern newsletter signup section for the homepage
 */
export const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setStatus('loading');
    
    // In a real app, this would call an API to subscribe the user
    // For now, we'll simulate a successful subscription after a delay
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setStatus('success');
      setEmail('');
    } catch (error) {
      // Error
      setStatus('error');
      setErrorMessage(t.newsletter.error);
    }
  };
  
  // Benefits of subscribing
  const benefits = [
    { icon: 'local_offer', text: 'Exclusive discounts and promotions' },
    { icon: 'new_releases', text: 'New product announcements' },
    { icon: 'science', text: 'CBD research and education' },
    { icon: 'tips_and_updates', text: 'Usage tips and wellness advice' },
  ];
  
  return (
    <section 
      className="py-20 bg-gradient-to-br from-primary via-primary to-primary-dark text-white relative overflow-hidden" 
      ref={sectionRef}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="50" fill="url(#radialGradient)" />
            <circle cx="100" cy="100" r="50" fill="url(#radialGradient)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className={`transition-all duration-700 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-1.5 mb-6">
              Stay Connected
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t.newsletter.title}
            </h2>
            
            <p className="text-xl mb-8 text-white/80 max-w-lg">
              {t.newsletter.subtitle}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3"
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="bg-white/10 rounded-full p-2">
                    <span className="material-icons text-accent">{benefit.icon}</span>
                  </div>
                  <span className="text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Form */}
          <div className={`transition-all duration-700 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <Card className="bg-white/10 backdrop-blur-sm border-0 shadow-lg p-8 rounded-xl">
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-3xl text-green-400">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4">Thank You!</h3>
                  <p className="text-white/80 mb-6">
                    {t.newsletter.success}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setStatus('idle')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Subscribe Another Email
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-heading font-bold mb-4">Join Our Newsletter</h3>
                  <p className="text-white/80 mb-6">
                    Get the latest CBD news, product updates, and special offers delivered directly to your inbox.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <span className="material-icons">email</span>
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.newsletter.placeholder}
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          disabled={status === 'loading'}
                        />
                      </div>
                      {status === 'error' && (
                        <p className="text-red-300 text-sm mt-1">
                          {errorMessage}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent-dark text-primary font-bold py-3"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin mr-2">
                            <span className="material-icons text-sm">refresh</span>
                          </span>
                          {t.newsletter.button}
                        </span>
                      ) : (
                        t.newsletter.button
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-white/60 text-xs mt-4 text-center">
                    By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
