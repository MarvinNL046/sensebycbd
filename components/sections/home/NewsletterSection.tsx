import { useState } from 'react';
import { useTranslation } from '../../../lib/i18n/useTranslation';

/**
 * Newsletter signup section for the homepage
 */
export const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
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
  
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t.newsletter.title}
          </h2>
          <p className="text-lg mb-8 text-white/80">
            {t.newsletter.subtitle}
          </p>
          
          {status === 'success' ? (
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <span className="material-icons text-4xl mb-2">check_circle</span>
              <p className="text-lg">{t.newsletter.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
              <div className="flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={status === 'loading'}
                />
                {status === 'error' && (
                  <p className="text-red-300 text-sm mt-1 text-left">
                    {errorMessage}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-primary font-bold py-3 px-6 rounded-lg transition-colors duration-300"
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
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
