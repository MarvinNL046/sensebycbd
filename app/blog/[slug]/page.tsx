import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '../../components/SEO';
import { getBlogPostBySlug, getBlogPosts, getBlogComments, getRecentBlogPosts } from '../../../lib/mockDb';
import BlogPostClient from './blog-post-client';
import BlogPostNotFound from './not-found';

// Loading fallback
function BlogPostLoading() {
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-80 bg-gray-200 animate-pulse"></div>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
              
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6 md:p-8">
            <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-6">
                <div className="flex justify-between mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
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
    return genMeta({
      title: 'Blog Post Not Found | SenseBy CBD',
      description: 'The requested blog post could not be found.',
      keywords: 'CBD blog, blog post not found',
      canonicalPath: '/blog'
    });
  }
  
  const { data: post, error } = await getBlogPostBySlug(params.slug);
  
  if (error || !post) {
    return genMeta({
      title: 'Blog Post Not Found | SenseBy CBD',
      description: 'The requested blog post could not be found.',
      keywords: 'CBD blog, blog post not found',
      canonicalPath: '/blog'
    });
  }
  
  return genMeta({
    title: `${post.title} | SenseBy CBD Blog`,
    description: `Read about ${post.title} in our CBD educational blog`,
    keywords: `CBD blog, ${post.title}, ${post.category?.name || ''}, CBD articles`,
    canonicalPath: `/blog/${params.slug}`,
    ogImage: post.featured_image || ''
  });
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const { data: posts } = await getBlogPosts();
  
  if (!posts || posts.length === 0) return [];
  
  return posts.map(post => ({
    slug: post.slug
  }));
}

// Fetch blog post data
async function getBlogPostData(slug: string) {
  const { data: post, error } = await getBlogPostBySlug(slug);
  
  if (error || !post) {
    return { post: null, comments: [], recentPosts: [] };
  }
  
  const { data: comments = [] } = await getBlogComments(post.id);
  const { data: recentPosts = [] } = await getRecentBlogPosts(5);
  
  // Filter out the current post from recent posts
  const filteredRecentPosts = recentPosts ? recentPosts.filter(recentPost => recentPost.id !== post.id) : [];
  
  return { post, comments, recentPosts: filteredRecentPosts };
}

// Blog post page component
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  if (!params?.slug) {
    return <BlogPostNotFound />;
  }
  
  // Fetch blog post data
  const { post, comments, recentPosts } = await getBlogPostData(params.slug);
  
  // If post not found
  if (!post) {
    return <BlogPostNotFound />;
  }
  
  return (
    <Suspense fallback={<BlogPostLoading />}>
      <BlogPostClient post={post} comments={comments} recentPosts={recentPosts} />
    </Suspense>
  );
}
