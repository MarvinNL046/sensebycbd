import { Suspense } from 'react';
import BlogClient from './blog-client';
import { createClient } from '../../../../utils/supabase/server';

// Loading component
function BlogLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Blog Beheer - Admin Dashboard',
};

export default async function BlogAdminPage() {
  // Fetch blog posts and categories from the server
  const supabase = await createClient();
  
  // Fetch blog posts with their categories and authors
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id, 
      title, 
      slug, 
      excerpt, 
      published, 
      published_at, 
      created_at,
      category_id,
      author_id,
      blog_categories (id, name),
      users (id, full_name)
    `)
    .order('created_at', { ascending: false });
  
  // Fetch all categories for the filter dropdown
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Blog Beheer</h1>
      <Suspense fallback={<BlogLoading />}>
        <BlogClient 
          initialPosts={posts || []} 
          initialCategories={categories || []} 
        />
      </Suspense>
    </div>
  );
}
