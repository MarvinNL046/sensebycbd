'use client';

import { Metadata } from 'next';
import { generateMetadata } from '../components/SEO';
import CheckoutClient from './checkout-client';
import { CartProvider } from '../../lib/cart-context';
import { AuthProvider } from '../../lib/auth-context';

// This page is now a client component and will be wrapped with CartProvider
// It's recommended to use the app/[lang]/checkout/page.tsx file instead
// This file is kept for backward compatibility

/**
 * Checkout page component
 */
export default function CheckoutPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutClient />
      </CartProvider>
    </AuthProvider>
  );
}
