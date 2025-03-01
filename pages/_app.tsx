import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { AuthProvider } from '../lib/auth-context';
import { CartProvider } from '../lib/cart-context';
import { measureWebVitals } from '../lib/utils/analytics';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale, pathname } = router;
  
  // Check if the current page is an admin page or admin-related page
  const isAdminPage = pathname.startsWith('/admin') || pathname === '/debug-admin';
  
  // Initialize web vitals tracking
  useEffect(() => {
    measureWebVitals();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <CartProvider>
          {isAdminPage ? (
            // Admin pages don't need the main layout
            <Component {...pageProps} />
          ) : (
            // Non-admin pages use the main layout
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
