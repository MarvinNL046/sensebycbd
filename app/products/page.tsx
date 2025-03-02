import { Suspense } from 'react';
import { getProducts, getCategories, extractCbdPercentages } from '../../lib/db';
import { Product, Category } from '../../types/product';
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '../components/SEO';
import ProductsClient from './products-client';

// Generate metadata for the page
export const metadata: Metadata = genMeta({
  title: "Shop CBD Products | SenseBy CBD",
  description: "Browse our selection of premium CBD products including oils, topicals, edibles, and more. Lab-tested, high-quality CBD for wellness and relief.",
  keywords: "buy CBD, CBD shop, CBD products, CBD oil, CBD cream, CBD edibles, CBD capsules",
  canonicalPath: "/products"
});

// Loading fallback
function ProductsLoading() {
  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
      </div>
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// Fetch data for the page
async function getProductsData(locale = 'en') {
  // Fetch all products with locale for translations
  const { data: products, error: productsError } = await getProducts(undefined, locale);
  
  if (productsError) {
    throw new Error('Failed to fetch products');
  }
  
  // Fetch all categories with locale for translations
  const { data: categories, error: categoriesError } = await getCategories(locale);
  
  if (categoriesError) {
    throw new Error('Failed to fetch categories');
  }
  
  // Extract CBD percentages
  const { data: cbdPercentages, error: percentagesError } = await extractCbdPercentages();
  
  if (percentagesError) {
    throw new Error('Failed to extract CBD percentages');
  }
  
  return {
    initialProducts: products || [],
    categories: categories || [],
    cbdPercentages: cbdPercentages || [],
  };
}

export default async function ProductsPage() {
  // Fetch data
  const { initialProducts, categories, cbdPercentages } = await getProductsData();
  
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient 
        initialProducts={initialProducts} 
        categories={categories} 
        cbdPercentages={cbdPercentages} 
      />
    </Suspense>
  );
}
