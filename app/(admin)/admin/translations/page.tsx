import { Suspense } from 'react';
import TranslationsClient from './translations-client';
import { createClient } from '../../../../utils/supabase/server';

// Loading component
function TranslationsLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Translations Management - Admin Dashboard',
};

export default async function TranslationsAdminPage() {
  // Fetch products and categories from the server
  const supabase = await createClient();
  
  // Fetch products with their categories
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('name');
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Translations Management</h1>
      <Suspense fallback={<TranslationsLoading />}>
        <TranslationsClient 
          initialProducts={products || []} 
          initialCategories={categories || []} 
        />
      </Suspense>
    </div>
  );
}
