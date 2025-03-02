import { Suspense } from 'react';
import { createClient } from '../../../../../utils/supabase/server';
import NewBlogClient from './new-blog-client';

// Loading component
function NewBlogLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Nieuwe Blogpost - Admin Dashboard',
};

export default async function NewBlogPage() {
  // Fetch categories for the dropdown
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name');
  
  // Fetch tags for the dropdown
  const { data: tags } = await supabase
    .from('blog_tags')
    .select('id, name, slug')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Nieuwe Blogpost</h1>
      <Suspense fallback={<NewBlogLoading />}>
        <NewBlogClient 
          categories={categories || []} 
          tags={tags || []} 
        />
      </Suspense>
    </div>
  );
}
