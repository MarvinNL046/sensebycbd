import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';

/**
 * Header component with navigation and language switcher
 */
export const Header = () => {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, loading } = useAuth();
  const { openCart, getCartCount } = useCart();
  const cartCount = getCartCount();
  
  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-heading font-bold text-primary">
            SenseBy CBD
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.home}
            </Link>
            <Link href="/products" className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.products}
            </Link>
            <Link href="/about" className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.about}
            </Link>
            <Link href="/blog" className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.blog}
            </Link>
            <Link href="/contact" className="text-primary-dark hover:text-primary transition-colors">
              {t.navigation.contact}
            </Link>
          </nav>
          
          {/* Right side: Language, Cart, Account */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white border border-neutral rounded-md px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="nl">NL</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
            </select>
            
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
              href="/account" 
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
