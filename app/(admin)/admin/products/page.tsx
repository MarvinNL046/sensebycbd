import { Suspense } from 'react';
import ProductsClient from './products-client';
import { createClient } from '../../../../utils/supabase/server';

// Loading component
function ProductsLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Products Management - Admin Dashboard',
};

export default async function ProductsAdminPage() {
  // Fetch categories from the server
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Products Management</h1>
      <Suspense fallback={<ProductsLoading />}>
        <ProductsClient initialCategories={categories || []} />
      </Suspense>
    </div>
  );
}
