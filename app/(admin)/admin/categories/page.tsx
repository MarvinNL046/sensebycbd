import { Suspense } from 'react';
import CategoriesClient from './categories-client';
import { createClient } from '../../../../utils/supabase/server';

// Loading component
function CategoriesLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Categories Management - Admin Dashboard',
};

export default async function CategoriesAdminPage() {
  // Fetch categories from the server
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Categories Management</h1>
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesClient initialCategories={categories || []} />
      </Suspense>
    </div>
  );
}
