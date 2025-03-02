'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../app/lib/useTranslation';
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
  
  // Create a memoized translation getter function to avoid recreating the object on each render
  const getTranslation = useMemo(() => {
    return {
      getFaqTitle: () => (t as any).faq?.title || "Frequently Asked Questions",
      getFaqSubtitle: () => (t as any).faq?.subtitle || "Find answers to common questions about CBD, our products, and how they can benefit your wellness journey",
      getFaqBadge: () => (t as any).faq?.badge || "Knowledge Base",
      getSearchPlaceholder: () => (t as any).faq?.searchPlaceholder || "Search for answers...",
      getNoResults: () => (t as any).faq?.noResults || "No questions found matching your search.",
      getCategoryAll: () => (t as any).faq?.categories?.all || "All Questions",
      getCategoryGeneral: () => (t as any).faq?.categories?.general || "General",
      getCategoryUsage: () => (t as any).faq?.categories?.usage || "Usage & Dosage",
      getCategoryEffects: () => (t as any).faq?.categories?.effects || "Effects & Benefits",
      getCategoryShipping: () => (t as any).faq?.categories?.shipping || "Shipping & Delivery",
      getQuestionWhatIsCbd: () => (t as any).faq?.questions?.whatIsCbd?.question || "What is CBD?",
      getAnswerWhatIsCbd: () => (t as any).faq?.questions?.whatIsCbd?.answer || "CBD (cannabidiol) is a naturally occurring compound found in the cannabis plant. Unlike THC, CBD is non-psychoactive, meaning it doesn't cause a \"high.\" It's known for its potential therapeutic benefits, including pain relief, anxiety reduction, and improved sleep.",
      getQuestionIsLegal: () => (t as any).faq?.questions?.isLegal?.question || "Is CBD legal?",
      getAnswerIsLegal: () => (t as any).faq?.questions?.isLegal?.answer || "CBD derived from hemp (containing less than 0.3% THC) is legal at the federal level in many countries, including the United States. However, regulations vary by country and state/province, so it's important to check your local laws.",
      getQuestionHowToUseOils: () => (t as any).faq?.questions?.howToUseOils?.question || "How do I use CBD oils?",
      getAnswerHowToUseOils: () => (t as any).faq?.questions?.howToUseOils?.answer || "CBD oils are typically placed under the tongue (sublingual) for 60-90 seconds before swallowing. This method allows for faster absorption into the bloodstream. Start with a low dose (5-10mg) and gradually increase until you find your optimal dose.",
      getQuestionHowToUseTopicals: () => (t as any).faq?.questions?.howToUseTopicals?.question || "How do I apply CBD topicals?",
      getAnswerHowToUseTopicals: () => (t as any).faq?.questions?.howToUseTopicals?.answer || "Apply CBD topicals directly to the affected area and massage gently until absorbed. They can be used as needed throughout the day. For best results, apply to clean, dry skin and wash hands after application unless treating hand areas.",
      getQuestionFeelHigh: () => (t as any).faq?.questions?.feelHigh?.question || "Will CBD make me feel high?",
      getAnswerFeelHigh: () => (t as any).faq?.questions?.feelHigh?.answer || "No, CBD does not produce the psychoactive effects associated with THC. Our products contain less than 0.3% THC, which is not enough to cause intoxication. You may feel relaxed or experience pain relief, but you won't feel \"high.\"",
      getQuestionHowLong: () => (t as any).faq?.questions?.howLong?.question || "How long does it take for CBD to work?",
      getAnswerHowLong: () => (t as any).faq?.questions?.howLong?.answer || "The onset time varies by product and individual. Sublingual oils typically take effect within 15-30 minutes. Topicals may work within minutes for localized relief. Edibles and capsules can take 1-2 hours as they pass through the digestive system.",
      getQuestionSideEffects: () => (t as any).faq?.questions?.sideEffects?.question || "Are there any side effects?",
      getAnswerSideEffects: () => (t as any).faq?.questions?.sideEffects?.answer || "CBD is generally well-tolerated, but some people may experience mild side effects such as drowsiness, dry mouth, or changes in appetite. CBD can also interact with certain medications, so consult with a healthcare professional if you're taking prescription drugs.",
      getQuestionShipping: () => (t as any).faq?.questions?.shipping?.question || "How do you ship your products?",
      getAnswerShipping: () => (t as any).faq?.questions?.shipping?.answer || "We ship all orders via tracked courier services to ensure safe and timely delivery. Orders are processed within 24-48 hours and typically arrive within 3-5 business days depending on your location.",
      getQuestionInternational: () => (t as any).faq?.questions?.international?.question || "Do you ship internationally?",
      getAnswerInternational: () => (t as any).faq?.questions?.international?.answer || "Yes, we ship to most countries where CBD is legal. International shipping typically takes 7-14 business days. Please note that customers are responsible for any customs fees or import duties that may apply.",
      getRecommendedProducts: () => (t as any).faq?.recommendedProducts || "Recommended products:",
      getFullSpectrumOil: () => (t as any).faq?.fullSpectrumOil || "Full Spectrum CBD Oil",
      getTopicalCream: () => (t as any).faq?.topicalCream || "CBD Topical Cream",
      getStillHaveQuestions: () => (t as any).faq?.stillHaveQuestions || "Still have questions?",
      getSupportText: () => (t as any).faq?.supportText || "Our customer support team is here to help. Reach out to us and we'll get back to you as soon as possible.",
      getContactSupport: () => (t as any).faq?.contactSupport || "Contact Support"
    };
  }, [t]);
  
  // Create a local translations object with fallbacks
  const faqTranslations = useMemo(() => ({
    title: getTranslation.getFaqTitle(),
    subtitle: getTranslation.getFaqSubtitle(),
    badge: getTranslation.getFaqBadge(),
    searchPlaceholder: getTranslation.getSearchPlaceholder(),
    noResults: getTranslation.getNoResults(),
    categories: {
      all: getTranslation.getCategoryAll(),
      general: getTranslation.getCategoryGeneral(),
      usage: getTranslation.getCategoryUsage(),
      effects: getTranslation.getCategoryEffects(),
      shipping: getTranslation.getCategoryShipping()
    },
    questions: {
      whatIsCbd: {
        question: getTranslation.getQuestionWhatIsCbd(),
        answer: getTranslation.getAnswerWhatIsCbd()
      },
      isLegal: {
        question: getTranslation.getQuestionIsLegal(),
        answer: getTranslation.getAnswerIsLegal()
      },
      howToUseOils: {
        question: getTranslation.getQuestionHowToUseOils(),
        answer: getTranslation.getAnswerHowToUseOils()
      },
      howToUseTopicals: {
        question: getTranslation.getQuestionHowToUseTopicals(),
        answer: getTranslation.getAnswerHowToUseTopicals()
      },
      feelHigh: {
        question: getTranslation.getQuestionFeelHigh(),
        answer: getTranslation.getAnswerFeelHigh()
      },
      howLong: {
        question: getTranslation.getQuestionHowLong(),
        answer: getTranslation.getAnswerHowLong()
      },
      sideEffects: {
        question: getTranslation.getQuestionSideEffects(),
        answer: getTranslation.getAnswerSideEffects()
      },
      shipping: {
        question: getTranslation.getQuestionShipping(),
        answer: getTranslation.getAnswerShipping()
      },
      international: {
        question: getTranslation.getQuestionInternational(),
        answer: getTranslation.getAnswerInternational()
      }
    },
    recommendedProducts: getTranslation.getRecommendedProducts(),
    fullSpectrumOil: getTranslation.getFullSpectrumOil(),
    topicalCream: getTranslation.getTopicalCream(),
    stillHaveQuestions: getTranslation.getStillHaveQuestions(),
    supportText: getTranslation.getSupportText(),
    contactSupport: getTranslation.getContactSupport()
  }), [getTranslation]);
  
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
  
  // FAQ data with categories from translations
  const faqs: FAQItem[] = useMemo(() => [
    {
      id: 'faq1',
      question: faqTranslations.questions.whatIsCbd.question,
      answer: faqTranslations.questions.whatIsCbd.answer,
      category: 'general'
    },
    {
      id: 'faq2',
      question: faqTranslations.questions.isLegal.question,
      answer: faqTranslations.questions.isLegal.answer,
      category: 'general'
    },
    {
      id: 'faq3',
      question: faqTranslations.questions.howToUseOils.question,
      answer: faqTranslations.questions.howToUseOils.answer,
      category: 'usage'
    },
    {
      id: 'faq4',
      question: faqTranslations.questions.howToUseTopicals.question,
      answer: faqTranslations.questions.howToUseTopicals.answer,
      category: 'usage'
    },
    {
      id: 'faq5',
      question: faqTranslations.questions.feelHigh.question,
      answer: faqTranslations.questions.feelHigh.answer,
      category: 'effects'
    },
    {
      id: 'faq6',
      question: faqTranslations.questions.howLong.question,
      answer: faqTranslations.questions.howLong.answer,
      category: 'effects'
    },
    {
      id: 'faq7',
      question: faqTranslations.questions.sideEffects.question,
      answer: faqTranslations.questions.sideEffects.answer,
      category: 'effects'
    },
    {
      id: 'faq8',
      question: faqTranslations.questions.shipping.question,
      answer: faqTranslations.questions.shipping.answer,
      category: 'shipping'
    },
    {
      id: 'faq9',
      question: faqTranslations.questions.international.question,
      answer: faqTranslations.questions.international.answer,
      category: 'shipping'
    }
  ], [faqTranslations]);
  
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
          <Badge variant="outline" className="mb-4">{faqTranslations.badge}</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-4">
            {faqTranslations.title}
          </h2>
          <p className="mt-2 text-center text-gray-600 max-w-2xl">
            {faqTranslations.subtitle}
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
              placeholder={faqTranslations.searchPlaceholder}
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
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('all')}
                >
                  {faqTranslations.categories.all}
                </TabsTrigger>
                <TabsTrigger 
                  value="general" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('general')}
                >
                  {faqTranslations.categories.general}
                </TabsTrigger>
                <TabsTrigger 
                  value="usage" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('usage')}
                >
                  {faqTranslations.categories.usage}
                </TabsTrigger>
                <TabsTrigger 
                  value="effects" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('effects')}
                >
                  {faqTranslations.categories.effects}
                </TabsTrigger>
                <TabsTrigger 
                  value="shipping" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('shipping')}
                >
                  {faqTranslations.categories.shipping}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <TabsContent key={category} value={category} className="p-6">
                {categoryFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
                    <p className="text-gray-600">{faqTranslations.noResults}</p>
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
                              <p className="text-sm font-medium text-primary mb-2">{faqTranslations.recommendedProducts}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  {faqTranslations.fullSpectrumOil}
                                </Badge>
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  {faqTranslations.topicalCream}
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
            {faqTranslations.stillHaveQuestions}
          </h3>
          <p className="text-gray-600 mb-6">
            {faqTranslations.supportText}
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <span className="material-icons mr-2">contact_support</span>
            {faqTranslations.contactSupport}
          </Button>
        </div>
      </div>
    </section>
  );
};
