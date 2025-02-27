import Link from 'next/link';
import { useTranslation } from '../../lib/i18n/useTranslation';

/**
 * Footer component with links and copyright
 */
export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">SenseBy CBD</h3>
            <p className="text-neutral mb-4">
              Premium CBD products for pain relief and wellness.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <span className="material-icons">facebook</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <span className="material-icons">instagram</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <span className="material-icons">twitter</span>
              </a>
            </div>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral hover:text-white transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral hover:text-white transition-colors">
                  {t.footer.blog}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-neutral hover:text-white transition-colors">
                  {t.footer.careers}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral hover:text-white transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t.footer.help}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-neutral hover:text-white transition-colors">
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral hover:text-white transition-colors">
                  {t.footer.shipping}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-neutral hover:text-white transition-colors">
                  {t.footer.returns}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t.newsletter.title}</h4>
            <p className="text-neutral mb-4">{t.newsletter.subtitle}</p>
            <form className="flex">
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                className="px-4 py-2 rounded-l-md w-full focus:outline-none text-primary-dark"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-r-md transition-colors"
              >
                {t.newsletter.button}
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom section with copyright and legal links */}
        <div className="mt-12 pt-6 border-t border-primary">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral text-sm mb-4 md:mb-0">
              {t.footer.copyright}
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-neutral hover:text-white text-sm transition-colors">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="text-neutral hover:text-white text-sm transition-colors">
                {t.footer.privacy}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
