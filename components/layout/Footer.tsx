import Link from 'next/link';
import { useSiteConfig } from '../../lib/use-site-config';

/**
 * Footer component with links and copyright
 */
export const Footer = () => {
  const { config, loading } = useSiteConfig();
  
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-heading font-bold mb-4">
              {loading ? 'Loading...' : config.name}
            </h3>
            <p className="text-neutral mb-4">
              {loading ? 'Loading...' : config.seo.defaultDescription}
            </p>
            <div className="flex space-x-4">
              {!loading && config.social.facebook && (
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <span className="material-icons">facebook</span>
                </a>
              )}
              {!loading && config.social.instagram && (
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <span className="material-icons">instagram</span>
                </a>
              )}
              {!loading && config.social.twitter && (
                <a href={config.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <span className="material-icons">twitter</span>
                </a>
              )}
              {!loading && config.social.youtube && (
                <a href={config.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <span className="material-icons">youtube</span>
                </a>
              )}
              {!loading && config.social.linkedin && (
                <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <span className="material-icons">linkedin</span>
                </a>
              )}
            </div>
          </div>
          
          {/* Shop links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-neutral hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products/category" className="text-neutral hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-neutral hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-neutral hover:text-white transition-colors">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-neutral hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-neutral hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help links */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-neutral hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-neutral hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter section - only show if enabled in config */}
        {!loading && config.features.newsletter && (
          <div className="mt-12 pt-6 border-t border-primary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1">
                <h4 className="text-lg font-heading font-bold mb-2">Stay Updated</h4>
                <p className="text-neutral">Subscribe to our newsletter for the latest products and news</p>
              </div>
              <div className="md:col-span-2">
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-2 rounded-l-md w-full focus:outline-none text-primary-dark"
                  />
                  <button
                    type="submit"
                    className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-r-md transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom section with copyright */}
        <div className="mt-12 pt-6 border-t border-primary">
          <div className="text-center">
            <p className="text-neutral text-sm">
              © {new Date().getFullYear()} {loading ? '' : config.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
