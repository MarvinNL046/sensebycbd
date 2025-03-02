import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/server';
import BlogEditClient from './blog-edit-client';

// Loading component
function BlogEditLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Bewerk Blogpost - Admin Dashboard',
};

export default async function BlogEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Fetch blog post
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      id, 
      title, 
      slug, 
      content,
      excerpt, 
      featured_image,
      published, 
      published_at, 
      created_at,
      category_id,
      author_id
    `)
    .eq('id', id)
    .single();
  
  // If post not found, return 404
  if (error || !post) {
    notFound();
  }
  
  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name');
  
  // Fetch tags for the dropdown
  const { data: tags } = await supabase
    .from('blog_tags')
    .select('id, name, slug')
    .order('name');
  
  // Fetch selected tags for this post
  const { data: selectedTags } = await supabase
    .from('blog_posts_tags')
    .select('tag_id')
    .eq('post_id', id);
  
  const selectedTagIds = selectedTags?.map(tag => tag.tag_id) || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Bewerk Blogpost</h1>
      <Suspense fallback={<BlogEditLoading />}>
        <BlogEditClient 
          post={post} 
          categories={categories || []} 
          tags={tags || []} 
          selectedTagIds={selectedTagIds}
        />
      </Suspense>
    </div>
  );
}
