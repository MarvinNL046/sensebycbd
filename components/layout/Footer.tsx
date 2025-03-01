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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
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
          
          {/* Shop links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t.footer.shop}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-neutral hover:text-white transition-colors">
                  {t.footer.products}
                </Link>
              </li>
              <li>
                <Link href="/products/category" className="text-neutral hover:text-white transition-colors">
                  {t.footer.categories}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-neutral hover:text-white transition-colors">
                  {t.footer.cart}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-neutral hover:text-white transition-colors">
                  {t.footer.checkout}
                </Link>
              </li>
            </ul>
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
              <li>
                <Link href="/account" className="text-neutral hover:text-white transition-colors">
                  {t.footer.account}
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
              <li>
                <Link href="/terms" className="text-neutral hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter section */}
        <div className="mt-12 pt-6 border-t border-primary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <h4 className="text-lg font-heading font-bold mb-2">{t.newsletter.title}</h4>
              <p className="text-neutral">{t.newsletter.subtitle}</p>
            </div>
            <div className="md:col-span-2">
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
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-12 pt-6 border-t border-primary">
          <div className="text-center">
            <p className="text-neutral text-sm">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
