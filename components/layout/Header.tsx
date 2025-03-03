import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useSiteConfig } from '../../lib/use-site-config';

/**
 * Header component with navigation
 */
export const Header = () => {
  const { user, loading: authLoading } = useAuth();
  const { config, loading: configLoading } = useSiteConfig();
  
  // Navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' }
  ];
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-heading font-bold text-primary">
            {configLoading ? 'Loading...' : config.name}
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-primary-dark hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Right side: Account */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon (static, no functionality) */}
            <Link 
              href="/cart"
              className="text-primary-dark hover:text-primary relative"
              aria-label="View cart"
            >
              <span className="material-icons">shopping_cart</span>
            </Link>
            
            {/* Account Icon - Show different icon if logged in */}
            <Link 
              href={user ? '/account' : '/login'}
              className="text-primary-dark hover:text-primary flex items-center"
              title={user ? 'My Account' : 'Login'}
            >
              {!authLoading && (
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
