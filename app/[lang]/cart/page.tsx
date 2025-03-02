import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../middleware';
import CartClient from '../../cart/cart-client';

// Define metadata for the cart page
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  return {
    title: 'Shopping Cart | SenseBy CBD',
    description: 'Review and manage your shopping cart. Premium CBD products for pain relief and wellness.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

// Loading fallback
function CartLoading() {
  return (
    <div className="container-custom py-12">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-8 animate-pulse"></div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-0">
                <div className="h-20 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between font-bold">
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            
            <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart page component
export default function CartPage({ params }: { params: { lang: string } }) {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  return (
    <Suspense fallback={<CartLoading />}>
      <CartClient />
    </Suspense>
  );
}
