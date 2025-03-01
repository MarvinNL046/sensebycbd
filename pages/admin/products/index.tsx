import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types/product';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpDown,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function ProductsAdmin() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch categories first
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');
        
        setCategories(categoriesData || []);
        
        // Fetch products with their categories
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) {
          throw error;
        }
        
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [sortField, sortDirection]);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || 
      (product.categories && product.categories.slug === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  // Handle sort
  const handleSort = (field: 'name' | 'price' | 'stock' | 'created_at') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProductId);
      
      if (error) {
        throw error;
      }
      
      // Remove product from state
      setProducts(products.filter(p => p.id !== deleteProductId));
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setDeleteError(error.message || 'Failed to delete product');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <AdminLayout title="Products Management">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Add Product Button */}
        <Link href="/admin/products/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      
      {/* Products Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      Stock
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.categories?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                        {product.sale_price && (
                          <div className="text-sm text-red-600">{formatCurrency(product.sale_price)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/products/${product.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setDeleteProductId(product.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{deleteError}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteProductId(null);
                  setDeleteError('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteProduct}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
