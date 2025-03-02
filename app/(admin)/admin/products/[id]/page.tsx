import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductEditClient from './product-edit-client';
import { createClient } from '../../../../../utils/supabase/server';

// Loading component
function ProductEditLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Edit Product - Admin Dashboard',
};

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Fetch product data from the server
  const supabase = await createClient();
  
  // Fetch product
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  // If product not found, return 404
  if (error || !product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Product: {product.name}</h1>
      <Suspense fallback={<ProductEditLoading />}>
        <ProductEditClient product={product} categories={categories || []} />
      </Suspense>
    </div>
  );
}
