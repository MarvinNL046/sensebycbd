'use client';

import { useState, useEffect } from 'react';
import { Product, Category, ProductFilter } from '../../types/product';
import { useTranslation } from '../lib/useTranslation';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  cbdPercentages: string[];
}

/**
 * Client component for Products page with filtering and search functionality
 */
export default function ProductsClient({ 
  initialProducts, 
  categories, 
  cbdPercentages 
}: ProductsClientProps) {
  const { t } = useTranslation();
  
  // Create a local translation object with the necessary properties
  const translations = {
    title: "All Products",
    filter: "Filter",
    sort: "Sort",
    search: "Search products...",
    noResults: "No products found. Try adjusting your filters.",
    price: "Price",
    category: "Category",
    cbdPercentage: "CBD Percentage",
    sortOptions: {
      newest: "Newest",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low"
    },
    filters: {
      apply: "Apply Filters",
      clear: "Clear Filters",
      close: "Close"
    },
    priceRange: {
      min: "Min",
      max: "Max"
    },
    viewDetails: "View Details"
  };
  
  // State for products and filters
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  // Handle filter changes
  const handleCategoryChange = (slug: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === slug ? undefined : slug
    }));
  };
  
  const handleCbdPercentageChange = (percentage: string) => {
    const currentPercentages = filters.cbdPercentage || [];
    const newPercentages = currentPercentages.includes(percentage)
      ? currentPercentages.filter(p => p !== percentage)
      : [...currentPercentages, percentage];
    
    setFilters(prev => ({
      ...prev,
      cbdPercentage: newPercentages.length > 0 ? newPercentages : undefined
    }));
  };
  
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue
    }));
  };
  
  const handleSortChange = (sort: ProductFilter['sort']) => {
    setFilters(prev => ({
      ...prev,
      sort
    }));
  };
  
  const handleSearchChange = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined
    }));
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a server request
        // For now, we'll filter the initial products client-side
        let filtered = [...initialProducts];
        
        // Category filter
        if (filters.category) {
          filtered = filtered.filter(product => 
            product.categories?.slug === filters.category
          );
        }
        
        // Price range filter
        if (filters.minPrice !== undefined) {
          filtered = filtered.filter(product => 
            (product.sale_price || product.price) >= filters.minPrice!
          );
        }
        if (filters.maxPrice !== undefined) {
          filtered = filtered.filter(product => 
            (product.sale_price || product.price) <= filters.maxPrice!
          );
        }
        
        // CBD percentage filter
        if (filters.cbdPercentage && filters.cbdPercentage.length > 0) {
          filtered = filtered.filter(product => {
            const strength = product.specifications?.strength;
            if (!strength) return false;
            
            return filters.cbdPercentage!.some(percentage => 
              strength.includes(percentage)
            );
          });
        }
        
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Sorting
        if (filters.sort) {
          switch (filters.sort) {
            case 'price_asc':
              filtered.sort((a, b) => 
                (a.sale_price || a.price) - (b.sale_price || b.price)
              );
              break;
            case 'price_desc':
              filtered.sort((a, b) => 
                (b.sale_price || b.price) - (a.sale_price || a.price)
              );
              break;
            case 'newest':
              filtered.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              break;
          }
        }
        
        setProducts(filtered);
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    applyFilters();
  }, [filters, initialProducts]);
  
  return (
    <>
      
      <div className="container-custom py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-4 text-center">
            {translations.title}
          </h1>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <input
              type="text"
              placeholder={translations.search}
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* Filter Toggle */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>{translations.filter}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </Button>
            
            {/* Sort Dropdown */}
            <select
              value={filters.sort || ''}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{translations.sort}</option>
              <option value="newest">{translations.sortOptions.newest}</option>
              <option value="price_asc">{translations.sortOptions.priceAsc}</option>
              <option value="price_desc">{translations.sortOptions.priceDesc}</option>
            </select>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium mb-2">{translations.category}</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.slug}`}
                        checked={filters.category === category.slug}
                        onChange={() => handleCategoryChange(category.slug)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category.slug}`}>
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <h3 className="font-medium mb-2">{translations.price}</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="text-sm text-gray-600">
                      {translations.priceRange.min}
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      min="0"
                      value={filters.minPrice || ''}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="max-price" className="text-sm text-gray-600">
                      {translations.priceRange.max}
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      min="0"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* CBD Percentage Filter */}
              <div>
                <h3 className="font-medium mb-2">{translations.cbdPercentage}</h3>
                <div className="space-y-2">
                  {cbdPercentages.map((percentage) => (
                    <div key={percentage} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cbd-${percentage}`}
                        checked={filters.cbdPercentage?.includes(percentage) || false}
                        onChange={() => handleCbdPercentageChange(percentage)}
                        className="mr-2"
                      />
                      <label htmlFor={`cbd-${percentage}`}>
                        {percentage}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <Button 
                onClick={clearFilters}
                variant="outline"
              >
                {translations.filters.clear}
              </Button>
              <Button 
                onClick={() => setShowFilters(false)}
              >
                {translations.filters.close}
              </Button>
            </div>
          </div>
        )}
        
        {/* Active Filters */}
        {(filters.category || 
          filters.minPrice !== undefined || 
          filters.maxPrice !== undefined || 
          (filters.cbdPercentage && filters.cbdPercentage.length > 0)) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.category && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {categories.find(c => c.slug === filters.category)?.name}
                <button 
                  onClick={() => handleCategoryChange(filters.category!)}
                  className="ml-1"
                >
                  ✕
                </button>
              </Badge>
            )}
            
            {filters.minPrice !== undefined && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1"
              >
                Min: {formatPrice(filters.minPrice)}
                <button 
                  onClick={() => handlePriceChange('min', '')}
                  className="ml-1"
                >
                  ✕
                </button>
              </Badge>
            )}
            
            {filters.maxPrice !== undefined && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1"
              >
                Max: {formatPrice(filters.maxPrice)}
                <button 
                  onClick={() => handlePriceChange('max', '')}
                  className="ml-1"
                >
                  ✕
                </button>
              </Badge>
            )}
            
            {filters.cbdPercentage?.map(percentage => (
              <Badge 
                key={percentage}
                variant="secondary"
                className="flex items-center gap-1"
              >
                CBD: {percentage}
                <button 
                  onClick={() => handleCbdPercentageChange(percentage)}
                  className="ml-1"
                >
                  ✕
                </button>
              </Badge>
            ))}
            
            <Button 
              onClick={clearFilters}
              variant="ghost"
              className="text-sm h-6"
            >
              {translations.filters.clear}
            </Button>
          </div>
        )}
        
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-primary mr-2">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Link 
                    href={`/products/${product.slug}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      {translations.viewDetails}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{translations.noResults}</p>
          </div>
        )}
      </div>
    </>
  );
}
