import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import ProductForm from '../../../components/admin/products/ProductForm';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types/product';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 text-primary hover:underline"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <p className="text-yellow-700">Product not found</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 text-primary hover:underline"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Product: ${product.name}`}>
      <ProductForm product={product} isEditing={true} />
    </AdminLayout>
  );
}
