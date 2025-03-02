'use client';

import { Metadata } from 'next';
import { generateMetadata } from '../components/SEO';
import CartClient from './cart-client';
import { CartProvider } from '../../lib/cart-context';

// This page is now a client component and will be wrapped with CartProvider
// It's recommended to use the app/[lang]/cart/page.tsx file instead
// This file is kept for backward compatibility

/**
 * Cart page component
 */
export default function CartPage() {
  return (
    <CartProvider>
      <CartClient />
    </CartProvider>
  );
}
