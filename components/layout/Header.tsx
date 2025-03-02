import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '../../app/lib/useTranslation';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { getLanguageUrl } from '../../app/i18n';
import { supportedLanguages } from '../../middleware';

/**
 * Header component with navigation and language switcher
 */
export const Header = () => {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, loading } = useAuth();
  const { openCart, getCartCount } = useCart();
  const cartCount = getCartCount();
  
  const pathname = usePathname();
  
  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    // Get the new URL with the new locale
    const newUrl = getLanguageUrl(pathname || '/', newLocale);
    router.push(newUrl);
  };
  
  // Prefix links with the current locale
  const localizedHref = (path: string) => {
    return `/${locale}${path === '/' ? '' : path}`;
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={localizedHref('/')} className="text-2xl font-heading font-bold text-primary">
            SenseBy CBD
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href={localizedHref('/')} className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.home}
            </Link>
            <Link href={localizedHref('/products')} className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.products}
            </Link>
            <Link href={localizedHref('/about')} className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.about}
            </Link>
            <Link href={localizedHref('/blog')} className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.blog}
            </Link>
            <Link href={localizedHref('/contact')} className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.contact}
            </Link>
          </nav>
          
          {/* Right side: Language, Cart, Account */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex space-x-2">
              {supportedLanguages.map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang}`}
                  className={`px-2 py-1 text-sm rounded ${
                    locale === lang
                      ? 'bg-primary text-white'
                      : 'bg-white border border-neutral text-primary-dark hover:bg-gray-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </Link>
              ))}
            </div>
            
            {/* Cart Icon */}
            <button 
              onClick={openCart}
              className="text-primary-dark hover:text-primary relative"
              aria-label="Open cart"
            >
              <span className="material-icons">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Account Icon - Show different icon if logged in */}
            <Link 
              href={user ? localizedHref('/account') : localizedHref('/login')}
              className="text-primary-dark hover:text-primary flex items-center"
              title={user ? t.navigation.account : t.navigation.account}
            >
              {!loading && (
                <>
                  <span className="material-icons">
                    {user ? 'account_circle' : 'person'}
                  </span>
                  {user && (
                    <span className="ml-1 text-xs bg-primary text-white rounded-full w-2 h-2"></span>
                  )}
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
