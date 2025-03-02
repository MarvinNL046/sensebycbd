import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '../components/SEO';
import { getBlogPosts, getBlogCategories } from '../../lib/mockDb';
import BlogClient from './blog-client';

// Generate metadata for the page
export const metadata: Metadata = genMeta({
  title: 'Blog | SenseBy CBD',
  description: 'Read the latest articles about CBD benefits, research, and product guides.',
  keywords: 'CBD blog, CBD articles, CBD research, CBD benefits, CBD guides',
  canonicalPath: '/blog'
});

// Loading fallback
function BlogLoading() {
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
async function getBlogData() {
  const { data: posts } = await getBlogPosts();
  const { data: categories } = await getBlogCategories();
  
  return {
    posts: posts || [],
    categories: categories || [],
  };
}

// Blog page component
export default async function BlogPage() {
  // Fetch data
  const { posts, categories } = await getBlogData();
  
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogClient posts={posts} categories={categories} />
    </Suspense>
  );
}
