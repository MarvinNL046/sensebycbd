import { Suspense } from 'react';
import NewProductClient from './new-product-client';
import { createClient } from '../../../../../utils/supabase/server';

// Loading component
function NewProductLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Add New Product - Admin Dashboard',
};

export default async function NewProductPage() {
  // Fetch categories from the server
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Product</h1>
      <Suspense fallback={<NewProductLoading />}>
        <NewProductClient categories={categories || []} />
      </Suspense>
    </div>
  );
}
