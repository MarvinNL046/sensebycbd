'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { AlertCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  category_id: string | null;
  author_id: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditClientProps {
  post: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
  selectedTagIds: string[];
}

export default function BlogEditClient({ post, categories, tags, selectedTagIds }: BlogEditClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt || '');
  const [slug, setSlug] = useState(post.slug);
  const [categoryId, setCategoryId] = useState(post.category_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds);
  const [featuredImage, setFeaturedImage] = useState(post.featured_image || '');
  const [published, setPublished] = useState(post.published);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Only auto-generate slug if it hasn't been manually edited
    if (slug === post.slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Handle tag selection
  const handleTagChange = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      
      // Validate required fields
      if (!title || !content || !slug || !categoryId) {
        throw new Error('Vul alle verplichte velden in');
      }
      
      // Update blog post
      const { error: postError } = await supabase
        .from('blog_posts')
        .update({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          featured_image: featuredImage || null,
          category_id: categoryId,
          published,
          published_at: published ? (post.published_at || new Date().toISOString()) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
      
      if (postError) throw postError;
      
      // Delete existing tag associations
      const { error: deleteTagsError } = await supabase
        .from('blog_posts_tags')
        .delete()
        .eq('post_id', post.id);
      
      if (deleteTagsError) throw deleteTagsError;
      
      // Add new tag associations
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('blog_posts_tags')
          .insert(tagInserts);
        
        if (tagError) throw tagError;
      }
      
      // Redirect to blog list
      router.push('/admin/blog');
      router.refresh();
      
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      setError(err.message || 'Er is een fout opgetreden bij het bijwerken van de blogpost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          
          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-vriendelijke naam voor de blogpost
            </p>
          </div>
          
          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Samenvatting
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Inhoud <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              HTML is toegestaan voor opmaak
            </p>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecteer een categorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <label
                  key={tag.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } cursor-pointer transition-colors`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagChange(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
          
          {/* Featured Image */}
          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL
            </label>
            <input
              id="featuredImage"
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {/* Published Status */}
          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Gepubliceerd
            </label>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/blog')}
              disabled={loading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Bezig met opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
