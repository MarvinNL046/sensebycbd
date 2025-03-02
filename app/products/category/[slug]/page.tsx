import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCategoryBySlug, getCategories, getProducts } from '../../../../lib/db';
import { ProductFilter } from '../../../../types/product';
import { getBaseCategorySlug, getTranslatedCategorySlug } from '../../../../lib/utils/slugs';
import { generateMetadata as seoMetadata } from '../../../components/SEO';
import CategoryClient from './category-client';
import CategoryNotFound from './not-found';

// Loading fallback
function CategoryLoading() {
  return (
    <div className="container-custom py-12">
      {/* Category Header Skeleton */}
      <div className="mb-8 text-center">
        <div className="animate-pulse bg-gray-200 h-10 w-1/3 mx-auto rounded-lg mb-4"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-1/2 mx-auto rounded-lg"></div>
      </div>
      
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!params?.slug) {
    return seoMetadata({
      title: "Category Not Found | SenseBy CBD",
      description: "The requested category could not be found.",
      keywords: "CBD, category not found",
      canonicalPath: "/products"
    });
  }
  
  // Convert translated slug to base slug if needed
  const baseSlug = getBaseCategorySlug(params.slug, 'en');
  
  // Fetch category data
  const { data: category, error } = await getCategoryBySlug(baseSlug, 'en');
  
  if (error || !category) {
    return seoMetadata({
      title: "Category Not Found | SenseBy CBD",
      description: "The requested category could not be found.",
      keywords: "CBD, category not found",
      canonicalPath: "/products"
    });
  }
  
  return seoMetadata({
    title: `${category.name} | SenseBy CBD Products`,
    description: `Browse our selection of premium ${category.name} products. High-quality, lab-tested CBD for natural relief and wellness.`,
    keywords: `CBD, ${category.name}, buy CBD, CBD products`,
    canonicalPath: `/products/category/${params.slug}`,
    ogImage: category.image_url || ''
  });
}

// Disable static generation for now to fix build issues
// export async function generateStaticParams() {
//   const { data: categories } = await getCategories('en');
//   
//   if (!categories || categories.length === 0) return [];
//   
//   // For each category, generate params for each locale
//   return categories.flatMap(category => {
//     if (!category || !category.slug) return [];
//     
//     return ['en', 'nl', 'de', 'fr'].map(locale => ({
//       slug: getTranslatedCategorySlug(category.slug, locale)
//     }));
//   });
// }

// Fetch category data
async function getCategoryData(slug: string, locale = 'en') {
  // Convert translated slug to base slug if needed
  const baseSlug = getBaseCategorySlug(slug, locale);
  
  // Fetch category data with locale for translations
  const { data: category, error: categoryError } = await getCategoryBySlug(baseSlug, locale);
  
  if (categoryError || !category) {
    return { category: null, products: [] };
  }
  
  // Fetch products in this category
  const filter: ProductFilter = {
    category: category.slug,
  };
  
  // Pass locale to get translated products
  const { data: products, error: productsError } = await getProducts(filter, locale);
  
  if (productsError) {
    return { category, products: [] };
  }
  
  return { category, products: products || [] };
}

// Category page component
export default async function CategoryPage({ params }: { params: { slug: string } }) {
  if (!params?.slug) {
    return <CategoryNotFound />;
  }
  
  // Fetch category data
  const { category, products } = await getCategoryData(params.slug);
  
  // If category not found
  if (!category) {
    return <CategoryNotFound />;
  }
  
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryClient category={category} products={products} />
    </Suspense>
  );
}
