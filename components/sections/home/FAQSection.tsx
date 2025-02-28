import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';

// FAQ item type
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'usage' | 'shipping' | 'effects';
};

/**
 * Modern FAQ section for the homepage
 */
export const FAQSection = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
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
  
  // FAQ data with categories
  const faqs: FAQItem[] = [
    {
      id: 'faq1',
      question: 'What is CBD?',
      answer: 'CBD (cannabidiol) is a naturally occurring compound found in the cannabis plant. Unlike THC, CBD is non-psychoactive, meaning it doesn&apos;t cause a "high." It&apos;s known for its potential therapeutic benefits, including pain relief, anxiety reduction, and improved sleep.',
      category: 'general'
    },
    {
      id: 'faq2',
      question: 'Is CBD legal?',
      answer: 'CBD derived from hemp (containing less than 0.3% THC) is legal at the federal level in many countries, including the United States. However, regulations vary by country and state/province, so it&apos;s important to check your local laws.',
      category: 'general'
    },
    {
      id: 'faq3',
      question: 'How do I use CBD oils?',
      answer: 'CBD oils are typically placed under the tongue (sublingual) for 60-90 seconds before swallowing. This method allows for faster absorption into the bloodstream. Start with a low dose (5-10mg) and gradually increase until you find your optimal dose.',
      category: 'usage'
    },
    {
      id: 'faq4',
      question: 'How do I apply CBD topicals?',
      answer: 'Apply CBD topicals directly to the affected area and massage gently until absorbed. They can be used as needed throughout the day. For best results, apply to clean, dry skin and wash hands after application unless treating hand areas.',
      category: 'usage'
    },
    {
      id: 'faq5',
      question: 'Will CBD make me feel high?',
      answer: 'No, CBD does not produce the psychoactive effects associated with THC. Our products contain less than 0.3% THC, which is not enough to cause intoxication. You may feel relaxed or experience pain relief, but you won&apos;t feel "high."',
      category: 'effects'
    },
    {
      id: 'faq6',
      question: 'How long does it take for CBD to work?',
      answer: 'The onset time varies by product and individual. Sublingual oils typically take effect within 15-30 minutes. Topicals may work within minutes for localized relief. Edibles and capsules can take 1-2 hours as they pass through the digestive system.',
      category: 'effects'
    },
    {
      id: 'faq7',
      question: 'Are there any side effects?',
      answer: 'CBD is generally well-tolerated, but some people may experience mild side effects such as drowsiness, dry mouth, or changes in appetite. CBD can also interact with certain medications, so consult with a healthcare professional if you&apos;re taking prescription drugs.',
      category: 'effects'
    },
    {
      id: 'faq8',
      question: 'How do you ship your products?',
      answer: 'We ship all orders via tracked courier services to ensure safe and timely delivery. Orders are processed within 24-48 hours and typically arrive within 3-5 business days depending on your location.',
      category: 'shipping'
    },
    {
      id: 'faq9',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries where CBD is legal. International shipping typically takes 7-14 business days. Please note that customers are responsible for any customs fees or import duties that may apply.',
      category: 'shipping'
    }
  ];
  
  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group FAQs by category for the tabs
  const faqsByCategory = {
    all: filteredFaqs,
    general: filteredFaqs.filter(faq => faq.category === 'general'),
    usage: filteredFaqs.filter(faq => faq.category === 'usage'),
    effects: filteredFaqs.filter(faq => faq.category === 'effects'),
    shipping: filteredFaqs.filter(faq => faq.category === 'shipping'),
  };
  
  // Category labels
  const categoryLabels = {
    all: 'All Questions',
    general: 'General',
    usage: 'Usage & Dosage',
    effects: 'Effects & Benefits',
    shipping: 'Shipping & Delivery',
  };
  
  return (
    <section className="py-20 bg-gradient-to-br from-white to-accent/20 relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.3),transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.3),transparent_70%)]"></div>
      </div>
      
      {/* Question mark decorations */}
      <div className="absolute top-20 left-10 text-primary/5 -z-5">
        <span className="material-icons text-[150px]">help_outline</span>
      </div>
      <div className="absolute bottom-20 right-10 text-primary/5 -z-5 rotate-12">
        <span className="material-icons text-[100px]">help</span>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Badge variant="outline" className="mb-4">Knowledge Base</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-center text-gray-600 max-w-2xl">
            Find answers to common questions about CBD, our products, and how they can benefit your wellness journey
          </p>
        </div>
        
        {/* Search bar */}
        <div className={`max-w-md mx-auto mb-8 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-icons">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>
        
        <Card className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <div className="px-6 pt-6">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white">General</TabsTrigger>
                <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-white">Usage</TabsTrigger>
                <TabsTrigger value="effects" className="data-[state=active]:bg-primary data-[state=active]:text-white">Effects</TabsTrigger>
                <TabsTrigger value="shipping" className="data-[state=active]:bg-primary data-[state=active]:text-white">Shipping</TabsTrigger>
              </TabsList>
            </div>
            
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <TabsContent key={category} value={category} className="p-6">
                {categoryFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
                    <p className="text-gray-600">No questions found matching your search.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className={`mb-4 border border-gray-100 rounded-lg overflow-hidden bg-white/50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow ${
                          searchQuery && (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) 
                            ? 'ring-2 ring-primary/20' 
                            : ''
                        }`}
                      >
                        <AccordionTrigger className="px-4 py-4 text-lg font-heading font-semibold text-primary hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 text-gray-700">
                          <p className="pb-2">{faq.answer}</p>
                          
                          {/* Related products for some questions */}
                          {faq.category === 'usage' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm font-medium text-primary mb-2">Recommended products:</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  Full Spectrum CBD Oil
                                </Badge>
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  CBD Topical Cream
                                </Badge>
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
        
        {/* Still have questions */}
        <div className={`mt-12 max-w-2xl mx-auto text-center transition-all duration-700 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <h3 className="text-xl font-heading font-bold text-primary mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our customer support team is here to help. Reach out to us and we&apos;ll get back to you as soon as possible.
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <span className="material-icons mr-2">contact_support</span>
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};
