'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '../../../../utils/supabase/client';
import { Product } from '../../../../types/product';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { DataTable } from '../../../../components/ui/data-table';
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

interface ProductsClientProps {
  initialCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export default function ProductsClient({ initialCategories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState(initialCategories);
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      
      try {
        const supabase = createClient();
        
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
    
    fetchProducts();
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
      const supabase = createClient();
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

  // Define columns for DataTable
  const columns = [
    {
      accessorKey: "image_url",
      header: "Image",
      cell: ({ row }: { row: any }) => {
        const imageUrl = row.getValue("image_url");
        return (
          <div className="relative h-12 w-12 rounded overflow-hidden">
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={row.getValue("name")}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: any }) => {
        const name = row.getValue("name");
        const description = row.original.description;
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {description.substring(0, 50)}...
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categories.name",
      header: "Category",
      cell: ({ row }: { row: any }) => {
        return row.original.categories?.name || 'Uncategorized';
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: { row: any }) => {
        const price = parseFloat(row.getValue("price"));
        const salePrice = row.original.sale_price;
        return (
          <div>
            <div>{formatCurrency(price)}</div>
            {salePrice && (
              <div className="text-sm text-red-600">{formatCurrency(salePrice)}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: { row: any }) => {
        const stock = parseInt(row.getValue("stock"));
        return (
          <div className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                stock > 10
                  ? "bg-green-100 text-green-800"
                  : stock > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {stock} in stock
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2">
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
        );
      },
    },
  ];

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
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
          <DataTable
            columns={columns}
            data={filteredProducts}
            searchKey="name"
            searchPlaceholder="Search products..."
          />
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
    </div>
  );
}
