'use client';

import { CartProvider } from '../../lib/cart-context';
import { AuthProvider } from '../../lib/auth-context';
import { Layout } from '../../components/layout/Layout';

/**
 * Client component wrapper for the layout
 * This separates the client components from the server components
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          {children}
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
