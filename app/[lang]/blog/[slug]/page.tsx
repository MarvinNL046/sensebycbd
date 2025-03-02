import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../../middleware';
import { getBlogPostBySlug, getBlogComments, getRecentBlogPosts } from '../../../../lib/db';
import BlogPostClient from '../../../blog/[slug]/blog-post-client';
import { BlogPost } from '../../../../types/blog';

// Define metadata for the blog post page
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  // Get post data for the title
  const { data: post } = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | SenseBy CBD Blog',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${post.title} | SenseBy CBD Blog`,
    description: post.excerpt || `Read about ${post.title} on SenseBy CBD's educational blog.`,
    openGraph: post.featured_image ? {
      images: [post.featured_image],
    } : undefined,
  };
}

// Loading fallback
function PostLoading() {
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-80 bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
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
async function getPostData(slug: string) {
  const { data: post } = await getBlogPostBySlug(slug);
  const { data: recentPosts } = await getRecentBlogPosts(5);
  const { data: comments } = post ? await getBlogComments(post.id) : { data: [] };
  
  // Just use the data as is and let the client component handle any differences
  return {
    post: post || null,
    recentPosts: (recentPosts || []) as any[],
    comments: comments || [],
  };
}

// Blog post page component
export default async function BlogPostPage({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}) {
  // Fetch data
  const { post, recentPosts, comments } = await getPostData(params.slug);
  
  // If post is not found, create a default one
  const safePost: BlogPost = post || {
    id: 'not-found',
    title: 'Post Not Found',
    slug: params.slug,
    content: 'The requested blog post could not be found.',
    author_id: '',
    category_id: '',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return (
    <Suspense fallback={<PostLoading />}>
      <BlogPostClient 
        post={safePost} 
        recentPosts={recentPosts} 
        comments={comments} 
      />
    </Suspense>
  );
}
