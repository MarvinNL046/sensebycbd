import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../../../middleware';
import { getBlogPosts, getBlogCategories, getBlogCategoryBySlug } from '../../../../../lib/db';
import BlogCategoryClient from '../../../../blog/category/[slug]/blog-category-client';
import { BlogCategory } from '../../../../../types/blog';

// Define metadata for the blog category page
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  // Get category data for the title
  const { data: category } = await getBlogCategoryBySlug(params.slug);
  const categoryName = category?.name || 'Category';
  
  return {
    title: `${categoryName} | SenseBy CBD Blog`,
    description: `Read articles about ${categoryName.toLowerCase()} from SenseBy CBD's educational blog.`,
  };
}

// Loading fallback
function CategoryLoading() {
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
          
          <div className="space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-60 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fetch data for the page
async function getCategoryData(slug: string) {
  const { data: category } = await getBlogCategoryBySlug(slug);
  const { data: posts } = await getBlogPosts({ category: slug });
  const { data: categories } = await getBlogCategories();
  
  return {
    category: category || null,
    posts: posts || [],
    categories: categories || [],
  };
}

// Blog category page component
export default async function BlogCategoryPage({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}) {
  // Fetch data
  const { category, posts, categories } = await getCategoryData(params.slug);
  
  // If category is not found, create a default one
  const safeCategory: BlogCategory = category || {
    id: 'not-found',
    name: 'Category Not Found',
    slug: params.slug,
    description: 'This category could not be found.',
    created_at: new Date().toISOString()
  };
  
  return (
    <Suspense fallback={<CategoryLoading />}>
      <BlogCategoryClient 
        category={safeCategory} 
        posts={posts} 
        categories={categories} 
      />
    </Suspense>
  );
}
