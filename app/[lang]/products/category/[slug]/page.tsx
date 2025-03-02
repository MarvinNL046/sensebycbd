import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../../../middleware';
import { getProducts, getCategories, getCategoryBySlug, extractCbdPercentages } from '../../../../../lib/db';
import { generateMetadata as seoMetadata } from '../../../../components/SEO';
import { notFound } from 'next/navigation';
import CategoryClient from '../../../../products/category/[slug]/category-client';
import { Category, Product } from '../../../../../types/product';

// Loading fallback
function CategoryLoading() {
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
            
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  if (!params?.slug) {
    return seoMetadata({
      title: "Category Not Found | SenseBy CBD",
      description: "The requested category could not be found.",
      keywords: "CBD, category not found",
      canonicalPath: "/products"
    });
  }
  
  // Fetch category data
  const { data: categoryData, error } = await getCategoryBySlug(params.slug);
  
  if (error || !categoryData) {
    return seoMetadata({
      title: "Category Not Found | SenseBy CBD",
      description: "The requested category could not be found.",
      keywords: "CBD, category not found",
      canonicalPath: "/products"
    });
  }
  
  // Type assertion
  const category = categoryData as Category;
  
  return seoMetadata({
    title: `${category.name} | SenseBy CBD Products`,
    description: category.description || `Shop premium ${category.name} products from SenseBy CBD. High-quality CBD products with lab-verified purity.`,
    keywords: `CBD, ${category.name}, buy CBD, CBD products`,
    canonicalPath: `/${lang}/products/category/${params.slug}`,
    ogImage: category.image_url || undefined
  });
}

// Fetch data for the page
async function getCategoryData(slug: string, locale = 'en') {
  // Fetch category data
  const { data: categoryData, error } = await getCategoryBySlug(slug);
  
  if (error || !categoryData) {
    return { 
      category: null, 
      products: [], 
      categories: [],
      cbdPercentages: []
    };
  }
  
  // Type assertion
  const category = categoryData as Category;
  
  // Fetch products for this category
  const { data: products } = await getProducts({ category: slug });
  
  // Fetch all categories for the sidebar
  const { data: categories } = await getCategories();
  
  // Fetch CBD percentages for filtering
  const { data: cbdPercentages } = await extractCbdPercentages();
  
  return {
    category,
    products: products || [],
    categories: categories || [],
    cbdPercentages: cbdPercentages || []
  };
}

// Category page component
export default async function CategoryPage({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}) {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  if (!params?.slug) {
    notFound();
  }
  
  // Fetch category data
  const { category, products, categories, cbdPercentages } = await getCategoryData(params.slug, lang);
  
  // If category not found
  if (!category) {
    notFound();
  }
  
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryClient 
        category={category} 
        products={products as Product[]} 
      />
    </Suspense>
  );
}
