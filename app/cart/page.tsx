import { Metadata } from 'next';
import { generateMetadata as genMeta } from '../components/SEO';
import CartClient from './cart-client';

// Generate metadata for the page
export const metadata: Metadata = genMeta({
  title: "Cart | SenseBy CBD",
  description: "Your shopping cart",
  keywords: "cart, shopping cart, checkout",
  canonicalPath: "/cart"
});

/**
 * Cart page component
 */
export default function CartPage() {
  return <CartClient />;
}
