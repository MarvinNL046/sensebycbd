import { useState } from 'react';
import { useTranslation } from '../../../lib/i18n/useTranslation';

// FAQ item type
type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

/**
 * FAQ section for the homepage
 */
export const FAQSection = () => {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  
  // Toggle FAQ item
  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };
  
  // FAQ data
  const faqs: FAQItem[] = [
    {
      id: 'faq1',
      question: 'What is CBD?',
      answer: 'CBD (cannabidiol) is a naturally occurring compound found in the cannabis plant. Unlike THC, CBD is non-psychoactive, meaning it doesn\'t cause a "high." It\'s known for its potential therapeutic benefits, including pain relief, anxiety reduction, and improved sleep.'
    },
    {
      id: 'faq2',
      question: 'Is CBD legal?',
      answer: 'CBD derived from hemp (containing less than 0.3% THC) is legal at the federal level in many countries, including the United States. However, regulations vary by country and state/province, so it\'s important to check your local laws.'
    },
    {
      id: 'faq3',
      question: 'How do I use CBD products?',
      answer: 'Usage depends on the product type. CBD oils are typically placed under the tongue for 60-90 seconds before swallowing. Topicals are applied directly to the skin. Edibles and capsules are ingested. Always start with a low dose and gradually increase as needed.'
    },
    {
      id: 'faq4',
      question: 'Will CBD make me feel high?',
      answer: 'No, CBD does not produce the psychoactive effects associated with THC. Our products contain less than 0.3% THC, which is not enough to cause intoxication. You may feel relaxed or experience pain relief, but you won\'t feel "high."'
    },
    {
      id: 'faq5',
      question: 'How long does it take for CBD to work?',
      answer: 'The onset time varies by product and individual. Sublingual oils typically take effect within 15-30 minutes. Topicals may work within minutes for localized relief. Edibles and capsules can take 1-2 hours as they pass through the digestive system.'
    },
    {
      id: 'faq6',
      question: 'Are there any side effects?',
      answer: 'CBD is generally well-tolerated, but some people may experience mild side effects such as drowsiness, dry mouth, or changes in appetite. CBD can also interact with certain medications, so consult with a healthcare professional if you\'re taking prescription drugs.'
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-300 text-left"
                aria-expanded={openId === faq.id}
              >
                <span className="text-lg font-heading font-semibold text-primary">
                  {faq.question}
                </span>
                <span className="material-icons text-primary transition-transform duration-300" style={{
                  transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  expand_more
                </span>
              </button>
              
              <div 
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openId === faq.id ? '500px' : '0',
                  opacity: openId === faq.id ? 1 : 0
                }}
              >
                <div className="p-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
