import { Metadata } from 'next';
import { generateMetadata as genMeta } from '../components/SEO';
import CheckoutClient from './checkout-client';

// Generate metadata for the page
export const metadata: Metadata = genMeta({
  title: "Checkout | SenseBy CBD",
  description: "Complete your purchase",
  keywords: "checkout, payment, order",
  canonicalPath: "/checkout"
});

/**
 * Checkout page component
 */
export default function CheckoutPage() {
  return <CheckoutClient />;
}
