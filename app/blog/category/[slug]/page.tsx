import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata as seoMetadata } from '../../../components/SEO';
import { getBlogPosts, getBlogCategories, getBlogCategoryBySlug } from '../../../../lib/mockDb';
import BlogCategoryClient from './blog-category-client';
import BlogCategoryNotFound from './not-found';

// Loading fallback
function BlogCategoryLoading() {
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
          
          <div className="space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-60 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
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

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!params?.slug) {
    return seoMetadata({
      title: 'Category Not Found | SenseBy CBD Blog',
      description: 'The requested blog category could not be found.',
      keywords: 'CBD blog, blog category not found',
      canonicalPath: '/blog'
    });
  }
  
  const { data: category, error } = await getBlogCategoryBySlug(params.slug);
  
  if (error || !category) {
    return seoMetadata({
      title: 'Category Not Found | SenseBy CBD Blog',
      description: 'The requested blog category could not be found.',
      keywords: 'CBD blog, blog category not found',
      canonicalPath: '/blog'
    });
  }
  
  return seoMetadata({
    title: `Category: ${category.name} | SenseBy CBD Blog`,
    description: `Browse all CBD articles in the ${category.name.toLowerCase()} category`,
    keywords: `CBD blog, ${category.name}, CBD articles, CBD research`,
    canonicalPath: `/blog/category/${params.slug}`
  });
}

// Generate static params for all blog categories
export async function generateStaticParams() {
  const { data: categories } = await getBlogCategories();
  
  if (!categories || categories.length === 0) return [];
  
  return categories.map(category => ({
    slug: category.slug
  }));
}

// Fetch blog category data
async function getBlogCategoryData(slug: string) {
  const { data: category, error } = await getBlogCategoryBySlug(slug);
  
  if (error || !category) {
    return { category: null, posts: [], categories: [] };
  }
  
  const { data: posts = [] } = await getBlogPosts({ category: slug });
  const { data: categories = [] } = await getBlogCategories();
  
  return { category, posts, categories };
}

// Blog category page component
export default async function BlogCategoryPage({ params }: { params: { slug: string } }) {
  if (!params?.slug) {
    return <BlogCategoryNotFound />;
  }
  
  // Fetch blog category data
  const { category, posts, categories } = await getBlogCategoryData(params.slug);
  
  // If category not found
  if (!category) {
    return <BlogCategoryNotFound />;
  }
  
  return (
    <Suspense fallback={<BlogCategoryLoading />}>
      <BlogCategoryClient category={category} posts={posts} categories={categories} />
    </Suspense>
  );
}
